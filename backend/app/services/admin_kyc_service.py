from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime,timezone

from app.models.kyc_document import KYCDocument
from app.models.player import Player
from app.models.user import User
from app.services.notification_service import send_notification

def admin_process_kyc(
    db: Session,
    document_id: int,
    action: str,
    admin_user_id,
    tenant_id,
    rejection_reason: str | None = None
):
    #  Lock KYC document
    kyc = (
        db.query(KYCDocument)
        .filter(KYCDocument.document_id == document_id)
        .with_for_update()
        .first()
    )

    if not kyc:
        raise HTTPException(status_code=404, detail="KYC document not found")

    if kyc.verification_status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"KYC already processed ({kyc.verification_status})"
        )

    #  Tenant safety check
    user = (
        db.query(User)
        .filter(
            User.user_id == kyc.user_id,
            User.tenant_id == tenant_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=403,
            detail="KYC document does not belong to your tenant"
        )

    #  Lock player row
    player = (
        db.query(Player)
        .filter(Player.player_id == kyc.user_id)
        .with_for_update()
        .first()
    )

    now = datetime.now(timezone.utc)

    if action == "approve":
        kyc.verification_status = "verified"
        kyc.rejection_reason = None           
        kyc.verified_by = admin_user_id
        kyc.verified_at = now

        player.kyc_status = "verified"
        player.kyc_verified_at = now
        send_notification(
            db, kyc.user_id, 
            "Identity Verified", 
            "Congratulations! Your KYC documents have been verified. Withdrawal features are now unlocked.",
            "KYC"
        )

    #  REJECT
    elif action == "reject":
        if not rejection_reason:
            raise HTTPException(
                status_code=400,
                detail="Rejection reason required"
            )

        kyc.verification_status = "rejected"
        kyc.rejection_reason = rejection_reason  
        kyc.verified_by = admin_user_id
        kyc.verified_at = now

        player.kyc_status = "rejected"
        player.kyc_verified_at = None
        send_notification(
            db, kyc.user_id, 
            "KYC Rejected", 
            f"Identity verification failed. Reason: {rejection_reason}. Please re-upload valid documents.",
            "KYC"
        )

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.commit()

    return {
        "document_id": kyc.document_id,
        "user_id": str(kyc.user_id),
        "verification_status": kyc.verification_status,
        "player_kyc_status": player.kyc_status,
        "processed_at": now
    }


def list_pending_kyc(db: Session, tenant_id):
    rows = (
        db.query(
            KYCDocument.document_id,
            KYCDocument.user_id,
            User.email,
            KYCDocument.document_type,
            KYCDocument.document_number,
            KYCDocument.file_path,
            KYCDocument.verification_status,
            KYCDocument.uploaded_at
        )
        .join(User, User.user_id == KYCDocument.user_id)
        .join(Player, Player.player_id == User.user_id)
        .filter(
            User.tenant_id == tenant_id,
            KYCDocument.verification_status == "pending"
        )
        .order_by(KYCDocument.uploaded_at.desc())
        .all()
    )

    return [
        {
            "document_id": r.document_id,
            "user_id": r.user_id,
            "email": r.email,
            "document_type": r.document_type,
            "document_number": r.document_number,
            "file_url": r.file_path,
            "verification_status": r.verification_status,
            "uploaded_at": r.uploaded_at
        }
        for r in rows
    ]


def get_kyc_document(db: Session, document_id: int, tenant_id):
    row = (
        db.query(KYCDocument, User)
        .join(User, User.user_id == KYCDocument.user_id)
        .filter(
            KYCDocument.document_id == document_id,
            User.tenant_id == tenant_id
        )
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="KYC document not found")

    kyc, user = row

    return {
        "document_id": kyc.document_id,
        "user_id": user.user_id,
        "email": user.email,
        "document_type": kyc.document_type,
        "document_number": kyc.document_number,
        "file_url": kyc.file_path,
        "verification_status": kyc.verification_status,
        "rejection_reason": kyc.rejection_reason,  
        "uploaded_at": kyc.uploaded_at
    }


def get_kyc_history(
    db: Session,
    user_id,
    tenant_id
):
    rows = (
        db.query(
            KYCDocument.document_id,
            KYCDocument.document_type,
            KYCDocument.document_number,
            KYCDocument.file_path,
            KYCDocument.verification_status,
            KYCDocument.rejection_reason,
            KYCDocument.verified_at,
            KYCDocument.uploaded_at,
            User.email.label("verified_by_email")
        )
        .join(User, User.user_id == KYCDocument.verified_by, isouter=True)
        .filter(KYCDocument.user_id == user_id)
        .order_by(KYCDocument.uploaded_at.desc())
        .all()
    )

    if not rows:
        return []

    return [
        {
            "document_id": r.document_id,
            "document_type": r.document_type,
            "document_number": r.document_number,
            "file_url": r.file_path,
            "verification_status": r.verification_status,
            "rejection_reason": r.rejection_reason,
            "verified_by_email": r.verified_by_email,
            "verified_at": r.verified_at,
            "uploaded_at": r.uploaded_at
        }
        for r in rows
    ]
