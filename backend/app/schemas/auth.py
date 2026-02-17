from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    tenant_domain: str
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class RegisterRequest(BaseModel):
    tenant_domain: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    country_code: str = "IN"