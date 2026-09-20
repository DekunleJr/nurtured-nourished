"""Cohort eligibility and payment-plan rules for the purchase flow.

Everything in this module is pure: no database, no clock of its own, no FastAPI.
That makes the money maths and the date boundaries directly unit-testable (see
tests/test_payment_plans.py), which matters because this is the code that decides
what a customer is charged and when.

The published policy (see app/packages/page.tsx and the FAQ) is:

  * Category A — more than 8 weeks before the cohort starts
      Pay in full, or in 2 instalments, or in 3 instalments.
  * Category B — more than 4 weeks and up to 8 weeks before
      Pay in full, or in 2 instalments.
  * Category C — 4 weeks or fewer before
      Payment in full.

Instalments after the deposit always fall due *before* the cohort starts, which is
why every multi-instalment plan carries a warning for the customer.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import List, Optional, Sequence, Tuple

# --- Category boundaries -------------------------------------------------
# Measured in days between "today" and the cohort's start date.
WEEKS = 7
CATEGORY_A_THRESHOLD_DAYS = 8 * WEEKS  # strictly more than this -> category A
CATEGORY_B_THRESHOLD_DAYS = 4 * WEEKS  # strictly more than this -> category B

CATEGORY_A = "A"
CATEGORY_B = "B"
CATEGORY_C = "C"

# --- Plan codes ---------------------------------------------------------
PLAN_FULL = "full"
PLAN_TWO = "two"
PLAN_THREE = "three"

# When each later instalment falls due, counted back from the cohort start. Every
# offset is at least a fortnight, so no instalment can ever land in the past for
# the category that offers it (see the invariant test).
_INSTALMENT_OFFSETS_DAYS = {
    PLAN_TWO: (14,),
    PLAN_THREE: (28, 14),
}

# The percentage of the total taken by each instalment, in order.
_PLAN_SPLITS = {
    PLAN_FULL: (100,),
    PLAN_TWO: (50, 50),
    PLAN_THREE: (50, 25, 25),
}

# Category B's two-payment split is 60/40 rather than 50/50.
_CATEGORY_B_TWO_SPLIT = (60, 40)

# Which plans each category may choose, in the order they are shown.
_PLANS_BY_CATEGORY = {
    CATEGORY_A: (PLAN_FULL, PLAN_TWO, PLAN_THREE),
    CATEGORY_B: (PLAN_FULL, PLAN_TWO),
    CATEGORY_C: (PLAN_FULL,),
}

_PLAN_LABELS = {
    PLAN_FULL: "Pay in full",
    PLAN_TWO: "Pay in 2 instalments",
    PLAN_THREE: "Pay in 3 instalments",
}


@dataclass(frozen=True)
class InstalmentSpec:
    """One scheduled payment: how much, and when it must clear."""

    sequence: int
    amount_pence: int
    percentage: int
    due_date: date


@dataclass(frozen=True)
class PaymentPlan:
    """A payment option a customer can choose for a given cohort."""

    code: str
    label: str
    instalments: Tuple[InstalmentSpec, ...]

    @property
    def total_pence(self) -> int:
        """Sums the instalments — always the exact package price (see _split)."""
        return sum(spec.amount_pence for spec in self.instalments)

    @property
    def is_instalment_plan(self) -> bool:
        return len(self.instalments) > 1

    @property
    def deposit_pence(self) -> int:
        """What is taken at checkout."""
        return self.instalments[0].amount_pence

    @property
    def amounts_pence(self) -> List[int]:
        """The pence figure for each instalment, in order.

        Mirrors what the checkout UI renders as "Payment N: £…". Derived from
        the same InstalmentSpec list that is charged, so what is displayed can
        never disagree with what Stripe is actually asked for.
        """
        return [spec.amount_pence for spec in self.instalments]

    @property
    def summary(self) -> str:
        """Human-readable payment schedule for the plan radio button.

        The deposit is described as "now"; every later instalment shows its
        due date so the multi-payment warning is grounded in the real date.
        """
        parts = []
        for spec in self.instalments:
            if spec.sequence == 1:
                parts.append(f"{spec.percentage}% now")
            else:
                parts.append(f"{spec.percentage}% on {spec.due_date.isoformat()}")
        return ", then ".join(parts)


def category_for(days_to_start: int) -> str:
    """Which booking window a cohort falls into, from today's perspective.

    Boundaries fall on the lower edge: exactly 56 days is category B and exactly
    28 days is category C, so every possible value maps somewhere.
    """
    if days_to_start > CATEGORY_A_THRESHOLD_DAYS:
        return CATEGORY_A
    if days_to_start > CATEGORY_B_THRESHOLD_DAYS:
        return CATEGORY_B
    return CATEGORY_C


def parse_due_date(value: Optional[str]) -> Optional[date]:
    """Parse a stored due date, or None when it isn't usable.

    Customer accounts store ``YYYY-MM-DD``, but older discovery intakes allowed
    other shapes, so a bare ``YYYY-MM`` is treated as the first of that month
    rather than discarded.
    """
    raw = (value or "").strip()
    if not raw:
        return None
    try:
        return date.fromisoformat(raw)
    except ValueError:
        pass
    if len(raw) == 7:  # "YYYY-MM"
        try:
            return date.fromisoformat(f"{raw}-01")
        except ValueError:
            return None
    return None


def _split(total_pence: int, percentages: Sequence[int]) -> List[int]:
    """Turn percentages into whole pence that always sum to the total.

    Rounding is absorbed by the final instalment, so a customer is never asked
    for a penny more or less than the published price.
    """
    amounts = [total_pence * pct // 100 for pct in percentages[:-1]]
    amounts.append(total_pence - sum(amounts))
    return amounts


def _splits_for(category: str, plan_code: str) -> Sequence[int]:
    if category == CATEGORY_B and plan_code == PLAN_TWO:
        return _CATEGORY_B_TWO_SPLIT
    return _PLAN_SPLITS[plan_code]


def build_plan(
    plan_code: str,
    price_pence: int,
    cohort_start: date,
    today: date,
    category: str,
) -> PaymentPlan:
    """Build one plan: amounts in pence plus a due date per instalment.

    The deposit is due today; every later instalment is scheduled a fixed number
    of weeks *before* the cohort starts, so the whole fee is always settled before
    the programme begins.
    """
    percentages = _splits_for(category, plan_code)
    amounts = _split(price_pence, percentages)
    offsets = _INSTALMENT_OFFSETS_DAYS.get(plan_code, ())

    instalments = [
        InstalmentSpec(
            sequence=index + 1,
            amount_pence=amount,
            percentage=percentages[index],
            due_date=(
                today if index == 0 else cohort_start - timedelta(days=offsets[index - 1])
            ),
        )
        for index, amount in enumerate(amounts)
    ]
    return PaymentPlan(
        code=plan_code,
        label=_PLAN_LABELS[plan_code],
        instalments=tuple(instalments),
    )


def plan_options(
    price_pence: int,
    cohort_start: date,
    today: date,
) -> List[PaymentPlan]:
    """Every plan the customer may choose for this cohort, in display order.

    This is the single authority for the purchase flow: the API returns these and
    the checkout UI renders exactly what it is given, so the rule can never drift
    between the two.
    """
    days_to_start = (cohort_start - today).days
    category = category_for(days_to_start)
    return [
        build_plan(code, price_pence, cohort_start, today, category)
        for code in _PLANS_BY_CATEGORY[category]
    ]


def find_plan(
    plan_code: str,
    price_pence: int,
    cohort_start: date,
    today: date,
) -> Optional[PaymentPlan]:
    """The requested plan, or None when the category does not offer it.

    Callers must treat None as a refusal rather than falling back to a default:
    silently accepting a 3-instalment plan for a cohort starting next month would
    break the published payment policy.
    """
    for plan in plan_options(price_pence, cohort_start, today):
        if plan.code == plan_code:
            return plan
    return None
