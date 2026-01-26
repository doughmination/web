"""
Security utilities for authentication and authorization
Handles JWT tokens, password hashing, and Turnstile verification
"""

import httpx
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.hash import bcrypt
from fastapi import HTTPException, status

from app.core.config import (
    JWT_SECRET, 
    JWT_ALGORITHM, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    TURNSTILE_SECRET
)

logger = logging.getLogger(__name__)

# ============================================================================
# PASSWORD HASHING
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.verify(plain_password, hashed_password)

# ============================================================================
# JWT TOKEN MANAGEMENT
# ============================================================================

def create_access_token(data: dict) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

# ============================================================================
# TURNSTILE VERIFICATION
# ============================================================================

async def verify_turnstile_token(token: str, remote_ip: Optional[str] = None) -> bool:
    """
    Verify Cloudflare Turnstile token
    
    Args:
        token: Turnstile response token
        remote_ip: Client IP address (optional)
    
    Returns:
        True if verification succeeds
    
    Raises:
        HTTPException: If verification fails or server error
    """
    if not TURNSTILE_SECRET:
        logger.error("DOUGH_TURNSILE_SECRET environment variable not set")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )
    
    verify_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    
    data = {
        "secret": TURNSTILE_SECRET,
        "response": token,
    }
    
    if remote_ip:
        data["remoteip"] = remote_ip
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(verify_url, data=data)
            response.raise_for_status()
            
            result = response.json()
            
            if not result.get("success", False):
                logger.warning(f"Turnstile verification failed: {result.get('error-codes', [])}")
                return False
            
            logger.info("Turnstile verification successful")
            return True
            
    except httpx.RequestError as e:
        logger.error(f"Failed to verify Turnstile token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify security token"
        )
    except Exception as e:
        logger.error(f"Unexpected error during Turnstile verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Security verification error"
        )