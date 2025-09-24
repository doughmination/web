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
# API Routes (must come before file serving)
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
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background: #0e0e1a; 
                color: white; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
            }
            h1 { 
                color: #ff6fff; 
                text-align: center; 
                margin-bottom: 30px; 
            }
            .form-group { 
                margin-bottom: 20px; 
            }
            label { 
                display: block; 
                margin-bottom: 8px; 
                font-weight: bold; 
            }
            input, select { 
                width: 100%; 
                padding: 12px; 
                border: 2px solid #ff6fff; 
                border-radius: 8px; 
                background: #1a1a2e; 
                color: white; 
                font-size: 16px; 
            }
            input[type="file"] { 
                padding: 8px; 
            }
            button { 
                background: #ff6fff; 
                color: white; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                font-size: 16px; 
                width: 100%; 
                margin-top: 10px; 
            }
            button:hover { 
                background: #e55fe5; 
            }
            .form-container { 
                background: #1a1a2e; 
                padding: 30px; 
                border-radius: 12px; 
                border: 2px solid #ff6fff; 
            }
            #result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 8px; 
            }
            .success { 
                background: #2a5a2a; 
                color: #4CAF50; 
                border: 1px solid #4CAF50; 
            }
            .error { 
                background: #5a2a2a; 
                color: #f44336; 
                border: 1px solid #f44336; 
            }
            .new-folder { 
                display: none; 
                margin-top: 10px; 
            }
            .small-text { 
                font-size: 14px; 
                color: #aaa; 
                margin-top: 5px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>💖 Yuri Lover CDN Admin 💖</h1>
            
            <div class="form-container">
                <form id="uploadForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="file">Select file to upload:</label>
                        <input name="file" type="file" required>
                        <div class="small-text">Supported: images, videos, audio, documents, archives</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="destination">Upload destination:</label>
                        <select name="destination" id="destination">
                            <option value="">Root directory</option>
                            <option value="__new__">📁 Create new folder...</option>
                        </select>
                    </div>
                    
                    <div class="form-group new-folder" id="newFolderGroup">
                        <label for="newFolder">New folder path:</label>
                        <input type="text" id="newFolder" name="newFolder" placeholder="e.g., images/avatars or just avatars">
                        <div class="small-text">Use / to create nested folders (e.g., images/avatars)</div>
                    </div>
                    
                    <button type="submit">Upload to CDN</button>
                </form>
            </div>
            
            <div id="result"></div>
        </div>
        
        <script>
            const destinationSelect = document.getElementById('destination');
            const newFolderGroup = document.getElementById('newFolderGroup');
            const resultDiv = document.getElementById('result');
            
            // Load existing folders
            async function loadFolders() {
                try {
                    const response = await fetch('/api/folders');
                    const data = await response.json();
                    
                    // Clear existing options except root and new folder
                    while (destinationSelect.children.length > 2) {
                        destinationSelect.removeChild(destinationSelect.lastChild);
                    }
                    
                    // Add existing folders
                    data.folders.forEach(folder => {
                        const option = document.createElement('option');
                        option.value = folder;
                        option.textContent = `📁 ${folder}`;
                        destinationSelect.appendChild(option);
                    });
                } catch (err) {
                    console.error('Failed to load folders:', err);
                }
            }
            
            // Handle destination change
            destinationSelect.addEventListener('change', function() {
                if (this.value === '__new__') {
                    newFolderGroup.style.display = 'block';
                } else {
                    newFolderGroup.style.display = 'none';
                }
            });
            
            // Handle form submission
            document.getElementById('uploadForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const destination = destinationSelect.value;
                
                if (destination === '__new__') {
                    const newFolder = document.getElementById('newFolder').value.trim();
                    if (!newFolder) {
                        showResult('Please enter a folder name', 'error');
                        return;
                    }
                    formData.set('destination', newFolder);
                } else {
                    formData.set('destination', destination);
                }
                
                try {
                    resultDiv.innerHTML = '<p>Uploading...</p>';
                    
                    const response = await fetch('/yuri/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        showResult(`Successfully uploaded: ${result.filename}<br>
                                   Size: ${(result.size / 1024).toFixed(1)} KB<br>
                                   Location: <a href="/${result.path}" target="_blank" style="color: #ff6fff;">/${result.path}</a>`, 'success');
                        
                        // Reload folders and reset form
                        loadFolders();
                        this.reset();
                        newFolderGroup.style.display = 'none';
                    } else {
                        showResult(`Upload failed: ${result.detail}`, 'error');
                    }
                } catch (err) {
                    showResult(`Upload failed: ${err.message}`, 'error');
                }
            });
            
            function showResult(message, type) {
                resultDiv.innerHTML = `<div class="${type}">${message}</div>`;
            }
            
            // Load folders on page load
            loadFolders();
        </script>
    </body>
    </html>
    """


@app.post("/yuri/upload")
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
# File Serving Route (comes after API routes)
# --------------------
@app.get("/{file_path:path}")
async def serve_cdn_file(file_path: str):
    """Serve files from CDN directory"""
    # Don't serve empty paths or frontend files
    if not file_path or file_path in ['', 'index.html', 'script.js', 'style.css']:
        raise HTTPException(status_code=404, detail="Not found")
    
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


# --------------------
# Static File Serving (must come last)
# --------------------

# Serve frontend (HTML/CSS/JS) - this should be last to avoid conflicts
app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="frontend")