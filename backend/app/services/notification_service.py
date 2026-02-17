from sqlalchemy.orm import Session
from app.models.notification import Notification

def send_notification(db: Session, user_id: str, title: str, message: str, notif_type: str):
    new_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type
    )
    db.add(new_notif)
    # Note: No db.commit() here, we let the parent service handle the transaction