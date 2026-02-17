from pydantic import BaseModel
from typing import Optional

class GameEligibilityResponse(BaseModel):
    eligible: bool
    reason: Optional[str] = None