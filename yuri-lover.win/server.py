from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
import os

app = FastAPI()

BASE_DIR = Path(__file__).parent
EXCLUDE = {".git", "requirements.txt", ".gitignore", "__pycache__", "script.js", "style.css", "index.html", "server.py", "Dockerfile"}

@app.get("/api/list")
def list_files(folder: str = ""):
    # Clean up the folder path
    folder = folder.strip().strip('/')
    
    if folder:
        full_path = BASE_DIR / folder
    else:
        full_path = BASE_DIR
    
    print(f"Requested folder: '{folder}'")
    print(f"Full path: {full_path}")
    print(f"Path exists: {full_path.exists()}")
    print(f"Is directory: {full_path.is_dir()}")
    
    if not full_path.exists():
        return JSONResponse({"error": f"Path does not exist: {folder}"}, status_code=404)
        
    if not full_path.is_dir():
        return JSONResponse({"error": f"Path is not a directory: {folder}"}, status_code=404)

    items = []
    try:
        for f in sorted(os.listdir(full_path)):
            if f.startswith(".") or f in EXCLUDE:
                continue
            item_path = full_path / f
            items.append({
                "name": f,
                "is_dir": item_path.is_dir(),
                "url": f"/{folder}/{f}".replace("//", "/") if folder else f"/{f}"
            })
    except PermissionError:
        return JSONResponse({"error": "Permission denied"}, status_code=403)
    
    return {"path": folder, "items": items}

# Serve frontend for all other routes
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index_file = BASE_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse({"error": "index.html not found"}, status_code=404)