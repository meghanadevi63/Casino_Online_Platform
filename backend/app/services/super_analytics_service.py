from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from datetime import date, timedelta, datetime, timezone

from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.tenant import Tenant
from app.models.game import Game
from app.models.tenant_game import TenantGame


def resolve_date_range(range_days, start_date, end_date):
    if range_days:
       
        end = datetime.now(timezone.utc).date()
        start = end - timedelta(days=range_days - 1)
        return start, end

    if start_date and end_date:
        return start_date, end_date

    raise ValueError("Invalid date range")



# PLATFORM OVERVIEW

def get_platform_overview(db: Session, range_days=None, start_date=None, end_date=None):
    start, end = resolve_date_range(range_days, start_date, end_date)

    row = (
        db.query(
            func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
            func.sum(AnalyticsSnapshot.total_players).label("total_players"),
        )
        .filter(AnalyticsSnapshot.snapshot_date.between(start, end))
        .first()
    )

    total_tenants = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(Tenant.status == "active").count()

    rtp = (
        (row.total_wins / row.total_bets * 100)
        if row.total_bets and row.total_bets > 0
        else None
    )

    return {
        "tenants": {
            "total": total_tenants,
            "active": active_tenants,
        },
        "financials": {
            "total_bets": float(row.total_bets or 0),
            "total_wins": float(row.total_wins or 0),
            "ggr": float(row.ggr or 0),
            "rtp_percentage": round(rtp, 2) if rtp else None,
        },
        "players": {
            "total_players": int(row.total_players or 0)
        },
        "date_range": {
            "start": start,
            "end": end
        }
    }



# TENANT ANALYTICS

def get_tenant_analytics(db: Session):
    rows = (
        db.query(
            Tenant.tenant_id,
            Tenant.tenant_name,

            func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
            func.sum(AnalyticsSnapshot.active_players).label("active_players"),
        )
        .join(AnalyticsSnapshot, AnalyticsSnapshot.tenant_id == Tenant.tenant_id)
        .group_by(Tenant.tenant_id, Tenant.tenant_name)
        .all()
    )

    return [
        {
            "tenant_id": r.tenant_id,
            "tenant_name": r.tenant_name,
            "total_bets": float(r.total_bets or 0),
            "total_wins": float(r.total_wins or 0),
            "ggr": float(r.ggr or 0),
            "active_players": int(r.active_players or 0),
        }
        for r in rows
    ]



# GAME ANALYTICS (CROSS TENANT)

def get_game_analytics(db: Session):
    rows = (
        db.query(
            Game.game_id,
            Game.game_name,

            func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
            func.sum(AnalyticsSnapshot.active_players).label("active_players"),

            func.count(distinct(AnalyticsSnapshot.tenant_id)).label("tenants_count")
        )
        .join(AnalyticsSnapshot, AnalyticsSnapshot.game_id == Game.game_id)
        .group_by(Game.game_id, Game.game_name)
        .all()
    )

    return [
        {
            "game_id": r.game_id,
            "game_name": r.game_name,
            "total_bets": float(r.total_bets or 0),
            "total_wins": float(r.total_wins or 0),
            "ggr": float(r.ggr or 0),
            "active_players": int(r.active_players or 0),
            "tenants_running": r.tenants_count
        }
        for r in rows
    ]