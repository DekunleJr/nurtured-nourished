from datetime import date, timedelta
from unittest.mock import MagicMock

import pytest

from app.utils.instalments import (
    next_unpaid_instalment,
    ordered_instalments,
    record_instalment_paid,
)


def _row(sequence, status="pending"):
    row = MagicMock()
    row.sequence = sequence
    row.status = status
    row.is_deleted = False
    row.amount_pence = 1000
    row.stripe_session_id = ""
    return row


def test_ordered_skips_deleted_and_sorts():
    rows = [_row(3), _row(1), _row(2)]
    assert [r.sequence for r in ordered_instalments(rows)] == [1, 2, 3]
    gone = _row(1)
    gone.is_deleted = True
    assert [r.sequence for r in ordered_instalments([gone, _row(2)])] == [2]


def test_next_unpaid_skips_paid_only():
    rows = [_row(1, "paid"), _row(2), _row(3)]
    assert next_unpaid_instalment(rows).sequence == 2
    assert next_unpaid_instalment([_row(1, "paid")]) is None


class _FakeQuery:
    def __init__(self, rows):
        self._rows = rows

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self._rows


class _FakeDB:
    def __init__(self, rows):
        self._rows = rows
        self.committed = 0

    def query(self, model):
        return _FakeQuery(self._rows)

    def commit(self):
        self.committed += 1

    def refresh(self, booking):
        pass


def _booking():
    booking = MagicMock()
    booking.id = 7
    booking.amount_paid_pence = 0
    booking.status = "pending_payment"
    booking.stripe_session_id = ""
    return booking


def test_record_first_instalment_moves_to_part_paid():
    rows = [_row(1), _row(2), _row(3)]
    booking = _booking()
    assert record_instalment_paid(_FakeDB(rows), booking, rows[0], "cs_1") is True
    assert rows[0].status == "paid"
    assert rows[0].paid_at is not None
    assert booking.amount_paid_pence == 1000
    assert booking.status == "part_paid"
    assert booking.stripe_session_id == "cs_1"


def test_record_final_instalment_moves_to_paid():
    rows = [_row(1, "paid"), _row(2, "paid"), _row(3)]
    booking = _booking()
    booking.status = "part_paid"
    booking.amount_paid_pence = 2000
    assert record_instalment_paid(_FakeDB(rows), booking, rows[2], "cs_3") is True
    assert booking.amount_paid_pence == 3000
    assert booking.status == "paid"


def test_record_is_idempotent():
    row = _row(1, "paid")
    booking = _booking()
    assert record_instalment_paid(_FakeDB([row]), booking, row, "cs_1") is False


def test_serialise_marks_overdue():
    from app.utils.instalments import serialise_instalment

    row = MagicMock()
    row.sequence = 2
    row.amount_pence = 2500
    row.due_date = date.today() - timedelta(days=1)
    row.status = "pending"
    row.is_overdue = True
    row.paid_at = None
    out = serialise_instalment(row)
    assert out["sequence"] == 2
    assert out["is_overdue"] is True
    assert out["is_paid"] is False
