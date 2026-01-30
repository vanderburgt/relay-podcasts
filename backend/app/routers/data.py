import base64

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import BlobResponse, DataRequest, DataResponse

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("", response_model=BlobResponse)
async def get_data(user: User = Depends(get_current_user)) -> BlobResponse:
    encrypted_blob = None
    if user.encrypted_blob is not None:
        encrypted_blob = base64.b64encode(user.encrypted_blob).decode("ascii")

    return BlobResponse(encrypted_blob=encrypted_blob)


@router.put("", response_model=DataResponse)
async def put_data(
    body: DataRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DataResponse:
    user.encrypted_blob = base64.b64decode(body.encrypted_blob)
    await db.commit()

    return DataResponse(success=True)
