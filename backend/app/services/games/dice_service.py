import random
from decimal import Decimal, ROUND_DOWN

from datetime import datetime, date, timezone 

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.wallet import Wallet
from app.models.wallet_type import WalletType
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.game_session import GameSession
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.game import Game
from app.models.tenant_game import TenantGame
from app.models.responsible_limit import ResponsibleLimit
from app.services.bonus_service import update_wagering_progress 

# Utilities

def get_transaction_type(db: Session, code: str) -> TransactionType:
    txn = (
        db.query(TransactionType)
        .filter(TransactionType.transaction_code == code)
        .first()
    )
    if not txn:
        raise HTTPException(
            status_code=500,
            detail=f"Transaction type '{code}' not configured"
        )
    return txn


def get_active_session(db: Session, player_id, game_id):
    return (
        db.query(GameSession)
        .filter(
            GameSession.player_id == player_id,
            GameSession.game_id == game_id,
            GameSession.status == "active"
        )
        .first()
    )



# Responsible Gaming

def enforce_responsible_gaming(db: Session, player_id, bet_amount: Decimal):
    limits = (
        db.query(ResponsibleLimit)
        .filter(ResponsibleLimit.player_id == player_id)
        .first()
    )

    if not limits:
        return

    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()

    if limits.self_exclusion_until and limits.self_exclusion_until >= today:
        raise HTTPException(status_code=403, detail="Player is self-excluded")

    daily_total = (
        db.query(func.coalesce(func.sum(Bet.bet_amount), 0))
        .join(GameRound)
        .join(GameSession)
        .filter(
            GameSession.player_id == player_id,
            func.date(Bet.placed_at) == today
        )
        .scalar()
    )

    if limits.daily_bet_limit and daily_total + bet_amount > limits.daily_bet_limit:
        raise HTTPException(status_code=403, detail="Daily betting limit exceeded")

    monthly_total = (
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

    if limits.monthly_bet_limit and monthly_total + bet_amount > limits.monthly_bet_limit:
        raise HTTPException(status_code=403, detail="Monthly betting limit exceeded")


# Dice Game Logic

def place_dice_bet(
    db: Session,
    player_id,
    tenant_id,
    game_id,
    bet_choice: str,
    amount,
):
    bet_choice = bet_choice.upper()
    amount = Decimal(str(amount)).quantize(
        Decimal("0.01"), rounding=ROUND_DOWN
    )

    if bet_choice not in ("EVEN", "ODD"):
        raise HTTPException(400, "Invalid bet choice")

    if amount <= 0:
        raise HTTPException(400, "Bet amount must be > 0")

    #  Active session REQUIRED
    session = get_active_session(db, player_id, game_id)
    if not session:
        raise HTTPException(
            status_code=400,
            detail="No active game session. Start session first."
        )

    # Tenant-game validation
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
        raise HTTPException(
            status_code=403,
            detail="Game not enabled for this tenant"
        )

    game = (
        db.query(Game)
        .filter(Game.game_id == game_id)
        .first()
    )

    #  Apply tenant overrides
    min_bet = (
        tenant_game.min_bet_override
        if tenant_game.min_bet_override is not None
        else game.min_bet
    )

    max_bet = (
        tenant_game.max_bet_override
        if tenant_game.max_bet_override is not None
        else game.max_bet
    )

    if min_bet is not None and amount < min_bet:
        raise HTTPException(400, f"Minimum bet is {min_bet}")

    if max_bet is not None and amount > max_bet:
        raise HTTPException(400, f"Maximum bet is {max_bet}")

    #  MODIFIED: Added missing Responsible Gaming enforcement
    enforce_responsible_gaming(db, player_id, amount)

    #  Lock CASH wallet
    wallet = (
        db.query(Wallet)
        .join(WalletType)
        .filter(
            Wallet.player_id == player_id,
            Wallet.tenant_id == tenant_id,
            WalletType.wallet_type_code == "CASH",
            Wallet.is_active.is_(True)
        )
        .with_for_update()
        .first()
    )

    if not wallet:
        raise HTTPException(404, "Cash wallet not found")

    if wallet.balance < amount:
        raise HTTPException(400, "Insufficient balance")

    
    now_aware = datetime.now(timezone.utc)

    #  Create round
    round_number = (
        db.query(func.count(GameRound.round_id))
        .filter(GameRound.session_id == session.session_id)
        .scalar()
    ) + 1

    game_round = GameRound(
        session_id=session.session_id,
        round_number=round_number,
        started_at=now_aware
    )
    db.add(game_round)
    db.flush()

    # Roll dice
    dice_roll = random.randint(1, 6)
    outcome = "EVEN" if dice_roll % 2 == 0 else "ODD"
    win = bet_choice == outcome

    win_amount = (
        (amount * Decimal("2.00")).quantize(
            Decimal("0.01"), rounding=ROUND_DOWN
        )
        if win else Decimal("0.00")
    )

    balance_before = wallet.balance
    balance_after = balance_before - amount + win_amount
    wallet.balance = balance_after

    #  Bet record
    bet = Bet(
        round_id=game_round.round_id,
        wallet_id=wallet.wallet_id,
        bet_currency_id=wallet.currency_id,
        bet_amount=amount,
        win_amount=win_amount,
        bet_status="settled",
        settled_at=now_aware
    )
    db.add(bet)
    db.flush()

    # bonus wagering progress
    update_wagering_progress(db, player_id, amount)

    #  Wallet transactions
    db.add(WalletTransaction(
        wallet_id=wallet.wallet_id,
        transaction_type_id=get_transaction_type(db, "BET").transaction_type_id,
        amount=-amount,
        balance_before=balance_before,
        balance_after=balance_before - amount,
        reference_type="DICE_BET",
        reference_id=bet.bet_id
    ))

    if win:
        db.add(WalletTransaction(
            wallet_id=wallet.wallet_id,
            transaction_type_id=get_transaction_type(db, "WIN").transaction_type_id,
            amount=win_amount,
            balance_before=balance_before - amount,
            balance_after=balance_after,
            reference_type="DICE_WIN",
            reference_id=bet.bet_id
        ))

    # Finalize round
    game_round.outcome = f"{dice_roll} ({outcome})"
    game_round.ended_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "session_id": session.session_id,
        "round_id": game_round.round_id,
        "dice_roll": dice_roll,
        "bet_choice": bet_choice,
        "outcome": outcome,
        "win": win,
        "win_amount": float(win_amount),
        "bet_amount": float(amount), 
        "balance_after": float(balance_after)
    }