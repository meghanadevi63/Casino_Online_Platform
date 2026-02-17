from apscheduler.schedulers.background import BackgroundScheduler

from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.tenant import Tenant
from app.services.analytics_snapshot_service import generate_daily_snapshot

_scheduler: BackgroundScheduler | None = None


def run_daily_snapshots():
    """
    Scheduled job to generate analytics for the PREVIOUS full day in UTC.
    Runs at 00:05 UTC every day.
    """
    db: Session = SessionLocal()
    try:
        
        today_utc = datetime.now(timezone.utc).date()
        yesterday = today_utc - timedelta(days=1)

        tenants = (
            db.query(Tenant)
            .filter(Tenant.status == "active")
            .all()
        )

        print(f"[SNAPSHOT START] Generating analytics for date: {yesterday}")

        for tenant in tenants:
            try:
                generate_daily_snapshot(
                    db=db,
                    tenant_id=tenant.tenant_id,
                    snapshot_date=yesterday
                )
            except Exception as e:
                print(f"[SNAPSHOT ERROR] Tenant {tenant.tenant_id}: {e}")

        print(f"[SNAPSHOT DONE] Completed for date: {yesterday}")
    finally:
        db.close()


def start_scheduler():
    global _scheduler

    if _scheduler and _scheduler.running:
        return _scheduler

    # Scheduler is set to UTC, so the cron job is based on UTC time
    _scheduler = BackgroundScheduler(timezone="UTC")

    _scheduler.add_job(
        run_daily_snapshots,
        trigger="cron",
        hour=0,
        minute=5,  # Runs at 00:05 UTC
        id="daily_snapshot",
        replace_existing=True
    )

    _scheduler.start()
    print("[SCHEDULER] Started successfully in UTC timezone.")

    return _scheduler


def get_scheduler():
    return _scheduler