from collections.abc import AsyncGenerator

import httpx
from fastapi import Request

CHUNK_SIZE = 64 * 1024  # 64KB chunks
TIMEOUT = httpx.Timeout(10.0, read=None)  # No read timeout for streaming
IMAGE_TIMEOUT = httpx.Timeout(10.0)  # Normal timeout for images

# Headers to forward from client request
REQUEST_HEADERS = {
    "range",
    "if-range",
    "if-match",
    "if-none-match",
    "if-modified-since",
    "if-unmodified-since",
}

# Headers to forward from upstream response
RESPONSE_HEADERS = {
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
    "cache-control",
}


async def stream_audio(
    url: str, request: Request
) -> tuple[AsyncGenerator[bytes, None], int, dict[str, str]]:
    """
    Stream audio from a URL, forwarding Range headers for seeking support.

    Returns a tuple of (async generator, status code, response headers).
    """
    # Build headers to forward
    headers = {}
    for header in REQUEST_HEADERS:
        if value := request.headers.get(header):
            headers[header] = value

    client = httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True)

    try:
        response = await client.send(
            client.build_request("GET", url, headers=headers),
            stream=True,
        )

        # Build response headers
        response_headers = {}
        for header in RESPONSE_HEADERS:
            if value := response.headers.get(header):
                response_headers[header] = value

        async def generate() -> AsyncGenerator[bytes, None]:
            try:
                async for chunk in response.aiter_bytes(chunk_size=CHUNK_SIZE):
                    yield chunk
            finally:
                await response.aclose()
                await client.aclose()

        return generate(), response.status_code, response_headers

    except Exception:
        await client.aclose()
        raise


async def fetch_image(url: str) -> tuple[bytes, int, dict[str, str]]:
    """
    Fetch an image from a URL.

    Returns a tuple of (content bytes, status code, response headers).
    """
    async with httpx.AsyncClient(timeout=IMAGE_TIMEOUT, follow_redirects=True) as client:
        response = await client.get(url)

        response_headers = {}
        for header in ["content-type", "cache-control", "etag", "last-modified"]:
            if value := response.headers.get(header):
                response_headers[header] = value

        # Add long cache header for images
        if "cache-control" not in response_headers:
            response_headers["cache-control"] = "public, max-age=86400"

        return response.content, response.status_code, response_headers
