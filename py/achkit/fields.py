"""Fixed-width NACHA field primitives. Every record is exactly 94 characters."""
from __future__ import annotations

RECORD_LEN = 94
BLOCKING_FACTOR = 10


class AchError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _ascii(s: str) -> str:
    return "".join(c if 0x20 <= ord(c) <= 0x7E else " " for c in s)


def alnum(v, length: int) -> str:
    """Left-justified, space-padded, upper-cased alphanumeric field."""
    s = _ascii(str("" if v is None else v).upper())
    return s[:length] if len(s) >= length else s + " " * (length - len(s))


def num(v, length: int) -> str:
    """Right-justified, zero-padded numeric field. Raises on overflow."""
    s = "".join(c for c in str(0 if v is None else v) if c.isdigit())
    if len(s) > length:
        raise AchError("FIELD_OVERFLOW", f"numeric field overflow: {s} > {length} digits")
    return s.rjust(length, "0")


def money(cents: int, length: int) -> str:
    if not isinstance(cents, int) or cents < 0:
        raise AchError("BAD_AMOUNT", f"amount must be a non-negative integer of cents, got {cents}")
    return num(cents, length)


def digits(v: str) -> str:
    return "".join(c for c in str(v) if c.isdigit())
