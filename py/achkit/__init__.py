"""achkit - the ACH file toolkit for developers.

Generate, parse and validate NACHA ACH files. Typed, zero-dependency.
Byte-identical output to the achkit JavaScript package.
"""
from .generate import AchFile, TXN
from .parse import parse
from .validate import validate, is_valid_routing
from .codes import RETURN_CODES, CHANGE_CODES, describe_return, describe_change
from .fields import AchError, RECORD_LEN, BLOCKING_FACTOR

__version__ = "0.1.0"
__all__ = [
    "AchFile", "TXN", "parse", "validate", "is_valid_routing",
    "RETURN_CODES", "CHANGE_CODES", "describe_return", "describe_change",
    "AchError", "RECORD_LEN", "BLOCKING_FACTOR",
]
