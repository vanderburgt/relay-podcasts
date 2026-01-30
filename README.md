# Relay

A privacy-first, web-based podcast player. No tracking, no app store, no compromise.

## Features

- **Zero-knowledge encryption**: Your subscriptions and listening history are encrypted client-side. The server cannot read your data.
- **Single-key authentication**: No email, no password, no account recovery. Just one key that you control.
- **Native-like experience**: Lock screen controls, background playback, installable to home screen.
- **Streaming only**: No downloads, minimal data footprint.
- **Auto-cleanup**: Inactive accounts are deleted after 1 year.

## Quick start (development)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- [uv](https://github.com/astral-sh/uv) for Python package management
- PodcastIndex API credentials ([get them here](https://api.podcastindex.org/signup))

### Backend setup

```bash
cd backend
uv sync
cp ../.env.example .env
# Edit .env with your database URL and PodcastIndex credentials

# Run migrations
uv run alembic upgrade head

# Start the server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend setup

```bash
cd frontend
npm install
cp ../.env.example .env
# Edit .env if backend is not at localhost:8000

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` (Vite dev server) or `http://localhost:3000` (production build).

## Deployment with Coolify

1. Create a new project in Coolify
2. Add a Docker Compose deployment
3. Point to this repository
4. Set environment variables:
   - `DB_PASSWORD`: Strong random password
   - `PODCAST_INDEX_KEY`: Your API key
   - `PODCAST_INDEX_SECRET`: Your API secret
   - `PUBLIC_API_URL`: Your backend's public URL (e.g., `https://api.relay.example.com`)
   - `ORIGIN`: Your frontend's public URL (e.g., `https://relay.example.com`)
5. Deploy

### Reverse proxy configuration

If using a reverse proxy (Traefik, Caddy, nginx), ensure:
- WebSocket connections are supported (for future features)
- The `Origin` header is passed through correctly
- HTTPS is enforced in production

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend  │────▶│   Backend   │
│             │     │  (SvelteKit)│     │  (FastAPI)  │
│ - Crypto    │     │             │     │             │
│ - Storage   │     │ - UI        │     │ - Auth      │
│ - Playback  │     │ - Routing   │     │ - Blob store│
└─────────────┘     └─────────────┘     │ - PI proxy  │
                                        └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │ PodcastIndex│◀────│  PostgreSQL │
                    │     API     │     │             │
                    └─────────────┘     └─────────────┘
```

### Security model

1. User creates account → server generates 256-bit key → shown once
2. User saves key locally
3. Key is used for:
   - Authentication (server stores SHA-256 hash)
   - Encryption (AES-256-GCM, client-side only)
4. Server stores only: key hash, encrypted blob, timestamps
5. Server cannot decrypt user data

## Project structure

```
relay/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── dependencies.py
│       ├── routers/
│       │   ├── auth.py
│       │   ├── data.py
│       │   └── podcasts.py
│       └── services/
│           ├── key_service.py
│           ├── podcast_index.py
│           └── cleanup.py
│
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── svelte.config.js
    ├── static/
    │   └── manifest.json
    └── src/
        ├── app.html
        ├── app.css
        ├── lib/
        │   ├── api.ts
        │   ├── crypto.ts
        │   ├── store.ts
        │   ├── types.ts
        │   └── components/
        └── routes/
```

## API documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## License

MIT
