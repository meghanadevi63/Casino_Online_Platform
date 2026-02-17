from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.game_session import GameSession
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.tenant_game import TenantGame
from app.models.game import Game


def generate_daily_snapshot(
    db: Session,
    tenant_id,
    snapshot_date: date | None = None
):
    
    if snapshot_date is None:
        snapshot_date = datetime.now(timezone.utc).date()

    #  Only games ENABLED for tenant
    tenant_games = (
        db.query(TenantGame)
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.is_active.is_(True)
        )
        .all()
    )

    results = []

    for tg in tenant_games:
        game_id = tg.game_id

        game = db.query(Game).filter(Game.game_id == game_id).first()
        if not game:
            continue

        # Sessions (func.date handles TIMESTAMPTZ correctly based on UTC session)
        total_sessions = (
            db.query(func.count(GameSession.session_id))
            .filter(
                GameSession.game_id == game_id,
                GameSession.tenant_id == tenant_id,
                func.date(GameSession.started_at) == snapshot_date
            )
            .scalar()
        )

        # Rounds
        total_rounds = (
            db.query(func.count(GameRound.round_id))
            .join(GameSession)
            .filter(
                GameSession.game_id == game_id,
                GameSession.tenant_id == tenant_id,
                func.date(GameSession.started_at) == snapshot_date
            )
            .scalar()
        )

        # Bets & Wins
        total_bets = (
            db.query(func.coalesce(func.sum(Bet.bet_amount), 0))
            .join(GameRound)
            .join(GameSession)
            .filter(
                GameSession.game_id == game_id,
                GameSession.tenant_id == tenant_id,
                func.date(Bet.placed_at) == snapshot_date
            )
            .scalar()
        )

        total_wins = (
            db.query(func.coalesce(func.sum(Bet.win_amount), 0))
            .join(GameRound)
            .join(GameSession)
            .filter(
                GameSession.game_id == game_id,
                GameSession.tenant_id == tenant_id,
                func.date(Bet.placed_at) == snapshot_date
            )
            .scalar()
        )

        total_players = (
            db.query(func.count(distinct(GameSession.player_id)))
            .filter(
                GameSession.game_id == game_id,
                GameSession.tenant_id == tenant_id,
                func.date(GameSession.started_at) == snapshot_date
            )
            .scalar()
        )

        ggr = total_bets - total_wins
        rtp = (total_wins / total_bets * 100) if total_bets > 0 else None

        snapshot = AnalyticsSnapshot(
            snapshot_date=snapshot_date,
            tenant_id=tenant_id,
            game_id=game_id,
            total_bets=total_bets,
            total_wins=total_wins,
            ggr=ggr,
            rtp_percentage=round(rtp, 2) if rtp else None,
            total_players=total_players,
            active_players=total_players
        )

        db.merge(snapshot)
        results.append(snapshot)

    db.commit()
    return {
        "snapshot_date": snapshot_date,
        "games_processed": len(results)
    }