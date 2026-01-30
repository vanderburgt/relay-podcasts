import hashlib
import secrets

import base58


def generate_key() -> str:
    """Generate a 256-bit random key, Base58 encoded."""
    random_bytes = secrets.token_bytes(32)
    return base58.b58encode(random_bytes).decode("ascii")


def hash_key(key: str) -> str:
    """Hash a key with SHA-256 for storage."""
    key_bytes = base58.b58decode(key)
    return hashlib.sha256(key_bytes).hexdigest()
