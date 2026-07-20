import os
from datetime import datetime

from achkit import AchFile, parse, validate, is_valid_routing, describe_return

REF = os.path.join(os.path.dirname(__file__), "..", "..", "reference.ach")


def sample():
    # 12:30 matches the reference file rendered by the JS package (local wall clock).
    f = AchFile.create(
        origin_dfi="091000019", company_id="1234567890",
        origin_name="ACME PAYROLL", destination_name="MY BANK",
        file_id_modifier="A", creation_date=datetime(2026, 7, 20, 12, 30),
    )
    b = f.batch(sec="PPD", description="PAYROLL", effective_date="2026-07-22")
    b.credit(name="Jane Doe", routing="011401533", account="0072", amount_cents=124050)
    b.debit(name="ACME LLC", routing="091000019", account="1899", amount_cents=124050)
    return f


def test_byte_identical_to_js_reference():
    with open(REF, "r", newline="") as fh:
        ref = fh.read()
    assert sample().render() == ref, "Python output must be byte-identical to the JS reference"


def test_all_records_94_chars_blocked():
    out = sample().render().rstrip("\n").split("\n")
    assert all(len(l) == 94 for l in out)
    assert len(out) % 10 == 0


def test_generated_validates_clean():
    res = validate(sample().render())
    assert res["ok"], res["errors"]


def test_parse_recovers_entries():
    p = parse(sample().render())
    assert len(p["batches"]) == 1
    assert p["batches"][0]["entries"][0]["amount_cents"] == 124050
    assert p["batches"][0]["entries"][0]["name"] == "JANE DOE"


def test_tampered_amount_flagged():
    out = sample().render().split("\n")
    ei = next(i for i, l in enumerate(out) if l.startswith("6"))
    out[ei] = out[ei][:29] + "0000200000" + out[ei][39:]
    res = validate("\n".join(out))
    assert not res["ok"]
    assert any(e["code"] in ("BAD_BATCH_CREDIT", "BAD_FILE_CREDIT") for e in res["errors"])


def test_aba_checksum():
    assert is_valid_routing("091000019")
    assert not is_valid_routing("123456789")


def test_return_lookup():
    assert describe_return("R01") == "Insufficient funds"
