"""ACH return (R) and change/notification-of-change (C) codes."""
from __future__ import annotations

RETURN_CODES = {
    "R01": "Insufficient funds",
    "R02": "Account closed",
    "R03": "No account / unable to locate account",
    "R04": "Invalid account number structure",
    "R05": "Unauthorized debit to consumer account using corporate SEC code",
    "R06": "Returned per ODFI request",
    "R07": "Authorization revoked by customer",
    "R08": "Payment stopped",
    "R09": "Uncollected funds",
    "R10": "Customer advises not authorized",
    "R11": "Customer advises entry not in accordance with terms",
    "R12": "Account sold to another DFI",
    "R14": "Representative payee deceased or unable to continue",
    "R15": "Beneficiary or account holder deceased",
    "R16": "Account frozen",
    "R17": "File record edit criteria",
    "R20": "Non-transaction account",
    "R23": "Credit entry refused by receiver",
    "R24": "Duplicate entry",
    "R29": "Corporate customer advises not authorized",
    "R31": "Permissible return entry (CCD/CTX)",
}

CHANGE_CODES = {
    "C01": "Incorrect DFI account number",
    "C02": "Incorrect routing number",
    "C03": "Incorrect routing number and account number",
    "C04": "Incorrect individual name / receiving company name",
    "C05": "Incorrect transaction code",
    "C06": "Incorrect account number and transaction code",
    "C07": "Incorrect routing, account number and transaction code",
    "C09": "Incorrect individual identification number",
}


def describe_return(code: str):
    return RETURN_CODES.get(code.upper())


def describe_change(code: str):
    return CHANGE_CODES.get(code.upper())
