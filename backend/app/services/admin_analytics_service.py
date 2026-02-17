from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta, datetime, timezone
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.bet import Bet
from app.models.game import Game
from app.models.game_session import GameSession
from app.models.user import User
from app.models.raffle_entry import RaffleEntry
from app.models.bonus_usage import BonusUsage
from app.models.wallet import Wallet 
from app.models.raffle_entry import RaffleEntry
from app.models.game_round import GameRound
from app.models.tenant_country import TenantCountry
from app.models.country import Country
from app.models.currency import Currency

from app.models.withdrawal import Withdrawal
def get_games_analytics(db: Session, tenant_id):
    """
    Returns analytics for all games of a tenant
    using latest snapshot per game
    """
    subquery = (
        db.query(
            AnalyticsSnapshot.game_id,
            func.max(AnalyticsSnapshot.snapshot_date).label("latest_date")
        )
        .filter(AnalyticsSnapshot.tenant_id == tenant_id)
        .group_by(AnalyticsSnapshot.game_id)
        .subquery()
    )

    rows = (
        db.query(AnalyticsSnapshot, Game)
        .join(
            subquery,
            (AnalyticsSnapshot.game_id == subquery.c.game_id) &
            (AnalyticsSnapshot.snapshot_date == subquery.c.latest_date)
        )
        .join(Game, Game.game_id == AnalyticsSnapshot.game_id)
        .filter(AnalyticsSnapshot.tenant_id == tenant_id)
        .all()
    )

    return [
        {
            "game_id": game.game_id,
            "game_name": game.game_name,
            "total_sessions": snapshot.total_players,
            "total_rounds": None, 
            "total_bet_amount": float(snapshot.total_bets),
            "total_win_amount": float(snapshot.total_wins),
            "ggr": float(snapshot.ggr),
            "rtp_percentage": snapshot.rtp_percentage,
            "total_players": snapshot.total_players,
            "active_players": snapshot.active_players,
        }
        for snapshot, game in rows
    ]


def get_single_game_analytics(db: Session, tenant_id, game_id):
    snapshot = (
        db.query(AnalyticsSnapshot)
        .filter(
            AnalyticsSnapshot.tenant_id == tenant_id,
            AnalyticsSnapshot.game_id == game_id
        )
        .order_by(AnalyticsSnapshot.snapshot_date.desc())
        .first()
    )

    if not snapshot:
        return None

    game = db.query(Game).filter(Game.game_id == game_id).first()

    return {
        "game_id": game.game_id,
        "game_name": game.game_name,
        "total_sessions": snapshot.total_players,
        "total_rounds": None,
        "total_bet_amount": float(snapshot.total_bets),
        "total_win_amount": float(snapshot.total_wins),
        "ggr": float(snapshot.ggr),
        "rtp_percentage": snapshot.rtp_percentage,
        "total_players": snapshot.total_players,
        "active_players": snapshot.active_players,
    }


def get_games_analytics_by_date_range(
    db: Session,
    tenant_id,
    start_date: date,
    end_date: date
):
    rows = (
        db.query(
            AnalyticsSnapshot.game_id,
            Game.game_name,
            func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
            func.sum(AnalyticsSnapshot.total_players).label("total_players"),
            func.sum(AnalyticsSnapshot.active_players).label("active_players"),
        )
        .join(Game, Game.game_id == AnalyticsSnapshot.game_id)
        .filter(
            AnalyticsSnapshot.tenant_id == tenant_id,
            AnalyticsSnapshot.snapshot_date.between(start_date, end_date)
        )
        .group_by(AnalyticsSnapshot.game_id, Game.game_name)
        .all()
    )

    results = []
    for row in rows:
        rtp = (
            (row.total_wins / row.total_bets * 100)
            if row.total_bets and row.total_bets > 0
            else None
        )

        results.append({
            "game_id": row.game_id,
            "game_name": row.game_name,
            "total_sessions": row.total_players,
            "total_rounds": None,
            "total_bet_amount": float(row.total_bets or 0),
            "total_win_amount": float(row.total_wins or 0),
            "ggr": float(row.ggr or 0),
            "rtp_percentage": round(rtp, 2) if rtp else None,
            "total_players": int(row.total_players or 0),
            "active_players": int(row.active_players or 0),
        })

    return results


def get_tenant_dashboard_overview(db: Session, tenant_id):
   
    today_utc = datetime.now(timezone.utc).date()

    # 1. Calculate Aggregated Financials from Snapshots
    financials = db.query(
        func.sum(AnalyticsSnapshot.total_bets).label("total_bets"),
        func.sum(AnalyticsSnapshot.total_wins).label("total_wins"),
        func.sum(AnalyticsSnapshot.ggr).label("ggr")
    ).filter(AnalyticsSnapshot.tenant_id == tenant_id).first()

    # 2. Get Active Players
    active_players = db.query(func.count(User.user_id)).filter(
        User.tenant_id == tenant_id,
        User.role_id == 1,
        User.status == 'active'
    ).scalar()

    # 3. Get Time Series Data (Last 30 Days anchored to UTC)
    thirty_days_ago = today_utc - timedelta(days=30)
    
    timeseries_rows = db.query(
        AnalyticsSnapshot.snapshot_date.label("date"),
        func.sum(AnalyticsSnapshot.ggr).label("ggr")
    ).filter(
        AnalyticsSnapshot.tenant_id == tenant_id,
        AnalyticsSnapshot.snapshot_date >= thirty_days_ago
    ).group_by(AnalyticsSnapshot.snapshot_date)\
     .order_by(AnalyticsSnapshot.snapshot_date).all()

    total_bets = float(financials.total_bets or 0)
    total_wins = float(financials.total_wins or 0)
    ggr = float(financials.ggr or 0)
    rtp = (total_wins / total_bets * 100) if total_bets > 0 else 0

    return {
        "financials": {
            "ggr": ggr,
            "total_bets": total_bets,
            "total_wins": total_wins,
            "rtp": round(rtp, 2)
        },
        "players": {
            "active": active_players
        },
        "timeseries": [
            {"date": row.date, "ggr": float(row.ggr or 0)} 
            for row in timeseries_rows
        ]
    }

#live analytics
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, select
from datetime import datetime, timezone, timedelta, date
from app.models.bet import Bet
from app.models.game import Game
from app.models.game_session import GameSession
from app.models.game_round import GameRound
from app.models.wallet import Wallet 
from app.models.user import User
from app.models.raffle_entry import RaffleEntry
from app.models.bonus_usage import BonusUsage
from app.models.tenant_country import TenantCountry
from app.models.country import Country
from app.models.currency import Currency
from app.models.withdrawal import Withdrawal
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType

def get_tenant_realtime_dashboard(db: Session, tenant_id: str, country_code: str = None):
    """
    Corrected Simultaneous Real-Time Analytics Engine.
    Fixes DuplicateAlias error and Subquery coercion warnings.
    """
    today = datetime.now(timezone.utc).date()
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    # 1. Resolve Currency Symbol
    current_symbol = "₹" 
    if country_code:
        curr_row = db.query(Currency.symbol).join(TenantCountry, TenantCountry.currency_code == Currency.currency_code)\
            .filter(TenantCountry.tenant_id == tenant_id, TenantCountry.country_code == country_code).first()
        if curr_row:
            current_symbol = curr_row[0]

    # --- 2. FINANCIAL KPIs (Today) ---
    # We join Wallet and User here to cover both tenant_id and country_code in one join
    financials_query = db.query(
        func.coalesce(func.sum(Bet.bet_amount), 0).label("total_bets"),
        func.coalesce(func.sum(Bet.win_amount), 0).label("total_wins")
    ).join(Wallet, Bet.wallet_id == Wallet.wallet_id)\
     .join(User, Wallet.player_id == User.user_id)\
     .filter(User.tenant_id == tenant_id)\
     .filter(Bet.placed_at >= today)

    if country_code and country_code.strip():
        financials_query = financials_query.filter(User.country_code == country_code)

    financials = financials_query.first()
    t_bets = float(financials.total_bets)
    t_wins = float(financials.total_wins)
    ggr = t_bets - t_wins
    actual_rtp = round((t_wins / t_bets * 100), 2) if t_bets > 0 else 0.0

    # --- 3. STRATEGIC AUDIT ---
    
    # LTV: Deposits - Completed Withdrawals
    deposits_query = db.query(func.coalesce(func.sum(WalletTransaction.amount), 0))\
        .join(Wallet, WalletTransaction.wallet_id == Wallet.wallet_id)\
        .join(User, Wallet.player_id == User.user_id)\
        .join(TransactionType, WalletTransaction.transaction_type_id == TransactionType.transaction_type_id)\
        .filter(User.tenant_id == tenant_id, TransactionType.transaction_code == 'DEPOSIT')
    
    if country_code and country_code.strip():
        deposits_query = deposits_query.filter(User.country_code == country_code)
    deposits_total = float(deposits_query.scalar() or 0)

    payouts_query = db.query(func.coalesce(func.sum(Withdrawal.amount), 0))\
        .join(User, Withdrawal.player_id == User.user_id)\
        .filter(User.tenant_id == tenant_id, Withdrawal.status == 'completed')
    
    if country_code and country_code.strip():
        payouts_query = payouts_query.filter(User.country_code == country_code)
    payouts_total = float(payouts_query.scalar() or 0)
    
    ltv_total = deposits_total - payouts_total

    # Inactive Players (Task 3e)
    
    active_player_ids = select(GameSession.player_id).filter(GameSession.started_at >= thirty_days_ago)
    inactive_query = db.query(func.count(User.user_id)).filter(
        User.tenant_id == tenant_id,
        User.role_id == 1,
        ~User.user_id.in_(active_player_ids)
    )
    if country_code and country_code.strip():
        inactive_query = inactive_query.filter(User.country_code == country_code)
    inactive_count = inactive_query.scalar()

    # Stale Withdrawals
    stale_count = db.query(func.count(Withdrawal.withdrawal_id)).filter(
        Withdrawal.tenant_id == tenant_id, 
        Withdrawal.status == 'requested',
        Withdrawal.requested_at <= (now - timedelta(days=3))
    ).scalar()

    # 4. LIVE ENGAGEMENT 
    sessions_query = db.query(func.count(GameSession.session_id))\
        .join(User, GameSession.player_id == User.user_id)\
        .filter(User.tenant_id == tenant_id, GameSession.status == 'active')
    if country_code and country_code.strip():
        sessions_query = sessions_query.filter(User.country_code == country_code)
    active_sessions = sessions_query.scalar()

    new_regs_query = db.query(func.count(User.user_id)).filter(
        User.tenant_id == tenant_id, 
        func.date(User.created_at) == today
    )
    if country_code and country_code.strip():
        new_regs_query = new_regs_query.filter(User.country_code == country_code)
    new_regs = new_regs_query.scalar()

  
    raffle_query = db.query(func.coalesce(func.sum(RaffleEntry.amount_paid), 0))\
        .join(User, RaffleEntry.player_id == User.user_id)\
        .filter(User.tenant_id == tenant_id, func.date(RaffleEntry.created_at) == today)
    if country_code and country_code.strip():
        raffle_query = raffle_query.filter(User.country_code == country_code)
    raffle_sales = float(raffle_query.scalar() or 0)

    # --- 5. TOP GAMES ---
    game_stats_query = db.query(
        Game.game_id, Game.game_name,
        func.coalesce(func.sum(Bet.bet_amount), 0).label("gbets"),
        func.coalesce(func.sum(Bet.win_amount), 0).label("gwins"),
        func.count(func.distinct(GameSession.player_id)).label("players")
    ).join(GameSession, Game.game_id == GameSession.game_id)\
     .join(User, GameSession.player_id == User.user_id)\
     .join(GameRound, GameSession.session_id == GameRound.session_id)\
     .join(Bet, GameRound.round_id == Bet.round_id)\
     .filter(User.tenant_id == tenant_id, Bet.placed_at >= today)

    if country_code and country_code.strip():
        game_stats_query = game_stats_query.filter(User.country_code == country_code)

    game_rows = game_stats_query.group_by(Game.game_id, Game.game_name).all()


    # --- Task 3f: Bonus Utilization (Calculation) ---
    
    # 1. Count Total Bonuses ever started (all statuses)
    total_granted_query = db.query(func.count(BonusUsage.bonus_usage_id))\
        .join(User, BonusUsage.player_id == User.user_id)\
        .filter(User.tenant_id == tenant_id)
    
    if country_code and country_code.strip():
        total_granted_query = total_granted_query.filter(User.country_code == country_code)
    
    total_granted = total_granted_query.scalar() or 0

    # 2. Count only 'completed' bonuses
    total_completed_query = db.query(func.count(BonusUsage.bonus_usage_id))\
        .join(User, BonusUsage.player_id == User.user_id)\
        .filter(User.tenant_id == tenant_id, BonusUsage.status == 'completed')

    if country_code and country_code.strip():
        total_completed_query = total_completed_query.filter(User.country_code == country_code)
    
    total_completed = total_completed_query.scalar() or 0

    # 3. Calculate Percentage
    bonus_rate = round((total_completed / total_granted * 100), 2) if total_granted > 0 else 0.0

    
       

    return {
        "kpis": {
            "total_bets": t_bets,
            "total_wins": t_wins,
            "ggr": ggr,
            "actual_rtp": actual_rtp,
            "active_sessions": active_sessions,
            "new_registrations_today": new_regs,
            "total_raffle_sales_today": raffle_sales,
            "stale_withdrawals_count": stale_count,
            "player_ltv_total": ltv_total,
            "inactive_players_30d": inactive_count or 0,
            "bonus_utilization_rate": bonus_rate,
            "active_bonuses_value": 0.0
        },
        "top_games": [
            {
                "game_id": g.game_id, "game_name": g.game_name, 
                "bets_today": float(g.gbets), "wins_today": float(g.gwins),
                "ggr_today": float(g.gbets - g.gwins),
                "rtp_today": round((float(g.gwins)/float(g.gbets)*100), 2) if g.gbets > 0 else 0.0,
                "unique_players": g.players
            } for g in game_rows
        ],
        "currency_symbol": current_symbol,
        "updated_at": datetime.now(timezone.utc)
    }