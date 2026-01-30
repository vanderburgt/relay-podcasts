import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import CreateAccountResponse, VerifyRequest, VerifyResponse
from app.services.key_service import generate_key, hash_key

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/create", response_model=CreateAccountResponse, status_code=201)
async def create_account(db: AsyncSession = Depends(get_db)) -> CreateAccountResponse:
    key = generate_key()
    key_hash = hash_key(key)

    user = User(key_hash=key_hash)
    db.add(user)
    await db.commit()

    return CreateAccountResponse(key=key)


@router.post("/verify", response_model=VerifyResponse)
async def verify_key(body: VerifyRequest, db: AsyncSession = Depends(get_db)) -> VerifyResponse:
    try:
        key_hash = hash_key(body.key)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid key")

    result = await db.execute(select(User).where(User.key_hash == key_hash))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid key")

    user.last_active = datetime.now(timezone.utc)
    await db.commit()

    encrypted_blob = None
    if user.encrypted_blob is not None:
        encrypted_blob = base64.b64encode(user.encrypted_blob).decode("ascii")

    return VerifyResponse(
        valid=True,
        encrypted_blob=encrypted_blob,
        created_at=user.created_at,
    )


@router.delete("/account", status_code=204)
async def delete_account(body: VerifyRequest, db: AsyncSession = Depends(get_db)) -> None:
    try:
        key_hash = hash_key(body.key)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid key")

    result = await db.execute(select(User).where(User.key_hash == key_hash))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid key")

    await db.delete(user)
    await db.commit()
