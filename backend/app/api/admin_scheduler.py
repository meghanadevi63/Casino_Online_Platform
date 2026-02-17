from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.scheduler import get_scheduler

router = APIRouter(
    prefix="/admin/analytics/scheduler",
    tags=["Admin Analytics – Scheduler"]
)


def admin_only(user):
    if user.role_id not in (2, 4):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/health")
def scheduler_health(current_user=Depends(get_current_user)):
    admin_only(current_user)

    scheduler = get_scheduler()

    if not scheduler:
        return {
            "scheduler_running": False,
            "reason": "Scheduler not initialized",
            "jobs": []
        }

    return {
        "scheduler_running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "trigger": str(job.trigger),
                "next_run_time": job.next_run_time
            }
            for job in scheduler.get_jobs()
        ]
    }
