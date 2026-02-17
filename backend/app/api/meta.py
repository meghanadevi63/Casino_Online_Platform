from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.meta import (
    CountryMeta,
    CurrencyMeta,
    GameCategoryMeta,
    RoleMeta
)
from app.services.meta_service import (
    get_countries,
    get_currencies,
    get_game_categories,
    get_roles
)

router = APIRouter(
    prefix="/meta",
    tags=["Meta"]
)


@router.get("/countries", response_model=List[CountryMeta])
def meta_countries(db: Session = Depends(get_db)):
    return get_countries(db)


@router.get("/currencies", response_model=List[CurrencyMeta])
def meta_currencies(db: Session = Depends(get_db)):
    return get_currencies(db)


@router.get("/game-categories", response_model=List[GameCategoryMeta])
def meta_game_categories(db: Session = Depends(get_db)):
    return get_game_categories(db)


@router.get("/roles", response_model=List[RoleMeta])
def meta_roles(db: Session = Depends(get_db)):
    return get_roles(db)
