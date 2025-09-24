import os
import json
from pathlib import Path
from fastapi import FastAPI, Depends, UploadFile, HTTPException, Query, Form
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()
USERNAME = os.getenv("CDN_USERNAME", "admin")
PASSWORD = os.getenv("CDN_PASSWORD", "password")

# Base directories
BASE_DIR = Path(__file__).parent
ROOT_DIR = BASE_DIR / "root"
CDN_DIR = BASE_DIR / "cdn"

# Create CDN directory if it doesn't exist
CDN_DIR.mkdir(exist_ok=True)

app = FastAPI()
security = HTTPBasic()

# --------------------
# Auth Helper
# --------------------
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username == USERNAME and credentials.password == PASSWORD:
        return credentials.username
    raise HTTPException(status_code=401, detail="Unauthorized")


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
async def list_all_folders(user: str = Depends(get_current_user)):
    """Get all folders in CDN for the upload dropdown"""
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
    file: UploadFile, 
    destination: str = Form(default=""),
    user: str = Depends(get_current_user)
):
    try:
        # Normalize destination path
        destination = destination.strip().strip("/")
        
        # Create destination directory if it doesn't exist
        if destination:
            dest_dir = CDN_DIR / destination
            dest_dir.mkdir(parents=True, exist_ok=True)
            file_path = dest_dir / file.filename
            relative_path = f"{destination}/{file.filename}"
        else:
            file_path = CDN_DIR / file.filename
            relative_path = file.filename
        
        # Security check - ensure we're not going outside CDN_DIR
        try:
            file_path.resolve().relative_to(CDN_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid destination path")
        
        # Read and write file content
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        return {
            "status": "success", 
            "filename": file.filename, 
            "size": len(content),
            "path": relative_path,
            "destination": destination if destination else "root"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# --------------------
# CDN File Serving Routes
# --------------------
@app.get("/cdn/{file_path:path}")
async def serve_cdn_file(file_path: str):
    """Serve files from CDN directory with /cdn/ prefix"""
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security check - only serve files with valid extensions
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', 
                         '.ico', '.pdf', '.txt', '.mp4', '.mp3', '.wav', '.zip', 
                         '.rar', '.7z', '.tar', '.gz', '.json', '.xml', '.csv'}
    
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


# Alternative route for backward compatibility (files accessible without /cdn/ prefix)
@app.get("/files/{file_path:path}")
async def serve_cdn_file_alt(file_path: str):
    """Alternative route for CDN files"""
    return await serve_cdn_file(file_path)


# --------------------
# Static File Serving (Frontend)
# --------------------
app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="frontend")