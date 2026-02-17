from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.analytics_snapshot import AnalyticsSnapshot


def resolve_date_range(range_days, start_date, end_date):
    if range_days:
        
        end = datetime.now(timezone.utc).date()
        start = end - timedelta(days=range_days - 1)
        return start, end

    if start_date and end_date:
        return start_date, end_date

    raise ValueError("Invalid date range")


def get_platform_timeseries(
    db: Session,
    range_days=None,
    start_date=None,
    end_date=None
):
    start, end = resolve_date_range(range_days, start_date, end_date)

    rows = (
        db.query(
            AnalyticsSnapshot.snapshot_date.label("date"),
            func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
            func.sum(AnalyticsSnapshot.active_players).label("active_players"),
        )
        .filter(
            AnalyticsSnapshot.snapshot_date.between(start, end)
        )
        .group_by(AnalyticsSnapshot.snapshot_date)
        .order_by(AnalyticsSnapshot.snapshot_date)
        .all()
    )

    return rows