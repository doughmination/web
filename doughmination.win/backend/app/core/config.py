"""
Configuration management for the application
Centralizes all environment variables and settings
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

load_dotenv()

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "dough-data"
STATIC_DIR = BASE_DIR / "static"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Data files
USERS_FILE = DATA_DIR / "users.json"
MENTAL_STATE_FILE = DATA_DIR / "mental_state.json"
MEMBER_TAGS_FILE = DATA_DIR / "member_tags.json"
MEMBER_STATUS_FILE = DATA_DIR / "member_status.json"
BOT_TOKEN_FILE = DATA_DIR / "bot_access_token.json"

# PluralKit API
PLURALKIT_BASE_URL = "https://api.pluralkit.me/v2"
SYSTEM_TOKEN = os.getenv("SYSTEM_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", 30))

# JWT Authentication
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-for-jwt")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Cloudflare Turnstile
TURNSTILE_SECRET = os.getenv("DOUGH_TURNSILE_SECRET")

# Admin user (for initial setup)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_DISPLAY_NAME = os.getenv("ADMIN_DISPLAY_NAME", "Administrator")

# File upload
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif']

# Default avatar
DEFAULT_AVATAR = "https://yuri-lover.win/cdn/pfp/fallback_avatar.png"

# Base URL
BASE_URL = os.getenv("BASE_URL", "https://doughmination.win").rstrip('/')

def get_cors_origins() -> List[str]:
    """Get CORS allowed origins"""
    return [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://www.doughmination.win",
        "http://www.doughmination.win",
        "http://frontend",
        "http://frontend:80",
        "http://doughmination.win",
        "https://doughmination.win"
    ]

def get_pluralkit_headers() -> dict:
    """Get headers for PluralKit API requests"""
    return {"Authorization": SYSTEM_TOKEN}