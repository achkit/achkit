"""Reconciliation validator mirroring the JS validator."""
from __future__ import annotations

import re
from math import ceil
from typing import Any, Dict, List

from .fields import RECORD_LEN, BLOCKING_FACTOR
from .parse import parse


def is_valid_routing(routing: str) -> bool:
    d = re.sub(r"\D", "", routing)
    if len(d) != 9:
        return False
    w = [3, 7, 1, 3, 7, 1, 3, 7, 1]
    return sum(int(d[i]) * w[i] for i in range(9)) % 10 == 0


def _hash_trim(h: int) -> str:
    s = str(h)
    return s[-10:] if len(s) > 10 else s


def validate(text: str) -> Dict[str, Any]:
    errors: List[Dict[str, Any]] = []

    def push(code, field, message, batch=None):
        errors.append({"code": code, "field": field, "message": message, "batch": batch})

    rows = [r for r in text.splitlines() if r]
    for i, r in enumerate(rows):
        if len(r) != RECORD_LEN:
            push("BAD_RECORD_LEN", f"line {i + 1}", f"record is {len(r)} chars, expected {RECORD_LEN}")
    if len(rows) % BLOCKING_FACTOR != 0:
        push("BAD_BLOCKING", "file", f"file has {len(rows)} records, not a multiple of {BLOCKING_FACTOR}")

    try:
        file = parse(text)
    except Exception as e:
        push(getattr(e, "code", "PARSE_ERROR"), "file", str(e))
        return {"ok": False, "errors": errors}

    file_hash = 0
    file_debit = 0
    file_credit = 0
    file_entry_addenda = 0

    for bi, b in enumerate(file["batches"]):
        hsh = 0
        debit = 0
        credit = 0
        count = 0
        for e in b["entries"]:
            count += 1
            hsh += int(e["routing"][:8])
            if not is_valid_routing(e["routing"]):
                push("BAD_ROUTING_CHECKSUM", f"entry {e['name']}", f"routing {e['routing']} fails ABA checksum", bi + 1)
            second = e["txn_code"] % 10
            if second in (2, 3):
                credit += e["amount_cents"]
            elif second in (7, 8):
                debit += e["amount_cents"]
            count += len(e["addenda"])
        c = b.get("control")
        if c:
            if c["entry_addenda_count"] != count:
                push("BAD_BATCH_COUNT", f"batch {bi + 1} control", f"entry/addenda count {c['entry_addenda_count']} != {count}", bi + 1)
            if int(c["entry_hash"]) != int(_hash_trim(hsh)):
                push("BAD_ENTRY_HASH", f"batch {bi + 1} control", f"entry hash {c['entry_hash']} != {_hash_trim(hsh)}", bi + 1)
            if c["total_debit"] != debit:
                push("BAD_BATCH_DEBIT", f"batch {bi + 1} control", f"total debit {c['total_debit']} != {debit}", bi + 1)
            if c["total_credit"] != credit:
                push("BAD_BATCH_CREDIT", f"batch {bi + 1} control", f"total credit {c['total_credit']} != {credit}", bi + 1)
        file_hash += hsh
        file_debit += debit
        file_credit += credit
        file_entry_addenda += count

    fc = file.get("control")
    if fc:
        if fc["batch_count"] != len(file["batches"]):
            push("BAD_FILE_BATCH_COUNT", "file control", f"batch count {fc['batch_count']} != {len(file['batches'])}")
        if fc["entry_addenda_count"] != file_entry_addenda:
            push("BAD_FILE_COUNT", "file control", f"entry/addenda count {fc['entry_addenda_count']} != {file_entry_addenda}")
        if int(fc["entry_hash"]) != int(_hash_trim(file_hash)):
            push("BAD_FILE_HASH", "file control", f"entry hash {fc['entry_hash']} != {_hash_trim(file_hash)}")
        if fc["total_debit"] != file_debit:
            push("BAD_FILE_DEBIT", "file control", f"total debit {fc['total_debit']} != {file_debit}")
        if fc["total_credit"] != file_credit:
            push("BAD_FILE_CREDIT", "file control", f"total credit {fc['total_credit']} != {file_credit}")
        expected_blocks = ceil(len(rows) / BLOCKING_FACTOR)
        if fc["block_count"] != expected_blocks:
            push("BAD_BLOCK_COUNT", "file control", f"block count {fc['block_count']} != {expected_blocks}")

    return {"ok": len(errors) == 0, "errors": errors}
