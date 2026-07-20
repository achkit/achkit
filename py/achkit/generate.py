"""Builder + renderer producing a spec-correct NACHA file byte-identical to the
achkit JS reference implementation."""
from __future__ import annotations

import re
from dataclasses import dataclass, field as dfield
from datetime import datetime
from math import ceil
from typing import List, Optional

from .fields import alnum, num, money, digits, RECORD_LEN, BLOCKING_FACTOR, AchError

TXN = {
    "checking:credit": 22,
    "checking:debit": 27,
    "savings:credit": 32,
    "savings:debit": 37,
    "checking:credit:prenote": 23,
    "checking:debit:prenote": 28,
    "savings:credit:prenote": 33,
    "savings:debit:prenote": 38,
}


def _to_yymmdd(iso: str) -> str:
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", iso)
    if not m:
        raise AchError("BAD_DATE", f"date must be YYYY-MM-DD, got '{iso}'")
    return m.group(1)[2:] + m.group(2) + m.group(3)


def _service_class(entries) -> int:
    has_c = any(e.direction == "credit" for e in entries)
    has_d = any(e.direction == "debit" for e in entries)
    if has_c and has_d:
        return 200
    return 220 if has_c else 225


@dataclass
class _Addenda:
    info: str
    sequence: int


@dataclass
class _Entry:
    txn_code: int
    routing: str
    check_digit: str
    account: str
    amount_cents: int
    id_number: str
    name: str
    addenda_flag: bool
    trace_number: str
    direction: str
    addenda: List[_Addenda]


@dataclass
class _Batch:
    company_name: str
    discretionary_data: str
    company_id: str
    sec: str
    description: str
    descriptive_date: str
    effective_date: str
    origin_dfi8: str
    batch_number: int
    entries: List[_Entry] = dfield(default_factory=list)
    service_class: int = 200

    def _add(self, direction: str, name, routing, account, amount_cents,
             account_type="checking", id_number="", prenote=False, addenda=None):
        r = digits(routing)
        if len(r) != 9:
            raise AchError("BAD_ROUTING", f"routing must be 9 digits, got '{routing}'")
        key = f"{account_type}:{direction}" + (":prenote" if prenote else "")
        txn = TXN.get(key)
        if not txn:
            raise AchError("BAD_TXN", f"no transaction code for {key}")
        adds = [_Addenda(addenda, 1)] if addenda else []
        self.entries.append(_Entry(
            txn_code=txn, routing=r[:8], check_digit=r[8], account=account,
            amount_cents=0 if prenote else amount_cents, id_number=id_number,
            name=name, addenda_flag=bool(adds), trace_number="",
            direction=direction, addenda=adds,
        ))
        return self

    def credit(self, name, routing, account, amount_cents, account_type="checking",
               id_number="", prenote=False, addenda=None):
        return self._add("credit", name, routing, account, amount_cents, account_type, id_number, prenote, addenda)

    def debit(self, name, routing, account, amount_cents, account_type="checking",
              id_number="", prenote=False, addenda=None):
        return self._add("debit", name, routing, account, amount_cents, account_type, id_number, prenote, addenda)


class AchFile:
    def __init__(self, model: dict) -> None:
        self._m = model

    @staticmethod
    def create(origin_dfi: str, company_id: str, destination_routing: Optional[str] = None,
               destination_name: str = "", origin_name: str = "", file_id_modifier: str = "A",
               creation_date: Optional[datetime] = None) -> "AchFile":
        origin = digits(origin_dfi)
        if len(origin) != 9:
            raise AchError("BAD_ROUTING", f"originDfi must be 9 digits, got '{origin_dfi}'")
        dest = digits(destination_routing if destination_routing is not None else origin_dfi)
        now = creation_date or datetime.now()
        cid = digits(company_id).rjust(10, "0")[:10] or alnum(company_id, 10).strip()
        return AchFile({
            "destination_routing": dest,
            "origin_routing": origin,
            "creation_date": f"{now.year % 100:02d}{now.month:02d}{now.day:02d}",
            "creation_time": f"{now.hour:02d}{now.minute:02d}",
            "file_id_modifier": (file_id_modifier or "A")[:1].upper(),
            "destination_name": destination_name,
            "origin_name": origin_name,
            "company_id": cid,
            "batches": [],
        })

    def batch(self, sec: str, description: str, effective_date: str, descriptive_date: str = "",
              discretionary_data: str = "", company_name: Optional[str] = None,
              company_id: Optional[str] = None) -> _Batch:
        b = _Batch(
            company_name=company_name if company_name is not None else self._m["origin_name"],
            discretionary_data=discretionary_data,
            company_id=company_id if company_id is not None else self._m["company_id"],
            sec=sec, description=description, descriptive_date=descriptive_date,
            effective_date=_to_yymmdd(effective_date),
            origin_dfi8=self._m["origin_routing"][:8],
            batch_number=len(self._m["batches"]) + 1,
        )
        self._m["batches"].append(b)
        return b

    def render(self) -> str:
        m = self._m
        lines: List[str] = [_file_header(m)]
        file_entry_addenda = 0
        file_hash = 0
        file_debit = 0
        file_credit = 0
        for b in m["batches"]:
            b.service_class = _service_class(b.entries)
            lines.append(_batch_header(b))
            hsh = 0
            debit = 0
            credit = 0
            count = 0
            for ei, e in enumerate(b.entries):
                e.trace_number = b.origin_dfi8 + str(ei + 1).rjust(7, "0")
                lines.append(_entry_detail(e))
                count += 1
                hsh += int(e.routing)
                if e.direction == "credit":
                    credit += e.amount_cents
                else:
                    debit += e.amount_cents
                for a in e.addenda:
                    lines.append(_addenda(a, e.trace_number))
                    count += 1
            lines.append(_batch_control(b, count, hsh, debit, credit))
            file_entry_addenda += count
            file_hash += hsh
            file_debit += debit
            file_credit += credit
        block_count = ceil((len(lines) + 1) / BLOCKING_FACTOR)
        lines.append(_file_control(m, block_count, file_entry_addenda, file_hash, file_debit, file_credit))
        while len(lines) % BLOCKING_FACTOR != 0:
            lines.append("9" * RECORD_LEN)
        return "\n".join(lines) + "\n"


def _hash10(h: int) -> str:
    s = str(h)
    return s[-10:] if len(s) > 10 else s.rjust(10, "0")


def _file_header(m: dict) -> str:
    return ("1" + "01" + " " + num(m["destination_routing"], 9) + " " + num(m["origin_routing"], 9)
            + m["creation_date"] + m["creation_time"] + alnum(m["file_id_modifier"], 1)
            + "094" + "10" + "1" + alnum(m["destination_name"], 23) + alnum(m["origin_name"], 23)
            + alnum("", 8))


def _batch_header(b: _Batch) -> str:
    return ("5" + num(b.service_class, 3) + alnum(b.company_name, 16) + alnum(b.discretionary_data, 20)
            + alnum(b.company_id, 10) + alnum(b.sec, 3) + alnum(b.description, 10)
            + alnum(b.descriptive_date, 6) + b.effective_date + alnum("", 3) + "1"
            + num(b.origin_dfi8, 8) + num(b.batch_number, 7))


def _entry_detail(e: _Entry) -> str:
    return ("6" + num(e.txn_code, 2) + num(e.routing, 8) + alnum(e.check_digit, 1)
            + alnum(e.account, 17) + money(e.amount_cents, 10) + alnum(e.id_number, 15)
            + alnum(e.name, 22) + alnum("", 2) + ("1" if e.addenda_flag else "0")
            + alnum(e.trace_number, 15))


def _addenda(a: _Addenda, trace: str) -> str:
    return "7" + "05" + alnum(a.info, 80) + num(a.sequence, 4) + num(trace[-7:], 7)


def _batch_control(b: _Batch, count: int, hsh: int, debit: int, credit: int) -> str:
    return ("8" + num(b.service_class, 3) + num(count, 6) + _hash10(hsh) + money(debit, 12)
            + money(credit, 12) + alnum(b.company_id, 10) + alnum("", 19) + alnum("", 6)
            + num(b.origin_dfi8, 8) + num(b.batch_number, 7))


def _file_control(m: dict, block_count: int, entry_addenda: int, hsh: int, debit: int, credit: int) -> str:
    return ("9" + num(len(m["batches"]), 6) + num(block_count, 6) + num(entry_addenda, 8)
            + _hash10(hsh) + money(debit, 12) + money(credit, 12) + alnum("", 39))
