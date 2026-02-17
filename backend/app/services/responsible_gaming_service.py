from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.responsible_limit import ResponsibleLimit
from app.models.bet import Bet
from app.models.game_round import GameRound
from app.models.game_session import GameSession


def get_limits(db: Session, player_id):
    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if not limits:
        raise HTTPException(
            status_code=404,
            detail="Responsible gaming limits not set"
        )

    return limits


def set_limits(db: Session, player_id, data):
    # Anchor "today" to UTC
    today = datetime.now(timezone.utc).date()

    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if not limits:
        limits = ResponsibleLimit(player_id=player_id)
        db.add(limits)

    #  Block updates during self-exclusion
    if limits.self_exclusion_until and limits.self_exclusion_until >= today:
        raise HTTPException(
            status_code=403,
            detail="Limits cannot be changed during self-exclusion"
        )

    for field, value in data.dict(exclude_unset=True).items():
        setattr(limits, field, value)

    db.commit()
    db.refresh(limits)
    return limits


def self_exclude(db: Session, player_id, until_date: date):
    #  Anchor "today" to UTC
    today = datetime.now(timezone.utc).date()

    if until_date <= today:
        raise HTTPException(
            status_code=400,
            detail="Self-exclusion date must be in the future"
        )

    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if not limits:
        limits = ResponsibleLimit(player_id=player_id)
        db.add(limits)

    #  Cannot shorten an existing exclusion
    if limits.self_exclusion_until and until_date < limits.self_exclusion_until:
        raise HTTPException(
            status_code=400,
            detail="Self-exclusion period cannot be reduced"
        )

    limits.self_exclusion_until = until_date

    db.commit()
    db.refresh(limits)
    return limits


def get_limits_usage(db: Session, player_id):
    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if not limits:
        raise HTTPException(
            status_code=404,
            detail="Responsible gaming limits not set"
        )

   
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()

    
    daily_used = (
        db.query(func.coalesce(func.sum(Bet.bet_amount), 0))
        .join(GameRound)
        .join(GameSession)
        .filter(
            GameSession.player_id == player_id,
            func.date(Bet.placed_at) == today
        )
        .scalar()
    )

    # Monthly usage
    monthly_used = (
        db.query(func.coalesce(func.sum(Bet.bet_amount), 0))
        .join(GameRound)
        .join(GameSession)
        .filter(
            GameSession.player_id == player_id,
            func.date_part("month", Bet.placed_at) == now_utc.month,
            func.date_part("year", Bet.placed_at) == now_utc.year
        )
        .scalar()
    )

    return {
        "daily_bet_limit": limits.daily_bet_limit,
        "daily_bet_used": float(daily_used),
        "daily_bet_remaining": (
            float(limits.daily_bet_limit - daily_used)
            if limits.daily_bet_limit is not None
            else None
        ),

        "monthly_bet_limit": limits.monthly_bet_limit,
        "monthly_bet_used": float(monthly_used),
        "monthly_bet_remaining": (
            float(limits.monthly_bet_limit - monthly_used)
            if limits.monthly_bet_limit is not None
            else None
        ),

        "self_exclusion_until": limits.self_exclusion_until
    }