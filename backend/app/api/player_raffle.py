from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.raffle_jackpot import JackpotResponse, JackpotJoinResponse
from app.services.raffle_service import get_available_jackpots_for_player, join_jackpot_logic
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType

router = APIRouter(prefix="/raffle", tags=["Player - Jackpot Raffle"])

@router.get("/available", response_model=List[JackpotResponse])
def list_available_jackpots(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Fetches all jackpots (Active and Completed) matching the player's 
    current CASH wallet currency.
    """
    # 1. Find player's primary cash wallet to determine their currency
    wallet = db.query(Wallet).join(WalletType).filter(
        Wallet.player_id == current_user.user_id,
        WalletType.wallet_type_code == 'CASH'
    ).first()
    
    if not wallet:
        # If no cash wallet is found, the player cannot participate in any jackpots
        return []
        
    # 2. Call the service which now returns both 'active' and 'completed' jackpots
    return get_available_jackpots_for_player(
        db, 
        current_user.tenant_id, 
        current_user.user_id, 
        wallet.currency_id
    )

@router.post("/{jackpot_id}/join", response_model=JackpotJoinResponse)
def player_join_jackpot(jackpot_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Deducts entry fee from CASH wallet and registers player for the raffle.
    """
    return join_jackpot_logic(
        db, 
        current_user.user_id, 
        current_user.tenant_id, 
        jackpot_id
    )