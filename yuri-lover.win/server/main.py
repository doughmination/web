import os
import json
from pathlib import Path
from fastapi import FastAPI, Depends, UploadFile, HTTPException, Query, Form, Request, Response
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
import httpx
import secrets
from datetime import datetime, timedelta

# Load credentials from .env
load_dotenv()
USERNAME = os.getenv("CDN_USERNAME", "admin")
PASSWORD = os.getenv("CDN_PASSWORD", "password")
TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET_KEY", "")
TURNSTILE_SITE_KEY = os.getenv("TURNSTILE_SITE_KEY", "")

# Base directories - use current working directory when run as module
BASE_DIR = Path.cwd()
CDN_DIR = BASE_DIR / "cdn"
WEB_DIR = BASE_DIR / "web"
PAGES_DIR = WEB_DIR / "pages"
STATIC_DIR = WEB_DIR / "static"

# Create CDN directory if it doesn't exist
CDN_DIR.mkdir(exist_ok=True)

app = FastAPI()
templates = Jinja2Templates(directory=str(PAGES_DIR))

# Simple in-memory session storage (use Redis or database in production)
sessions = {}

# --------------------
# Session Management
# --------------------
def create_session(username: str) -> str:
    """Create a new session and return session token"""
    session_token = secrets.token_urlsafe(32)
    sessions[session_token] = {
        "username": username,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    return session_token

def get_session(session_token: str) -> dict:
    """Get session data if valid"""
    if not session_token or session_token not in sessions:
        return None
    
    session = sessions[session_token]
    if datetime.now() > session["expires_at"]:
        # Session expired, remove it
        del sessions[session_token]
        return None
    
    return session

def cleanup_expired_sessions():
    """Remove expired sessions"""
    now = datetime.now()
    expired_tokens = [token for token, session in sessions.items() if now > session["expires_at"]]
    for token in expired_tokens:
        del sessions[token]

def require_auth(request: Request):
    """Check if user is authenticated via session"""
    cleanup_expired_sessions()
    session_token = request.cookies.get("yuri_session")
    session = get_session(session_token)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session["username"]

# --------------------
# Turnstile Verification
# --------------------
async def verify_turnstile(token: str, ip: str) -> bool:
    """Verify Cloudflare Turnstile token"""
    if not TURNSTILE_SECRET:
        return True  # Skip verification if no secret key configured
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": TURNSTILE_SECRET,
                "response": token,
                "remoteip": ip
            }
        )
        result = response.json()
        return result.get("success", False)

# --------------------
# Admin Routes
# --------------------
@app.get("/yuri/admin", response_class=HTMLResponse)
async def admin_login(request: Request):
    """Show admin login page"""
    # Check if already authenticated
    try:
        require_auth(request)
        return RedirectResponse(url="/yuri/upload", status_code=302)
    except HTTPException:
        pass  # Not authenticated, show login page
    
    return templates.TemplateResponse("admin_login.html", {
        "request": request,
        "turnstile_site_key": TURNSTILE_SITE_KEY
    })

@app.post("/yuri/admin")
async def admin_login_post(request: Request):
    """Handle admin login with Turnstile verification"""
    form_data = await request.form()
    username = form_data.get("username")
    password = form_data.get("password")
    turnstile_token = form_data.get("cf-turnstile-response")
    
    # Get client IP
    client_ip = request.client.host
    if "x-forwarded-for" in request.headers:
        client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
    
    # Verify Turnstile
    if not await verify_turnstile(turnstile_token, client_ip):
        return templates.TemplateResponse("admin_login.html", {
            "request": request,
            "turnstile_site_key": TURNSTILE_SITE_KEY,
            "error": "Verification failed. Please try again."
        })
    
    # Verify credentials
    if username == USERNAME and password == PASSWORD:
        # Create session
        session_token = create_session(username)
        
        # Redirect to upload page with session cookie
        response = RedirectResponse(url="/yuri/upload", status_code=302)
        response.set_cookie(
            key="yuri_session",
            value=session_token,
            max_age=86400,  # 24 hours
            httponly=True,
            secure=True,
            samesite="lax"
        )
        return response
    else:
        return templates.TemplateResponse("admin_login.html", {
            "request": request,
            "turnstile_site_key": TURNSTILE_SITE_KEY,
            "error": "Invalid credentials. Please try again."
        })

@app.get("/yuri/upload", response_class=HTMLResponse)
async def upload_page(request: Request):
    """Show upload page (requires authentication)"""
    user = require_auth(request)  # This will raise HTTPException if not authenticated
    return FileResponse(PAGES_DIR / "admin.html")

@app.get("/yuri/logout")
async def logout(request: Request):
    """Logout and clear session"""
    session_token = request.cookies.get("yuri_session")
    if session_token and session_token in sessions:
        del sessions[session_token]
    
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie("yuri_session")
    return response

# --------------------
# API Routes
# --------------------
@app.get("/api/list")
async def list_files(folder: str = Query(default="")):
    """List files and folders in the CDN directory"""
    try:
        # Normalize the folder path
        folder = folder.strip("/")
        target_dir = CDN_DIR / folder if folder else CDN_DIR
        
        # Security check - ensure we're not going outside CDN_DIR
        try:
            target_dir.resolve().relative_to(CDN_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid folder path")
        
        if not target_dir.exists():
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if not target_dir.is_dir():
            raise HTTPException(status_code=400, detail="Path is not a directory")
        
        items = []
        
        # Get all items in the directory
        for item in sorted(target_dir.iterdir()):
            # Skip hidden files and directories
            if item.name.startswith('.'):
                continue
                
            items.append({
                "name": item.name,
                "is_dir": item.is_dir(),
                "size": item.stat().st_size if item.is_file() else None
            })
        
        return {"items": items}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@app.get("/api/folders")
async def list_all_folders(request: Request):
    """Get all folders in CDN for the upload dropdown"""
    user = require_auth(request)  # Require authentication
    
    try:
        folders = []
        
        def scan_folders(path: Path, prefix: str = ""):
            for item in sorted(path.iterdir()):
                if item.is_dir() and not item.name.startswith('.'):
                    folder_path = f"{prefix}{item.name}" if prefix else item.name
                    folders.append(folder_path)
                    # Recursively scan subdirectories
                    scan_folders(item, f"{folder_path}/")
        
        scan_folders(CDN_DIR)
        return {"folders": folders}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing folders: {str(e)}")

@app.post("/api/upload")
async def upload_file(
    request: Request,
    file: UploadFile, 
    destination: str = Form(default="")
):
    """Upload file to CDN directory"""
    user = require_auth(request)  # Require authentication
    
    try:
        # Read file content first
        content = await file.read()
        
        # Check file size (limit to 100MB)
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 100MB)")
        
        # Validate filename
        if not file.filename or file.filename == '':
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Sanitize filename - remove path separators and dangerous characters
        safe_filename = file.filename.replace('/', '_').replace('\\', '_').replace('..', '_')
        
        # Normalize destination path
        destination = destination.strip().strip("/")
        
        # Create destination directory if it doesn't exist
        if destination:
            # Normalize path separators and remove any dangerous components
            dest_parts = [part for part in destination.split('/') if part and part not in ['.', '..']]
            if not dest_parts:  # If all parts were filtered out, use root
                destination = ""
                dest_dir = CDN_DIR
                file_path = dest_dir / safe_filename
                relative_path = safe_filename
            else:
                dest_path_str = '/'.join(dest_parts)
                dest_dir = CDN_DIR / dest_path_str
                dest_dir.mkdir(parents=True, exist_ok=True)
                file_path = dest_dir / safe_filename
                relative_path = f"{dest_path_str}/{safe_filename}"
        else:
            dest_dir = CDN_DIR
            file_path = dest_dir / safe_filename
            relative_path = safe_filename
        
        # Security check - ensure we're not going outside CDN_DIR
        try:
            resolved_path = file_path.resolve()
            cdn_resolved = CDN_DIR.resolve()
            resolved_path.relative_to(cdn_resolved)
        except (ValueError, OSError):
            raise HTTPException(status_code=400, detail="Invalid destination path")
        
        # Check if file already exists and create unique name if needed
        original_file_path = file_path
        counter = 1
        while file_path.exists():
            name_parts = safe_filename.rsplit('.', 1)
            if len(name_parts) > 1:
                base_name, extension = name_parts
                new_filename = f"{base_name}_{counter}.{extension}"
            else:
                new_filename = f"{safe_filename}_{counter}"
            
            file_path = dest_dir / new_filename
            counter += 1
            
            # Update relative path with new filename
            if destination:
                dest_parts = [part for part in destination.split('/') if part and part not in ['.', '..']]
                if dest_parts:
                    relative_path = f"{'/'.join(dest_parts)}/{new_filename}"
                else:
                    relative_path = new_filename
            else:
                relative_path = new_filename
        
        # Write file content
        try:
            with open(file_path, "wb") as f:
                f.write(content)
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")
        
        return {
            "status": "success", 
            "filename": file_path.name,
            "original_filename": file.filename,
            "size": len(content),
            "path": relative_path,
            "destination": destination if destination else "root",
            "url": f"/cdn/{relative_path}"
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# --------------------
# CDN File Serving Routes
# --------------------
@app.get("/cdn/{file_path:path}")
@app.head("/cdn/{file_path:path}")
async def serve_cdn_file(file_path: str):
    """Serve files from CDN directory with /cdn/ prefix"""
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security check - only serve files with valid extensions
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', 
                         '.ico', '.pdf', '.txt', '.mp4', '.mp3', '.wav', '.zip', 
                         '.rar', '.7z', '.tar', '.gz', '.json', '.xml', '.csv',
                         '.jsonc', '.md', '.js', '.xz'}
    
    file_path_obj = Path(file_path)
    if file_path_obj.suffix.lower() not in allowed_extensions:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if file exists in CDN directory
    full_path = CDN_DIR / file_path
    
    # Security check - ensure we're not going outside CDN_DIR
    try:
        full_path.resolve().relative_to(CDN_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
    
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(full_path)

# Alternative route for backward compatibility
@app.get("/files/{file_path:path}")
@app.head("/files/{file_path:path}")
async def serve_cdn_file_alt(file_path: str):
    """Alternative route for CDN files"""
    return await serve_cdn_file(file_path)

# --------------------
# Static File Serving (Frontend)
# --------------------

# Serve static CSS and JS files
@app.get("/app.css")
async def serve_app_css():
    """Serve app.css"""
    css_path = STATIC_DIR / "css" / "app.css"
    if not css_path.exists():
        raise HTTPException(status_code=404, detail="CSS file not found")
    return FileResponse(css_path, media_type="text/css")

@app.get("/app.js")
async def serve_app_js():
    """Serve app.js"""
    js_path = STATIC_DIR / "js" / "app.js"
    if not js_path.exists():
        raise HTTPException(status_code=404, detail="JS file not found")
    return FileResponse(js_path, media_type="application/javascript")

# Serve index.html for all non-API, non-CDN routes
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """Catch-all route to serve index.html for SPA routing"""
    # Skip if it's an API or admin route (these are handled above)
    if full_path.startswith("api/") or full_path.startswith("yuri/"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    # Check if requesting a static asset (CSS, JS, etc.)
    static_extensions = {'.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf'}
    if any(full_path.endswith(ext) for ext in static_extensions):
        file_path = WEB_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        raise HTTPException(status_code=404, detail="Not Found")
    
    # For all other routes (including folder paths), serve index.html
    index_path = PAGES_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    
    return FileResponse(index_path)

# --------------------
# Run the server
# --------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True  # Enable auto-reload during development
    )