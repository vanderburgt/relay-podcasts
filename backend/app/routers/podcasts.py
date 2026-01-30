from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse

from app.services import podcast_index
from app.services.audio_proxy import stream_audio

router = APIRouter(tags=["podcasts"])


@router.get("/api/podcasts/search")
async def search_podcasts(q: str = Query(..., min_length=1)) -> dict:
    return await podcast_index.search(q)


@router.get("/api/podcasts/{podcast_id}")
async def get_podcast(podcast_id: int) -> dict:
    return await podcast_index.get_podcast(podcast_id)


@router.get("/api/podcasts/{podcast_id}/episodes")
async def get_episodes(podcast_id: int, max: int = Query(default=50, le=100)) -> dict:
    return await podcast_index.get_episodes(podcast_id, max_results=max)


@router.get("/api/episodes/{episode_id}")
async def get_episode(episode_id: int) -> dict:
    return await podcast_index.get_episode(episode_id)


@router.get("/api/proxy/audio")
async def proxy_audio(request: Request, url: str = Query(...)):
    """Proxy audio streams to hide user IP from podcast hosts."""
    generator, status_code, headers = await stream_audio(url, request)
    return StreamingResponse(generator, status_code=status_code, headers=headers)
