from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.services.key_service import hash_key


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    key = authorization.removeprefix("Bearer ").strip()
    if not key:
        raise HTTPException(status_code=401, detail="Missing key")

    try:
        key_hash = hash_key(key)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid key")

    result = await db.execute(select(User).where(User.key_hash == key_hash))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid key")

    user.last_active = datetime.now(timezone.utc)
    await db.commit()

    return user
