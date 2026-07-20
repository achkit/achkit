"""Strict parser: NACHA text back into typed dicts, mirroring the JS parser."""
from __future__ import annotations

import re
from typing import Any, Dict, List

from .fields import RECORD_LEN, AchError


def _int(s: str) -> int:
    d = re.sub(r"\D", "", s)
    return int(d) if d else 0


def parse(text: str) -> Dict[str, Any]:
    rows = [r for r in text.splitlines() if r]
    file: Dict[str, Any] | None = None
    batch: Dict[str, Any] | None = None
    entry: Dict[str, Any] | None = None

    for row in rows:
        if re.fullmatch(r"9+", row):
            continue  # block filler
        if len(row) != RECORD_LEN:
            raise AchError("BAD_RECORD_LEN", f"record is {len(row)} chars, expected {RECORD_LEN}")
        t = row[0]
        if t == "1":
            file = {
                "destination_routing": row[3:13].strip(),
                "origin_routing": row[13:23].strip(),
                "creation_date": row[23:29],
                "creation_time": row[29:33],
                "file_id_modifier": row[33:34],
                "batches": [],
            }
        elif t == "5":
            batch = {
                "service_class": _int(row[1:4]),
                "company_name": row[4:20].strip(),
                "company_id": row[40:50].strip(),
                "sec": row[50:53].strip(),
                "description": row[53:63].strip(),
                "effective_date": row[69:75],
                "origin_dfi": row[79:87],
                "batch_number": _int(row[87:94]),
                "entries": [],
                "control": None,
            }
            if file:
                file["batches"].append(batch)
        elif t == "6":
            entry = {
                "txn_code": _int(row[1:3]),
                "routing": row[3:12],
                "account": row[12:29].strip(),
                "amount_cents": _int(row[29:39]),
                "id_number": row[39:54].strip(),
                "name": row[54:76].strip(),
                "addenda_flag": row[78] == "1",
                "trace_number": row[79:94],
                "addenda": [],
            }
            if batch:
                batch["entries"].append(entry)
        elif t == "7":
            if entry is not None:
                entry["addenda"].append({
                    "type": row[1:3],
                    "info": row[3:83].strip(),
                    "sequence": _int(row[83:87]),
                    "entry_detail_sequence": row[87:94],
                })
        elif t == "8":
            if batch is not None:
                batch["control"] = {
                    "entry_addenda_count": _int(row[4:10]),
                    "entry_hash": row[10:20],
                    "total_debit": _int(row[20:32]),
                    "total_credit": _int(row[32:44]),
                }
        elif t == "9":
            if file is not None:
                file["control"] = {
                    "batch_count": _int(row[1:7]),
                    "block_count": _int(row[7:13]),
                    "entry_addenda_count": _int(row[13:21]),
                    "entry_hash": row[21:31],
                    "total_debit": _int(row[31:43]),
                    "total_credit": _int(row[43:55]),
                }
        else:
            raise AchError("UNKNOWN_RECORD", f"unknown record type '{t}'")

    if file is None:
        raise AchError("NO_FILE_HEADER", "no file header (type 1) record found")
    return file
