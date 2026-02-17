
from datetime import date, datetime, timezone 

from sqlalchemy.orm import Session
from app.models.game import Game
from app.models.tenant_game import TenantGame
from app.models.player import Player
from app.models.user import User
from app.models.responsible_limit import ResponsibleLimit
from app.models.game_country import GameCountry
from app.models.game_currency import GameCurrency
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType


def check_game_eligibility(
    db: Session,
    player_id,
    tenant_id,
    game_id
):
    # 1️Tenant-game validation (CRITICAL)
    tenant_game = (
        db.query(TenantGame)
        .join(Game, Game.game_id == TenantGame.game_id)
        .filter(
            TenantGame.tenant_id == tenant_id,
            TenantGame.game_id == game_id,
            TenantGame.is_active.is_(True),
            Game.is_active.is_(True)
        )
        .first()
    )

    if not tenant_game:
        return {
            "eligible": False,
            "reason": "Game not enabled for this tenant"
        }
    
    # 2️ Player check
    player = (
        db.query(Player)
        .filter(Player.player_id == player_id)
        .first()
    )

    if not player:
        return {"eligible": False, "reason": "Player not found"}

    if player.status != "active":
        return {
            "eligible": False,
            "reason": "Player account is not active"
        }

    # 3️ KYC check
    if player.kyc_status != "verified":
        return {
            "eligible": False,
            "reason": "KYC verification required"
        }

    # 4️ Self-exclusion
    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if limits and limits.self_exclusion_until:
        
        today = datetime.now(timezone.utc).date()
        if limits.self_exclusion_until >= today:
            return {
                "eligible": False,
                "reason": "Player is self-excluded"
            }

    # 5️ Player country (EXPLICIT USER QUERY)
    user = (
        db.query(User)
        .filter(
            User.user_id == player_id,
            User.tenant_id == tenant_id
        )
        .first()
    )

    user_country = user.country_code if user else None

    if user_country:
        country_allowed = (
            db.query(GameCountry)
            .filter(
                GameCountry.game_id == game_id,
                GameCountry.country_code == user_country,
                GameCountry.is_allowed.is_(True)
            )
            .first()
        )

        if not country_allowed:
            return {
                "eligible": False,
                "reason": "Game not allowed in your country"
            }

    # 6️ Currency restriction (CASH wallet)
    wallet = (
        db.query(Wallet)
        .join(WalletType)
        .filter(
            Wallet.player_id == player_id,
            Wallet.tenant_id == tenant_id,
            WalletType.wallet_type_code == "CASH",
            Wallet.is_active.is_(True)
        )
        .first()
    )

    if not wallet:
        return {
            "eligible": False,
            "reason": "Wallet not configured"
        }

    currency_allowed = (
        db.query(GameCurrency)
        .filter(
            GameCurrency.game_id == game_id,
            GameCurrency.currency_id == wallet.currency_id,
            GameCurrency.is_allowed.is_(True)
        )
        .first()
    )

    if not currency_allowed:
        return {
            "eligible": False,
            "reason": "Game not available for your currency"
        }

    return {
        "eligible": True,
        "reason": None
    }