from datetime import datetime

from pydantic import BaseModel


class CreateAccountResponse(BaseModel):
    key: str


class VerifyRequest(BaseModel):
    key: str


class VerifyResponse(BaseModel):
    valid: bool
    encrypted_blob: str | None = None
    created_at: datetime | None = None


class ErrorResponse(BaseModel):
    valid: bool = False
    error: str


class DataRequest(BaseModel):
    encrypted_blob: str


class DataResponse(BaseModel):
    success: bool


class BlobResponse(BaseModel):
    encrypted_blob: str | None = None
