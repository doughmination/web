import os
import json
from pathlib import Path
from fastapi import FastAPI, Depends, UploadFile, HTTPException, Query
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
# API Routes (must come before static file mounting)
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


# --------------------
# Admin Routes
# --------------------
@app.get("/yuri/admin", response_class=HTMLResponse)
def admin_panel(user: str = Depends(get_current_user)):
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Yuri Lover CDN Admin</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #0e0e1a; color: white; }
            form { background: #1a1a2e; padding: 20px; border-radius: 8px; }
            input[type="file"] { margin: 10px 0; }
            button { background: #ff6fff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #e55fe5; }
        </style>
    </head>
    <body>
        <h1>Yuri Lover CDN Admin</h1>
        <form action="/yuri/upload" enctype="multipart/form-data" method="post">
            <label for="file">Select file to upload:</label><br>
            <input name="file" type="file" required><br>
            <button type="submit">Upload to CDN</button>
        </form>
        
        <div id="result" style="margin-top: 20px;"></div>
        
        <script>
            // Show upload results
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get('status');
            const filename = urlParams.get('filename');
            if (status === 'success' && filename) {
                document.getElementById('result').innerHTML = 
                    `<p style="color: #4CAF50;">Successfully uploaded: ${filename}</p>
                     <p>File available at: <a href="/cdn/${filename}" target="_blank">/cdn/${filename}</a></p>`;
            }
        </script>
    </body>
    </html>
    """


@app.post("/yuri/upload")
async def upload_file(file: UploadFile, user: str = Depends(get_current_user)):
    try:
        # Save the file to CDN directory
        file_path = CDN_DIR / file.filename
        
        # Read and write file content
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        return {"status": "success", "filename": file.filename, "size": len(content)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# --------------------
# Static File Serving (must come after API routes)
# --------------------

# Serve CDN files
app.mount("/cdn", StaticFiles(directory=CDN_DIR), name="cdn")

# Serve frontend (HTML/CSS/JS) - this should be last
app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="frontend")