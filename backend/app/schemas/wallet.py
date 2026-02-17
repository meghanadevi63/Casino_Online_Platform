from pydantic import BaseModel, Field
from typing import Optional, Literal
class DepositRequest(BaseModel):
    amount: float = Field(gt=0, description="Deposit amount must be > 0")

class WithdrawRequest(BaseModel):
    amount: float = Field(gt=0, description="Withdrawal amount must be > 0")


class AdminWithdrawalActionRequest(BaseModel):
    action: Literal["approve", "process", "complete", "reject"]
    rejection_reason: Optional[str] = Field(
        None, description="Required when action = reject"
    )
    gateway_reference: Optional[str] = Field(
        None, description="Required when action = complete"
    )