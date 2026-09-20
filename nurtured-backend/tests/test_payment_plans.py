"""Tests for the checkout payment-plan rules.

These cover the money maths and the date boundaries, because that is where a bug
would be expensive: the wrong split, a total that doesn't reconcile, or an
instalment falling due after the cohort has already started.

Run from the backend directory:
    .\\venv\\Scripts\\python.exe -m pytest tests -q
"""

from datetime import date, timedelta

import pytest

from app.utils.payment_plans import (
    CATEGORY_A,
    CATEGORY_B,
    CATEGORY_C,
    PLAN_FULL,
    PLAN_THREE,
    PLAN_TWO,
    category_for,
    find_plan,
    parse_due_date,
    plan_options,
)

TODAY = date(2026, 9, 20)
# The three published programme fees, in pence.
PRICES = (29500, 34500, 39500)


def cohort_starting_in(days: int) -> date:
    return TODAY + timedelta(days=days)


# --- Category boundaries -------------------------------------------------

@pytest.mark.parametrize(
    "days,expected",
    [
        (400, CATEGORY_A),
        (57, CATEGORY_A),          # one day past the 8-week line
        (56, CATEGORY_B),          # exactly 8 weeks belongs to B
        (29, CATEGORY_B),
        (28, CATEGORY_C),          # exactly 4 weeks belongs to C
        (1, CATEGORY_C),
        (0, CATEGORY_C),           # starts today
        (-5, CATEGORY_C),          # already started
    ],
)
def test_category_boundaries(days, expected):
    assert category_for(days) == expected


def test_every_day_maps_to_a_category():
    for days in range(-30, 500):
        assert category_for(days) in (CATEGORY_A, CATEGORY_B, CATEGORY_C)


# --- Which options each category is offered ------------------------------

def test_category_a_offers_three_options():
    plans = plan_options(29500, cohort_starting_in(70), TODAY)
    assert [p.code for p in plans] == [PLAN_FULL, PLAN_TWO, PLAN_THREE]


def test_category_b_offers_two_options():
    plans = plan_options(29500, cohort_starting_in(40), TODAY)
    assert [p.code for p in plans] == [PLAN_FULL, PLAN_TWO]


def test_category_c_offers_payment_in_full_only():
    plans = plan_options(29500, cohort_starting_in(20), TODAY)
    assert [p.code for p in plans] == [PLAN_FULL]


# --- Splits --------------------------------------------------------------

def test_category_a_three_way_split_is_50_25_25():
    plan = find_plan(PLAN_THREE, 29500, cohort_starting_in(70), TODAY)
    assert [i.percentage for i in plan.instalments] == [50, 25, 25]
    assert [i.amount_pence for i in plan.instalments] == [14750, 7375, 7375]


def test_category_a_two_way_split_is_50_50():
    plan = find_plan(PLAN_TWO, 29500, cohort_starting_in(70), TODAY)
    assert [i.percentage for i in plan.instalments] == [50, 50]
    assert [i.amount_pence for i in plan.instalments] == [14750, 14750]


def test_category_b_two_way_split_is_60_40():
    plan = find_plan(PLAN_TWO, 29500, cohort_starting_in(40), TODAY)
    assert [i.percentage for i in plan.instalments] == [60, 40]
    assert [i.amount_pence for i in plan.instalments] == [17700, 11800]


def test_payment_in_full_takes_the_whole_amount():
    plan = find_plan(PLAN_FULL, 34500, cohort_starting_in(40), TODAY)
    assert plan.is_instalment_plan is False
    assert plan.instalments[0].amount_pence == 34500
    assert plan.deposit_pence == 34500


# --- Money always reconciles --------------------------------------------

@pytest.mark.parametrize("price", PRICES + (1, 99, 100, 999, 12345, 100001))
def test_instalments_always_sum_to_the_package_price(price):
    for days in (70, 40, 20):
        for plan in plan_options(price, cohort_starting_in(days), TODAY):
            assert plan.total_pence == price, (price, days, plan.code)


@pytest.mark.parametrize("price", PRICES)
def test_deposit_is_at_least_half_for_instalment_plans(price):
    # The policy is 50% (category A) or 60% (category B) up front, so the deposit
    # must never be less than half — otherwise the split has been mis-wired.
    for days in (70, 40):
        for plan in plan_options(price, cohort_starting_in(days), TODAY):
            if plan.is_instalment_plan:
                assert plan.deposit_pence * 2 >= price, (plan.code, days)


# --- Dates ---------------------------------------------------------------

def test_deposit_is_due_today_and_later_instalments_precede_the_cohort():
    start = cohort_starting_in(70)
    plan = find_plan(PLAN_THREE, 29500, start, TODAY)
    dates = [i.due_date for i in plan.instalments]
    assert dates == [TODAY, start - timedelta(days=28), start - timedelta(days=14)]
    # Sequential, in the future, and all before the first session.
    assert dates[0] < dates[1] < dates[2] < start


@pytest.mark.parametrize("days", list(range(29, 400)))
def test_no_instalment_is_ever_in_the_past_or_after_the_start(days):
    """Invariant: for every cohort a plan is offered for, the whole fee is settled
    on time — never overdue the moment it is created, never after the programme
    has begun."""
    start = cohort_starting_in(days)
    for plan in plan_options(29500, start, TODAY):
        dates = [i.due_date for i in plan.instalments]
        for due in dates:
            assert due >= TODAY, (days, plan.code, due)
            assert due < start, (days, plan.code, due)
        assert dates == sorted(dates)


def test_instalment_sequences_are_numbered_from_one():
    for days in (70, 40, 20):
        for plan in plan_options(29500, cohort_starting_in(days), TODAY):
            assert [i.sequence for i in plan.instalments] == list(
                range(1, len(plan.instalments) + 1)
            )


# --- Choosing a plan -----------------------------------------------------

def test_find_plan_returns_none_when_the_category_does_not_offer_it():
    # Only 40 days out: a 3-instalment plan must not be available.
    assert find_plan(PLAN_THREE, 29500, cohort_starting_in(40), TODAY) is None
    assert find_plan(PLAN_TWO, 29500, cohort_starting_in(40), TODAY) is not None
    # 20 days out: nothing but payment in full.
    assert find_plan(PLAN_TWO, 29500, cohort_starting_in(20), TODAY) is None


def test_find_plan_returns_none_for_an_unknown_code():
    assert find_plan("weekly", 29500, cohort_starting_in(70), TODAY) is None


# --- Due-date parsing ----------------------------------------------------

def test_parse_due_date_accepts_iso_dates():
    assert parse_due_date("2026-12-24") == date(2026, 12, 24)


def test_parse_due_date_accepts_month_precision():
    assert parse_due_date("2026-12") == date(2026, 12, 1)


@pytest.mark.parametrize("value", ["", "   ", None, "24/12/2026", "December", "2026-13-01"])
def test_parse_due_date_rejects_junk(value):
    assert parse_due_date(value) is None
