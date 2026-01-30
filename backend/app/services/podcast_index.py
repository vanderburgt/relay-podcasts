import hashlib
import time

import httpx
from fastapi import HTTPException

from app.config import settings

BASE_URL = "https://api.podcastindex.org/api/1.0"


def _get_headers() -> dict[str, str]:
    timestamp = str(int(time.time()))
    auth_string = settings.podcast_index_key + settings.podcast_index_secret + timestamp
    auth_hash = hashlib.sha1(auth_string.encode()).hexdigest()

    return {
        "X-Auth-Date": timestamp,
        "X-Auth-Key": settings.podcast_index_key,
        "Authorization": auth_hash,
        "User-Agent": "Relay/1.0",
    }


async def _request(path: str, params: dict | None = None) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{BASE_URL}{path}",
            params=params,
            headers=_get_headers(),
        )

        if response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limited by PodcastIndex. Try again shortly.")

        response.raise_for_status()
        return response.json()


async def search(query: str) -> dict:
    return await _request("/search/byterm", params={"q": query})


async def get_podcast(podcast_id: int) -> dict:
    return await _request("/podcasts/byfeedid", params={"id": podcast_id})


async def get_episodes(podcast_id: int, max_results: int = 50) -> dict:
    return await _request(
        "/episodes/byfeedid",
        params={"id": podcast_id, "max": max_results},
    )


async def get_episode(episode_id: int) -> dict:
    return await _request("/episodes/byid", params={"id": episode_id})
