"""In-memory stand-in for the SQLAlchemy Session used by ``get_db``.

Lets FastAPI endpoint tests run hermetically — no Postgres, no network — by
overriding the ``get_db`` dependency. It implements exactly the query surface
the admin/catalogue handlers use:

* ``query(model)`` / ``query(func.count(Model.id))`` → chained
  ``filter / order_by / offset / limit / count / scalar / first /
  one_or_none / all / with_for_update``
* ``get / add / commit / refresh / delete``

Filters are real SQLAlchemy expressions; ``_evaluate`` interprets the operators
the handlers actually use (eq, ne, comparisons, ``in_``, ``ilike``, ``or_``)
against plain model instances. An unsupported operator raises immediately so a
handler change can never silently bypass a test.
"""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import inspect as sa_inspect
from sqlalchemy.sql import operators
from sqlalchemy.sql.elements import (
    BinaryExpression,
    BindParameter,
    BooleanClauseList,
    UnaryExpression,
)

from app.database import Base

# __tablename__ → mapped class, so func.count(Model.id) can be resolved back to
# the rows it counts (the column knows its table, the table knows its name).
MODELS_BY_TABLE: dict[str, type] = {
    cls.__tablename__: cls
    for cls in vars(Base).values()
    if isinstance(cls, type) and hasattr(cls, "__tablename__")
}
# Base's registry also holds models defined across app.models imports.
for _cls in list(getattr(Base, "registry", object())._class_registry.values()):  # type: ignore[union-attr]
    if isinstance(_cls, type) and hasattr(_cls, "__tablename__"):
        MODELS_BY_TABLE[_cls.__tablename__] = _cls


def _sql_literal(value: Any) -> Any:
    """Right-hand side of a BinaryExpression → a plain Python value."""
    if isinstance(value, BindParameter):
        return value.value
    type_name = type(value).__name__
    if type_name == "True_":
        return True
    if type_name == "False_":
        return False
    if type_name == "Null":
        return None
    return getattr(value, "value", value)


def _ilike(value: Any, pattern: Any) -> bool:
    """SQL LIKE with wildcards, case-insensitive; NULL never matches."""
    if value is None:
        return False
    rx = "^" + re.escape(str(pattern)).replace("%", ".*").replace("_", ".") + "$"
    return re.match(rx, str(value), flags=re.IGNORECASE) is not None


def _evaluate(expr: Any, row: Any) -> bool:
    if isinstance(expr, BooleanClauseList):
        values = [_evaluate(clause, row) for clause in expr.clauses]
        if expr.operator is operators.or_:
            return any(values)
        if expr.operator is operators.and_:
            return all(values)
        raise AssertionError(f"FakeDB: unsupported boolean operator {expr.operator!r}")
    if isinstance(expr, BinaryExpression):
        left_key = getattr(expr.left, "key", None)
        if left_key is None:
            raise AssertionError(f"FakeDB: filter left side is not a column: {expr.left!r}")
        left = getattr(row, left_key, None)
        right = _sql_literal(expr.right)
        op = expr.operator
        if op is operators.is_:
            return left is right
        if op is operators.is_not:
            return left is not right
        if op is operators.eq:
            return left == right
        if op is operators.ne:
            return left != right
        if op is operators.ge:
            return left is not None and left >= right
        if op is operators.gt:
            return left is not None and left > right
        if op is operators.le:
            return left is not None and left <= right
        if op is operators.lt:
            return left is not None and left < right
        if op is operators.in_op:
            return left in (right or ())
        if op is operators.ilike_op:
            return _ilike(left, right)
        raise AssertionError(f"FakeDB: unsupported filter operator {op!r}")
    raise AssertionError(f"FakeDB: unsupported filter expression {expr!r}")


def _apply_column_defaults(row: Any) -> None:
    """Fill Python-side column defaults that SQLAlchemy applies at INSERT.

    Without this, freshly constructed rows would carry ``None`` for
    ``created_at``/``is_deleted``/etc., which the handlers' filters and
    serialisers expect to be present.
    """
    for col in sa_inspect(type(row)).columns:
        if col.key == "id":
            continue
        if getattr(row, col.key, None) is not None:
            continue
        default = col.default
        if default is None:
            continue
        # `default=_now` / `default=list` are registered as *callable* defaults
        # (is_callable), while `default=""` / `default=False` are scalars —
        # cover both, or timestamps silently stay None and response validation
        # (e.g. AdminUserResponse's `datetime` fields) blows up.
        if not (
            getattr(default, "is_scalar", False)
            or getattr(default, "is_callable", False)
        ):
            continue
        arg = default.arg
        if callable(arg):
            # SQLAlchemy normalises callable defaults to a one-argument
            # callable (`lambda ctx: fn()`), so always invoke with a context
            # arg. None is fine — no default in this codebase inspects it.
            value = arg(None)
        else:
            value = arg
        setattr(row, col.key, value)


def _order_key_and_direction(expr: Any) -> tuple[str | None, bool]:
    element = getattr(expr, "element", expr)  # UnaryExpression wraps the column
    key = getattr(element, "key", None)
    op_name = (getattr(getattr(expr, "operator", None), "__name__", "") or "").lower()
    desc = op_name.startswith("desc") or "DESC" in str(expr).upper()
    return key, desc


def _model_for_column(column: Any) -> type | None:
    """Map a SQLAlchemy column/aggregate back to its mapped class, if known."""
    table = getattr(column, "table", None)
    return MODELS_BY_TABLE.get(getattr(table, "name", None))


class FakeQuery:
    def __init__(self, db: "FakeDB", model: type | None, count_mode: bool = False):
        self._db = db
        self._model = model
        self._count_mode = count_mode
        self._filters: list[Any] = []
        self._order: list[Any] = []
        self._offset = 0
        self._limit: int | None = None

    # --- chainables -------------------------------------------------------
    def filter(self, *exprs: Any, **_kwargs: Any) -> "FakeQuery":
        self._filters.extend(exprs)
        return self

    def order_by(self, *exprs: Any) -> "FakeQuery":
        self._order.extend(exprs)
        return self

    def offset(self, n: int) -> "FakeQuery":
        self._offset = n
        return self

    def limit(self, n: int) -> "FakeQuery":
        self._limit = n
        return self

    def with_for_update(self) -> "FakeQuery":
        return self  # row locks are meaningless in memory

    # --- terminals --------------------------------------------------------
    def _matching(self) -> list[Any]:
        rows = [
            row
            for row in self._db.store.get(self._model, [])
            if all(_evaluate(expr, row) for expr in self._filters)
        ]
        # Stable multi-sort: apply last key first so the first key ends primary.
        for expr in reversed(self._order):
            key, desc = _order_key_and_direction(expr)
            if key is None:
                continue
            rows = sorted(
                rows,
                key=lambda r, k=key: (getattr(r, k, None) is None, getattr(r, k, None)),
                reverse=desc,
            )
        return rows

    def all(self) -> list[Any]:
        rows = self._matching()
        if self._limit is not None:
            rows = rows[self._offset : self._offset + self._limit]
        elif self._offset:
            rows = rows[self._offset :]
        return rows

    def first(self) -> Any | None:
        rows = self._matching()
        return rows[0] if rows else None

    def one_or_none(self) -> Any | None:
        rows = self._matching()
        if len(rows) > 1:
            raise RuntimeError("FakeDB: MultipleResultsFound (more than one match)")
        return rows[0] if rows else None

    def count(self) -> int:
        return len(self._matching())

    def scalar(self) -> int | None:
        # Only used as func.count(...) → len(matching rows).
        return len(self._matching()) if self._count_mode else None


class FakeGroupedQuery:
    """``db.query(column, func.count(Model.id)).group_by(column)`` → {key: count}.

    Only the shape the admin routers use is supported; anything else raises so a
    handler rewrite can never quietly pass a test.
    """

    def __init__(self, db: "FakeDB", model: type, group_key: str | None):
        self._db = db
        self._model = model
        self._group_key = group_key
        self._filters: list[Any] = []

    def filter(self, *exprs: Any, **_kwargs: Any) -> "FakeGroupedQuery":
        self._filters.extend(exprs)
        return self

    def group_by(self, *exprs: Any) -> "FakeGroupedQuery":
        for expr in exprs:
            key = getattr(expr, "key", None)
            if key:
                self._group_key = key
        return self

    def all(self) -> list[tuple[Any, int]]:
        if self._group_key is None:
            raise AssertionError("FakeDB: grouped query without a group column")
        buckets: dict[Any, int] = {}
        for row in self._db.store.get(self._model, []):
            if all(_evaluate(expr, row) for expr in self._filters):
                key = getattr(row, self._group_key, None)
                buckets[key] = buckets.get(key, 0) + 1
        return list(buckets.items())


class FakeDB:
    def __init__(self) -> None:
        self.store: dict[type, list[Any]] = defaultdict(list)
        self.commits = 0
        self._id_seq = 0

    # --- FastAPI/session surface -----------------------------------------
    def query(self, *targets: Any) -> Any:
        if len(targets) == 1:
            target = targets[0]
            if isinstance(target, type) and issubclass(target, Base):
                return FakeQuery(self, target)
            # NOTE: explicit None check — SQLAlchemy ClauseList overloads
            # __bool__ and raises TypeError, so `or []` would blow up here.
            raw_clauses = getattr(target, "clauses", None)
            clauses = list(raw_clauses) if raw_clauses is not None else []
            if clauses:
                model = _model_for_column(clauses[0])
                if model is not None:
                    return FakeQuery(self, model, count_mode=True)
            raise AssertionError(f"FakeDB: cannot resolve query target {target!r}")

        # Multi-entity query, e.g.
        #   db.query(Booking.user_id, func.count(Booking.id))
        # Only column + func.count() pairs are supported (see _grouped_query).
        model = _model_for_column(targets[0])
        if model is None:
            raise AssertionError(f"FakeDB: cannot resolve query target {targets!r}")
        return FakeGroupedQuery(self, model, group_key=getattr(targets[0], "key", None))

    def get(self, model: type, ident: Any, *_args: Any, **_kwargs: Any) -> Any | None:
        for row in self.store.get(model, []):
            if getattr(row, "id", None) == ident:
                return row
        return None

    def add(self, row: Any) -> None:
        _apply_column_defaults(row)
        if getattr(row, "id", None) is None:
            self._id_seq += 1
            row.id = self._id_seq
        self.store[type(row)].append(row)

    def add_all(self, rows: list[Any]) -> None:
        for row in rows:
            self.add(row)

    def delete(self, row: Any) -> None:
        self.store[type(row)].remove(row)

    def commit(self) -> None:
        self.commits += 1

    def rollback(self) -> None:
        pass

    def refresh(self, row: Any) -> None:
        pass

    def close(self) -> None:
        pass

    # --- test helper ------------------------------------------------------
    def seed(self, model: type, **fields: Any) -> Any:
        """Construct a row (defaults + id applied) and put it in the store."""
        row = model(**fields)
        _apply_column_defaults(row)
        if getattr(row, "id", None) is None:
            self._id_seq += 1
            row.id = self._id_seq
        self.store[model].append(row)
        return row


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
