from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.platform_inquiry import PlatformInquiry
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryUpdate, InquiryResponse
from app.services.notification_service import send_notification
from typing import List
router = APIRouter(prefix="/inquiries", tags=["Platform Inquiries"])

@router.post("/partner-request")
def partner_request(data: InquiryCreate, db: Session = Depends(get_db)):
    try:
        # 1. Save the Inquiry to Database
        new_inquiry = PlatformInquiry(
            name=data.name,
            email=data.email,
            company_name=data.company_name,
            message=data.message
        )
        db.add(new_inquiry)
        db.flush() # Get the ID before committing

        # 2. Notify all Super Admins (role_id 4)
        super_admins = db.query(User).filter(User.role_id == 4).all()
        
        for admin in super_admins:
            send_notification(
                db, 
                admin.user_id, 
                "New Partnership Lead", 
                f"Business inquiry from {data.name} ({data.company_name}). Check inquiries log.", 
                "PROMO"
            )
        
        db.commit()
        return {"message": "Request sent successfully. Our team will contact you."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

@router.get("", response_model=List[InquiryResponse])
def get_all_inquiries(
    status: str = None, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    #  Security: Only Super Admin
    if current_user.role_id != 4:
        raise HTTPException(status_code=403, detail="Super Admin access required")
    
    query = db.query(PlatformInquiry)
    if status:
        query = query.filter(PlatformInquiry.status == status)
    
    return query.order_by(PlatformInquiry.created_at.desc()).all()

@router.patch("/{inquiry_id}")
def update_inquiry_status(
    inquiry_id: str, 
    data: InquiryUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role_id != 4:
        raise HTTPException(status_code=403, detail="Super Admin access required")

    inquiry = db.query(PlatformInquiry).filter(PlatformInquiry.inquiry_id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    inquiry.status = data.status
    db.commit()
    return {"message": f"Status updated to {data.status}"}