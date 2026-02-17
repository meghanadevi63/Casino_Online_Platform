from fastapi import FastAPI
from app.core.database import engine
import app.core.cloudinary
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.core.scheduler import start_scheduler
from app.api import wallets
from app.api import auth
from app.api import admin_withdrawals
from app.api import kyc
from app.api import admin_kyc
from app.api import game_sessions
from app.api.games import dice
from app.api.games import even_odd
from app.api.games import history
from app.api import notifications
from app.api import tenants
from app.api import countries
from app.api import users
from app.api.games import games as player_games
from app.api import responsible_gaming
from app.api import admin_analytics
from app.api import admin_players
from app.api import coin_toss
from app.api.super.game_providers import router as super_game_providers_router
from app.api.super.tenants import router as super_tenants_router
from app.api.super import games as super_games
from app.api.super import tenant_games
from app.api import admin_analytics_snapshot
from app.api.admin_timeseries import router as admin_timeseries_router
from app.api.super_analytics import router as super_analytics_router
from app.api import super_timeseries
from app.api import admin_scheduler
from app.api.super.tenant_countries import router as super_tenant_countries_router
from app.api.super.tenant_country_currencies import router as super_tenant_country_currencies_router
from app.api.super.tenant_admins import router as super_tenant_admins_router
from app.api.super.tenant_providers import router as super_tenant_providers_router
from app.api.super.game_countries import router as super_game_countries_router
from app.api.super.game_currencies import router as super_game_currencies_router
from app.api.meta import router as meta_router
from app.api.super import provider_games
from app.api.super import audit_logs
from app.api.admin_marketplace import router as admin_marketplace
from app.api.super.requests import router as super_requests_router 
from app.api.admin import games as admin_games_router
from app.api import inquiries

from app.models.user import User
from app.models.wallet import Wallet
from app.api import admin_bonuses, player_bonuses

from app.api import admin_raffle, player_raffle 




app = FastAPI(
    title="Casino Platform API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    #allow_origins=[
    #    "http://localhost:5173",
    #    "http://127.0.0.1:5173",
    #],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(wallets.router)
app.include_router(auth.router)

app.include_router(kyc.router)
app.include_router(admin_bonuses.router)
app.include_router(player_bonuses.router)
app.include_router(game_sessions.router)
app.include_router(dice.router)
app.include_router(even_odd.router)
app.include_router(coin_toss.router)
app.include_router(history.router)
app.include_router(notifications.router)
app.include_router(tenants.router)
app.include_router(countries.router)
app.include_router(users.router)
app.include_router(player_games.router)
app.include_router(player_raffle.router) 

app.include_router(responsible_gaming.router)
app.include_router(admin_analytics_snapshot.router)
app.include_router(admin_analytics.router)
app.include_router(admin_timeseries_router)
app.include_router(admin_players.router)
app.include_router(admin_kyc.router)
app.include_router(admin_withdrawals.router)
app.include_router(admin_marketplace)
app.include_router(admin_games_router.router)
app.include_router(admin_raffle.router) 



app.include_router(super_game_providers_router)
app.include_router(super_tenants_router)
app.include_router(super_games.router)
app.include_router(tenant_games.router)
app.include_router(super_analytics_router)
app.include_router(super_timeseries.router)
app.include_router(admin_scheduler.router)
app.include_router(super_tenant_countries_router)
app.include_router(super_tenant_country_currencies_router)

app.include_router(inquiries.router)

app.include_router(super_tenant_admins_router)
app.include_router(super_tenant_providers_router)
app.include_router(super_game_countries_router)
app.include_router(super_game_currencies_router)
app.include_router(meta_router)
app.include_router(provider_games.router)
app.include_router(audit_logs.router)
app.include_router(super_requests_router)

@app.on_event("startup")
def start_background_jobs():
    start_scheduler()

@app.get("/test/wallets")
def test_wallets(db: Session = Depends(get_db)):
    wallets = db.query(Wallet).all()
    return [
        {
            "wallet_id": str(w.wallet_id),
            "player_id": str(w.player_id),
            "balance": float(w.balance)
        }
        for w in wallets
    ]


@app.get("/test/users")
def test_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "email": u.email,
            "tenant_id": str(u.tenant_id),
            "role_id": u.role_id,
            "status": u.status
        }
        for u in users
    ]

@app.get("/test/db-summary")
def db_summary(db: Session = Depends(get_db)):
    return {
        "countries": db.execute(text("SELECT COUNT(*) FROM countries")).scalar(),
        "currencies": db.execute(text("SELECT COUNT(*) FROM currencies")).scalar(),
        "wallet_types": db.execute(text("SELECT COUNT(*) FROM wallet_types")).scalar(),
        "tenants": db.execute(text("SELECT COUNT(*) FROM tenants")).scalar()
    }

@app.get("/test/countries")
def test_countries(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM countries"))
    return [dict(row._mapping) for row in result]


@app.get("/db-tables")
def list_tables(db: Session = Depends(get_db)):
    result = db.execute(
        text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        """)
    )
    return [row[0] for row in result]

@app.get("/")
def health_check():
    return {"status": "Backend is running"}

@app.get("/db-check")
def db_check():
    try:
        with engine.connect():
            return {"status": "Database connected successfully"}
    except Exception as e:
        return {
            "status": "Database connection failed",
            "error": str(e)
        }