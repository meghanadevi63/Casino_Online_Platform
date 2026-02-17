from sqlalchemy.orm import Session

from app.models.country import Country
from app.models.currency import Currency
from app.models.game_category import GameCategory
from app.models.role import Role


def get_countries(db: Session):
    return (
        db.query(Country)
        .order_by(Country.country_name)
        .all()
    )


def get_currencies(db: Session):
    return (
        db.query(Currency)
        .order_by(Currency.currency_code)
        .all()
    )


def get_game_categories(db: Session):
    return (
        db.query(GameCategory)
        .order_by(GameCategory.category_name)
        .all()
    )


def get_roles(db: Session):
    return (
        db.query(Role)
        .order_by(Role.role_id)
        .all()
    )
