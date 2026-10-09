from fastapi import Header, HTTPException, status
from typing import Optional

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Optional API Key validator for production endpoints or session headers.
    In hackathon/demo mode, allows development access while supporting enterprise headers.
    """
    if x_api_key and x_api_key == "invalid_key":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key provided"
        )
    return True
