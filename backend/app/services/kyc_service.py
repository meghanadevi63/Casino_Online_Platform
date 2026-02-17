from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import cloudinary.uploader

from datetime import datetime, timezone

from app.models.kyc_document import KYCDocument
from app.models.player import Player


def upload_kyc_document(
    db: Session,
    player_id,
    document_type: str,
    document_number: str | None,
    file: UploadFile
):
    #  Validate player
    player = (
        db.query(Player)
        .filter(Player.player_id == player_id)
        .first()
    )

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    #  BLOCK if KYC already VERIFIED
    if player.kyc_status == "verified":
        raise HTTPException(
            status_code=400,
            detail="KYC already verified"
        )

    #  BLOCK multiple PENDING uploads
    existing_pending = (
        db.query(KYCDocument)
        .filter(
            KYCDocument.user_id == player_id,
            KYCDocument.verification_status == "pending"
        )
        .first()
    )

    if existing_pending:
        raise HTTPException(
            status_code=400,
            detail="KYC already pending review"
        )

    #  Upload to Cloudinary
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"kyc/{player_id}",
            resource_type="auto"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Cloudinary upload failed: {str(e)}"
        )

    cloudinary_url = result.get("secure_url")

    if not cloudinary_url:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve Cloudinary URL"
        )

    # Save KYC record (created_at is handled by DB)
    kyc = KYCDocument(
        user_id=player_id,
        document_type=document_type,
        document_number=document_number,
        file_path=cloudinary_url,
        verification_status="pending"
    )

    db.add(kyc)

    #  Update player KYC status
    player.kyc_status = "pending"
    player.kyc_verified_at = None

    db.commit()

    return {
        "message": "KYC document uploaded successfully",
        "kyc_status": player.kyc_status,
        "file_url": cloudinary_url
    }