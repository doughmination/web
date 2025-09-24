import os
from pathlib import Path
from fastapi import FastAPI, Depends, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
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

app = FastAPI()
security = HTTPBasic()

# --------------------
# Public Routes
# --------------------

# Serve frontend (HTML/CSS/JS)
app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="frontend")

# Serve CDN files
app.mount("/cdn", StaticFiles(directory=CDN_DIR), name="cdn")


# --------------------
# Auth Helper
# --------------------
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username == USERNAME and credentials.password == PASSWORD:
        return credentials.username
    raise HTTPException(status_code=401, detail="Unauthorized")


# --------------------
# Admin Panel
# --------------------
@app.get("/yuri/admin", response_class=HTMLResponse)
def admin_panel(user: str = Depends(get_current_user)):
    return """
    <html>
    <body>
        <h1>Yuri Lover CDN Admin</h1>
        <form action="/yuri/upload" enctype="multipart/form-data" method="post">
            <input name="file" type="file" required>
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
    """


@app.post("/yuri/upload")
async def upload_file(file: UploadFile, user: str = Depends(get_current_user)):
    file_path = CDN_DIR / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"status": "ok", "filename": file.filename}
