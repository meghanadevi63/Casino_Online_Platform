from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.player import Player
from app.models.role import Role
from app.models.wallet import Wallet
from app.models.game_session import GameSession
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.responsible_limit import ResponsibleLimit
from app.models.wallet_type import WalletType
from app.models.currency import Currency


ALLOWED_STATUSES = {"active", "suspended", "self_excluded", "closed"}


def admin_only(db: Session, current_user: User):
    role = db.query(Role).filter(Role.role_id == current_user.role_id).first()
    if not role or role.role_name not in ("TENANT_ADMIN", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Admin access required")


def list_players(db: Session, tenant_id):
    return (
        db.query(Player, User)
        .join(User, User.user_id == Player.player_id)
        .filter(User.tenant_id == tenant_id)
        .all()
    )


def get_player(db: Session, tenant_id, player_id):
    result = (
        db.query(Player, User)
        .join(User, User.user_id == Player.player_id)
        .filter(
            User.tenant_id == tenant_id,
            Player.player_id == player_id
        )
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Player not found")

    return result


def update_player_status(db: Session, tenant_id, player_id, status: str):
    if status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid player status")

    player = (
        db.query(Player)
        .join(User, User.user_id == Player.player_id)
        .filter(
            Player.player_id == player_id,
            User.tenant_id == tenant_id
        )
        .first()
    )

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player.status = status
    db.commit()
    db.refresh(player)

    return player

def get_player_summary(db: Session, tenant_id, player_id):
    # Player + User
    user = (
        db.query(User)
        .join(Player, Player.player_id == User.user_id)
        .filter(
            User.user_id == player_id,
            User.tenant_id == tenant_id
        )
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="Player not found")

    player = (
        db.query(Player)
        .filter(Player.player_id == player_id)
        .first()
    )

    #  Wallet + Currency (CASH wallet)
    wallet_row = (
        db.query(
            Wallet.balance,
            Currency.currency_code,
            Currency.symbol,
            Currency.decimal_places
        )
        .join(WalletType, Wallet.wallet_type_id == WalletType.wallet_type_id)
        .join(Currency, Currency.currency_id == Wallet.currency_id)
        .filter(
            Wallet.player_id == player_id,
            WalletType.wallet_type_code == "CASH"
        )
        .first()
    )

    if not wallet_row:
        raise HTTPException(
            status_code=404,
            detail="Cash wallet not found for player"
        )

    wallet_balance = float(wallet_row.balance)
    currency_code = wallet_row.currency_code
    currency_symbol = wallet_row.symbol
    decimal_places = wallet_row.decimal_places

    #  Sessions
    total_sessions = (
        db.query(func.count(GameSession.session_id))
        .filter(GameSession.player_id == player_id)
        .scalar()
    )

    #  Rounds
    total_rounds = (
        db.query(func.count(GameRound.round_id))
        .join(GameSession)
        .filter(GameSession.player_id == player_id)
        .scalar()
    )

    #  Bets
    totals = (
        db.query(
            func.coalesce(func.sum(Bet.bet_amount), 0),
            func.coalesce(func.sum(Bet.win_amount), 0)
        )
        .join(GameRound)
        .join(GameSession)
        .filter(GameSession.player_id == player_id)
        .first()
    )

    total_bet_amount = float(totals[0])
    total_win_amount = float(totals[1])
    ggr = total_bet_amount - total_win_amount

    #  Responsible limits
    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    return {
        "player_id": str(player.player_id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": player.status,
        "kyc_status": player.kyc_status,
        "country_code": user.country_code,

        "currency_code": currency_code,
        "currency_symbol": currency_symbol,
        "decimal_places": decimal_places,

        "created_at": user.created_at,
        "wallet_balance": wallet_balance,

        "total_sessions": total_sessions,
        "total_rounds": total_rounds,
        "total_bet_amount": total_bet_amount,
        "total_win_amount": total_win_amount,
        "ggr": ggr,

        "daily_bet_limit": float(limits.daily_bet_limit) if limits and limits.daily_bet_limit else None,
        "monthly_bet_limit": float(limits.monthly_bet_limit) if limits and limits.monthly_bet_limit else None,
        "self_exclusion_until": limits.self_exclusion_until if limits else None
    }
