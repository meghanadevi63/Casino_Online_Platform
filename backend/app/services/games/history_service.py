from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import desc

from datetime import datetime, timezone 

from app.models.game_session import GameSession
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.game import Game


def get_player_sessions(db: Session, player_id):
    """
    Fetches all game sessions for a player.
    Started_at is now a timezone-aware datetime.
    """
    rows = (
        db.query(
            GameSession.session_id,
            GameSession.game_id,
            Game.game_name,
            GameSession.status,
            GameSession.started_at,
            GameSession.ended_at,
        )
        .join(Game, Game.game_id == GameSession.game_id)
        .filter(GameSession.player_id == player_id)
        .order_by(desc(GameSession.started_at)) 
        .all()
    )

    return [
        {
            "session_id": r.session_id,
            "game_id": r.game_id,
            "game_name": r.game_name,
            "status": r.status,
            "started_at": r.started_at, # Becomes aware ISO string in JSON
            "ended_at": r.ended_at,
        }
        for r in rows
    ]


def get_session_rounds(db: Session, session_id, player_id):
    """
    Fetches rounds for a session and normalizes data.
    Uses the "Logic Trick" to deduce bet choice since it isn't in the DB.
    """
    session = db.query(GameSession).filter(
        GameSession.session_id == session_id,
        GameSession.player_id == player_id
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    rows = (
        db.query(GameRound, Bet)
        .join(Bet, Bet.round_id == GameRound.round_id)
        .filter(GameRound.session_id == session_id)
        .order_by(desc(GameRound.round_number))
        .all()
    )

    results = []
    for round_row, bet_row in rows:
        # 1. Normalize Outcome & Extract Dice Roll
        raw_outcome = round_row.outcome  # e.g., "5 (ODD)" or "HEAD"
        dice_roll = None
        clean_outcome = raw_outcome

        if raw_outcome and "(" in raw_outcome:
            # It's a Dice game result like "5 (ODD)"
            parts = raw_outcome.split("(")
            dice_roll = parts[0].strip()
            clean_outcome = parts[1].replace(")", "").strip() # "ODD"
        
        # 2. Deduce Player Choice (The "Logic Trick")
        win_amt = float(bet_row.win_amount)
        is_win = win_amt > 0
        
        deduced_choice = clean_outcome # Default for Win
        if not is_win:
            # Map Opposites for Losses
            opposites = {
                "EVEN": "ODD", "ODD": "EVEN",
                "HEAD": "TAIL", "TAIL": "HEAD"
            }
            deduced_choice = opposites.get(clean_outcome, "-")

        results.append({
            "round_id": round_row.round_id,
            "round_number": round_row.round_number,
            "outcome": clean_outcome,      
            "dice_roll": dice_roll,
            "bet_amount": float(bet_row.bet_amount),
            "win_amount": win_amt,
            "win": is_win,
            "bet_choice": deduced_choice,
            "player_choice": deduced_choice, 
            "created_at": round_row.started_at 
        })

    return results


def get_session_bets(db: Session, session_id, player_id):
    """
    Direct fetch of bets for a session.
    """
    session = db.query(GameSession).filter(
        GameSession.session_id == session_id,
        GameSession.player_id == player_id
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    return (
        db.query(Bet)
        .join(GameRound, GameRound.round_id == Bet.round_id)
        .filter(GameRound.session_id == session_id)
        .order_by(desc(Bet.placed_at))
        .all()
    )