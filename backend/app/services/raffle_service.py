from sqlalchemy.orm import Session
from sqlalchemy import func, desc, exists,or_ 
from fastapi import HTTPException
from datetime import datetime, timezone
from decimal import Decimal

# Models
from app.models.raffle_jackpot import RaffleJackpot
from app.models.raffle_entry import RaffleEntry
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.user import User
from app.models.tenant_country_currency import TenantCountryCurrency
from app.models.currency import Currency

# Schemas
from app.schemas.raffle_jackpot import JackpotCreate, JackpotResponse

# Notifications
from app.services.notification_service import send_notification

def create_new_jackpot(db: Session, tenant_id: str, data: JackpotCreate):
    new_jackpot = RaffleJackpot(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        currency_id=data.currency_id,
        jackpot_type=data.jackpot_type,
        seed_amount=data.seed_amount,
        current_amount=data.seed_amount,
        entry_fee=data.entry_fee,
        draw_at=data.draw_at,
        target_amount=data.target_amount,
        status='active'
    )
    db.add(new_jackpot)
    db.commit()
    db.refresh(new_jackpot)
    return new_jackpot

def get_available_jackpots_for_player(db: Session, tenant_id: str, player_id: str, player_currency_id: int):
    """
    Returns both Active and Completed jackpots for the player's currency.
    Includes winner details for completed jackpots.
    """
    # Joined with User to get Winner details for the "Past Winners" tab
    rows = db.query(RaffleJackpot, Currency.symbol, User).join(
        Currency, RaffleJackpot.currency_id == Currency.currency_id
    ).outerjoin(
        User, RaffleJackpot.winner_id == User.user_id
    ).filter(
        RaffleJackpot.tenant_id == tenant_id,
        RaffleJackpot.currency_id == player_currency_id,
        RaffleJackpot.status.in_(['active', 'completed']) # Allow both statuses
    ).order_by(desc(RaffleJackpot.created_at)).all()

    results = []
    for j, sym, winner_user in rows:
        # Check if the current player joined this jackpot
        already_joined = db.query(exists().where(
            (RaffleEntry.jackpot_id == j.jackpot_id) & (RaffleEntry.player_id == player_id)
        )).scalar()
        
        # Get total participant count
        count = db.query(func.count(RaffleEntry.entry_id)).filter(RaffleEntry.jackpot_id == j.jackpot_id).scalar()
        
        # Validate data against schema
        jackpot_data = JackpotResponse.model_validate(j)
        jackpot_data.is_joined = already_joined
        jackpot_data.participants_count = count
        jackpot_data.currency_symbol = sym 
        
        #  If jackpot is completed, add winner details for UI
        if winner_user:
            jackpot_data.winner_name = f"{winner_user.first_name} {winner_user.last_name}"
            jackpot_data.winner_email = winner_user.email

        results.append(jackpot_data)

    return results

def join_jackpot_logic(db: Session, player_id: str, tenant_id: str, jackpot_id: str):
    jackpot = db.query(RaffleJackpot).filter(
        RaffleJackpot.jackpot_id == jackpot_id,
        RaffleJackpot.tenant_id == tenant_id
    ).with_for_update().first()

    if not jackpot or jackpot.status != 'active':
        raise HTTPException(400, "Jackpot is not active or not found")

    now = datetime.now(timezone.utc)
    if jackpot.jackpot_type == "TIME_BASED" and now >= jackpot.draw_at:
        raise HTTPException(400, "Entry closed: Time limit reached")
    
    if jackpot.jackpot_type == "THRESHOLD" and jackpot.current_amount >= jackpot.target_amount:
        raise HTTPException(400, "Entry closed: Target amount reached")

    existing = db.query(RaffleEntry).filter_by(jackpot_id=jackpot_id, player_id=player_id).first()
    if existing:
        raise HTTPException(400, "You have already joined this jackpot")

    wallet = db.query(Wallet).join(WalletType).filter(
        Wallet.player_id == player_id,
        Wallet.currency_id == jackpot.currency_id,
        Wallet.is_active == True,
        WalletType.wallet_type_code == 'CASH' 
    ).with_for_update().first()

    if not wallet:
        raise HTTPException(400, "Cash wallet not configured for this currency")

    if wallet.balance < jackpot.entry_fee:
        raise HTTPException(400, f"Insufficient balance. Required: {jackpot.entry_fee}, Available: {wallet.balance}")

    try:
        entry = RaffleEntry(
            jackpot_id=jackpot_id,
            player_id=player_id,
            wallet_id=wallet.wallet_id,
            amount_paid=jackpot.entry_fee
        )
        db.add(entry)
        balance_before = wallet.balance
        wallet.balance -= Decimal(str(jackpot.entry_fee))
        jackpot.current_amount += Decimal(str(jackpot.entry_fee))

        txn_type = db.query(TransactionType).filter_by(transaction_code="JACKPOT_ENTRY").first()
        db.add(WalletTransaction(
            wallet_id=wallet.wallet_id,
            transaction_type_id=txn_type.transaction_type_id,
            amount=-jackpot.entry_fee,
            balance_before=balance_before,
            balance_after=wallet.balance,
            reference_type="raffle_entries",
            reference_id=entry.entry_id
        ))

        db.commit()
        return {"message": "Successfully joined", "jackpot_id": jackpot.jackpot_id, "new_balance": float(wallet.balance)}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, "Internal error processing entry")

def perform_draw_logic(db: Session, tenant_id: str, jackpot_id: str):
    row = db.query(RaffleJackpot, Currency.symbol).join(
        Currency, RaffleJackpot.currency_id == Currency.currency_id
    ).filter(
        RaffleJackpot.jackpot_id == jackpot_id,
        RaffleJackpot.tenant_id == tenant_id
    ).with_for_update().first()

    if not row:
        raise HTTPException(404, "Jackpot not found")
    
    jackpot, sym = row
    if jackpot.status != 'active':
        raise HTTPException(400, "Jackpot not eligible for draw")

    now = datetime.now(timezone.utc)
    if jackpot.jackpot_type == "TIME_BASED" and now < jackpot.draw_at:
        raise HTTPException(400, "Cannot draw yet: Time has not passed")
    
    if jackpot.jackpot_type == "THRESHOLD" and jackpot.current_amount < jackpot.target_amount:
        raise HTTPException(400, "Cannot draw yet: Target amount not reached")

    # Pick Winner
    winner_entry = db.query(RaffleEntry).filter_by(jackpot_id=jackpot_id).order_by(func.random()).first()
    
    if not winner_entry:
        jackpot.status = 'cancelled'
        db.commit()
        # This message will trigger the "No Players Joined" Modal in frontend
        raise HTTPException(400, "No players joined. Jackpot cancelled.")

    # Process Winner Wallet
    winner_wallet = db.query(Wallet).filter_by(wallet_id=winner_entry.wallet_id).with_for_update().first()
    winner_user = db.query(User).filter_by(user_id=winner_entry.player_id).first()
    winner_full_name = f"{winner_user.first_name} {winner_user.last_name}"
    
    total_prize = jackpot.current_amount
    balance_before = winner_wallet.balance
    winner_wallet.balance += total_prize

    jackpot.status = 'completed'
    jackpot.winner_id = winner_entry.player_id
    jackpot.won_amount = total_prize
    jackpot.drawn_at = now

    txn_type = db.query(TransactionType).filter_by(transaction_code="JACKPOT_WIN").first()
    db.add(WalletTransaction(
        wallet_id=winner_wallet.wallet_id,
        transaction_type_id=txn_type.transaction_type_id,
        amount=total_prize,
        balance_before=balance_before,
        balance_after=winner_wallet.balance,
        reference_type="raffle_jackpots",
        reference_id=jackpot.jackpot_id
    ))

    # 1. Notify Winner (New Type: JACKPOT)
    send_notification(
        db,
        user_id=winner_entry.player_id,
        title="🎉 JACKPOT WINNER!",
        message=f"Incredible luck! You won the '{jackpot.name}' raffle! {sym}{float(total_prize)} added to your wallet.",
        notif_type="JACKPOT"
    )

    # 2. Notify All Non-Winners (Consolation message)
    other_participants = db.query(RaffleEntry.player_id).filter(
        RaffleEntry.jackpot_id == jackpot_id,
        RaffleEntry.player_id != winner_entry.player_id
    ).all()

    for (p_id,) in other_participants:
        send_notification(
            db,
            user_id=p_id,
            title="Jackpot Concluded",
            message=f"The '{jackpot.name}' draw is complete. The winner is {winner_full_name}. Better luck next time!",
            notif_type="JACKPOT"
        )

    db.commit()
    return {
        "jackpot_id": jackpot.jackpot_id, 
        "winner_id": jackpot.winner_id, 
        "winner_name": winner_full_name, 
        "winner_email": winner_user.email, 
        "amount_won": float(total_prize),
        "currency_symbol": sym 
    }

def cancel_jackpot_logic(db: Session, tenant_id: str, jackpot_id: str):
    jackpot = db.query(RaffleJackpot).filter(
        RaffleJackpot.jackpot_id == jackpot_id, 
        RaffleJackpot.tenant_id == tenant_id
    ).with_for_update().first()

    if not jackpot or jackpot.status != 'active':
        raise HTTPException(400, "Jackpot not found or already closed")

    entries = db.query(RaffleEntry).filter_by(jackpot_id=jackpot_id).all()
    txn_type = db.query(TransactionType).filter_by(transaction_code="JACKPOT_REFUND").first()

    for entry in entries:
        w = db.query(Wallet).filter_by(wallet_id=entry.wallet_id).with_for_update().first()
        if w:
            before = w.balance
            w.balance += entry.amount_paid
            db.add(WalletTransaction(
                wallet_id=w.wallet_id, 
                transaction_type_id=txn_type.transaction_type_id,
                amount=entry.amount_paid, 
                balance_before=before, 
                balance_after=w.balance,
                reference_type="raffle_jackpots", 
                reference_id=jackpot_id
            ))
            # Notify using JACKPOT type
            send_notification(db, entry.player_id, "Jackpot Cancelled", f"The jackpot '{jackpot.name}' was cancelled. Your entry fee has been refunded.", "JACKPOT")

    jackpot.status = 'cancelled'
    db.commit()
    return {"message": f"Jackpot cancelled. {len(entries)} players refunded."}

def get_admin_tenant_currencies(db: Session, tenant_id: str):
    return db.query(Currency.currency_id, Currency.currency_code)\
             .join(TenantCountryCurrency, TenantCountryCurrency.currency_id == Currency.currency_id)\
             .filter(TenantCountryCurrency.tenant_id == tenant_id)\
             .all()

def get_admin_jackpots_list(db: Session, tenant_id: str):
    participant_count_sub = (
        db.query(
            RaffleEntry.jackpot_id,
            func.count(RaffleEntry.entry_id).label("p_count")
        )
        .group_by(RaffleEntry.jackpot_id)
        .subquery()
    )

    rows = (
        db.query(RaffleJackpot, User, participant_count_sub.c.p_count, Currency.symbol)
        .outerjoin(User, RaffleJackpot.winner_id == User.user_id)
        .outerjoin(participant_count_sub, RaffleJackpot.jackpot_id == participant_count_sub.c.jackpot_id)
        .join(Currency, RaffleJackpot.currency_id == Currency.currency_id)
        .filter(RaffleJackpot.tenant_id == tenant_id)
        .order_by(desc(RaffleJackpot.created_at))
        .all()
    )

    results = []
    for jack, winner_user, count, sym in rows:
        data = JackpotResponse.model_validate(jack)
        data.participants_count = count or 0
        data.currency_symbol = sym 
        if winner_user:
            data.winner_name = f"{winner_user.first_name} {winner_user.last_name}"
            data.winner_email = winner_user.email
        results.append(data)
    
    return results