import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import crypto from 'crypto';
import { existsSync } from 'fs';

// Configuration
const config = {
  PORT: process.env.PORT || 8080,
  CDN_USERNAME: process.env.CDN_USERNAME || 'admin',
  CDN_PASSWORD: process.env.CDN_PASSWORD || 'password',
  SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET_KEY || '',
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || '',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  BASE_DIR: process.cwd(),
  get CDN_DIR() { return path.join(this.BASE_DIR, 'cdn'); },
  get WEB_DIR() { return path.join(this.BASE_DIR, 'web'); },
  get PAGES_DIR() { return path.join(this.WEB_DIR, 'pages'); },
  get STATIC_DIR() { return path.join(this.WEB_DIR, 'static'); },
};

// TEMPORARY DEBUG - REMOVE AFTER TESTING
console.log('🔐 Loaded credentials:');
console.log('   Username:', config.CDN_USERNAME);
console.log('   Password:', config.CDN_PASSWORD);
console.log('   Password length:', config.CDN_PASSWORD.length);

// Type augmentation for session
declare module 'express-session' {
  interface SessionData {
    username: string;
    authenticated: boolean;
  }
}

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [config.CDN_DIR, config.WEB_DIR, config.PAGES_DIR, config.STATIC_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

const app = express();

// Trust proxy - we're behind nginx
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', config.PAGES_DIR);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now, customize as needed
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'yuri_session',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many uploads, please try again later.'
});

app.use('/api/', limiter);

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  }
});

// --------------------
// Helper Functions
// --------------------

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!config.TURNSTILE_SECRET) {
    return true; // Skip if not configured
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', config.TURNSTILE_SECRET);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const result = await response.json() as { success: boolean };
    return result.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[^\w\s.-]/g, '_')
    .trim();
}

function isPathSafe(requestedPath: string, baseDir: string): boolean {
  const resolvedPath = path.resolve(baseDir, requestedPath);
  const resolvedBase = path.resolve(baseDir);
  return resolvedPath.startsWith(resolvedBase);
}

async function getUniqueFilePath(dir: string, filename: string): Promise<string> {
  let filePath = path.join(dir, filename);
  let counter = 1;

  while (existsSync(filePath)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const newFilename = `${base}_${counter}${ext}`;
    filePath = path.join(dir, newFilename);
    counter++;
  }

  return filePath;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// --------------------
// Middleware
// --------------------

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// --------------------
// Admin Routes
// --------------------

app.get('/yuri/admin', (req: Request, res: Response) => {
  if (req.session.authenticated) {
    return res.redirect('/yuri/upload');
  }
  
  res.render('admin_login', {
    turnstile_site_key: config.TURNSTILE_SITE_KEY,
    error: null
  });
});

app.post('/yuri/admin', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const turnstileToken = req.body['cf-turnstile-response'];
  const clientIp = getClientIp(req);

    // TEMPORARY DEBUG - REMOVE AFTER FIXING
  console.log('🔍 Login attempt:');
  console.log('   Received username:', username, '(length:', username?.length, ')');
  console.log('   Received password:', password, '(length:', password?.length, ')');
  console.log('   Expected username:', config.CDN_USERNAME, '(length:', config.CDN_USERNAME.length, ')');
  console.log('   Expected password:', config.CDN_PASSWORD, '(length:', config.CDN_PASSWORD.length, ')');
  console.log('   Username match:', username === config.CDN_USERNAME);
  console.log('   Password match:', password === config.CDN_PASSWORD);

  // Verify Turnstile
  if (config.TURNSTILE_SECRET) {
    const isValid = await verifyTurnstile(turnstileToken, clientIp);
    if (!isValid) {
      return res.render('admin_login', {
        turnstile_site_key: config.TURNSTILE_SITE_KEY,
        error: 'Verification failed. Please try again.'
      });
    }
  }

  // Verify credentials
  if (username === config.CDN_USERNAME && password === config.CDN_PASSWORD) {
    req.session.authenticated = true;
    req.session.username = username;
    return res.redirect('/yuri/upload');
  }

  res.render('admin_login', {
    turnstile_site_key: config.TURNSTILE_SITE_KEY,
    error: 'Invalid credentials. Please try again.'
  });
});

app.get('/yuri/upload', requireAuth, async (_req: Request, res: Response) => {
  const adminHtmlPath = path.join(config.PAGES_DIR, 'admin.html');
  return res.sendFile(adminHtmlPath);
});

app.get('/yuri/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.clearCookie('yuri_session');
    res.redirect('/');
  });
});

// --------------------
// API Routes
// --------------------

app.get('/api/list', async (req: Request, res: Response) => {
  try {
    const folder = ((req.query.folder as string) || '').replace(/^\/+|\/+$/g, '');
    const targetDir = path.join(config.CDN_DIR, folder);

    if (!isPathSafe(targetDir, config.CDN_DIR)) {
      return res.status(400).json({ error: 'Invalid folder path' });
    }

    if (!existsSync(targetDir)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const stat = await fs.stat(targetDir);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const files = await fs.readdir(targetDir);
    const items = await Promise.all(
      files
        .filter(file => !file.startsWith('.'))
        .map(async (file) => {
          const filePath = path.join(targetDir, file);
          const fileStat = await fs.stat(filePath);
          return {
            name: file,
            is_dir: fileStat.isDirectory(),
            size: fileStat.isFile() ? fileStat.size : null
          };
        })
    );

    items.sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return a.name.localeCompare(b.name);
    });

    return res.json({ items });
  } catch (error) {
    console.error('List files error:', error);
    return res.status(500).json({ error: 'Error listing files' });
  }
});

app.get('/api/folders', requireAuth, async (_req: Request, res: Response) => {
  try {
    const folders: string[] = [];

    async function scanFolders(dir: string, prefix: string = '') {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        if (file.startsWith('.')) continue;
        
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          const folderPath = prefix ? `${prefix}/${file}` : file;
          folders.push(folderPath);
          await scanFolders(filePath, folderPath);
        }
      }
    }

    await scanFolders(config.CDN_DIR);
    return res.json({ folders });
  } catch (error) {
    console.error('List folders error:', error);
    return res.status(500).json({ error: 'Error listing folders' });
  }
});

app.post('/api/upload', requireAuth, uploadLimiter, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const destination = (req.body.destination || '').replace(/^\/+|\/+$/g, '');
    const safeFilename = sanitizeFilename(req.file.originalname);

    // Determine target directory
    let targetDir = config.CDN_DIR;
    let relativePath = safeFilename;

    if (destination) {
      const destParts = destination.split('/').filter((part: string) => part && part !== '.' && part !== '..');
      if (destParts.length > 0) {
        targetDir = path.join(config.CDN_DIR, ...destParts);
        relativePath = path.join(...destParts, safeFilename);
      }
    }

    // Security check
    if (!isPathSafe(targetDir, config.CDN_DIR)) {
      return res.status(400).json({ error: 'Invalid destination path' });
    }

    // Create directory if needed
    await fs.mkdir(targetDir, { recursive: true });

    // Get unique file path
    const finalPath = await getUniqueFilePath(targetDir, safeFilename);
    const finalFilename = path.basename(finalPath);
    
    // Update relative path if filename changed
    if (finalFilename !== safeFilename) {
      if (destination) {
        const destParts = destination.split('/').filter((part: string) => part && part !== '.' && part !== '..');
        relativePath = destParts.length > 0 
          ? path.join(...destParts, finalFilename)
          : finalFilename;
      } else {
        relativePath = finalFilename;
      }
    }

    // Write file
    await fs.writeFile(finalPath, req.file.buffer);

    return res.json({
      status: 'success',
      filename: finalFilename,
      original_filename: req.file.originalname,
      size: req.file.size,
      path: relativePath.replace(/\\/g, '/'),
      destination: destination || 'root',
      url: `/cdn/${relativePath.replace(/\\/g, '/')}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// --------------------
// CDN File Serving Routes
// --------------------

const allowedExtensions = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
  '.pdf', '.txt', '.mp4', '.mp3', '.wav',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.xz',
  '.json', '.jsonc', '.xml', '.csv', '.md', '.js'
]);

app.get('/cdn/:filePath(*)', async (req: Request, res: Response) => {
  try {
    const filePath = req.params.filePath as string;
    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fullPath = path.join(config.CDN_DIR, filePath);

    // Security check
    if (!isPathSafe(fullPath, config.CDN_DIR)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.sendFile(fullPath);
  } catch (error) {
    console.error('File serving error:', error);
    return res.status(500).json({ error: 'Error serving file' });
  }
});

// Alternative route
app.get('/files/:filePath(*)', async (req: Request, res: Response) => {
  const filePath = req.params.filePath as string;
  if (!filePath) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const fullPath = path.join(config.CDN_DIR, filePath);

  // Security check
  if (!isPathSafe(fullPath, config.CDN_DIR)) {
    return res.status(404).json({ error: 'File not found' });
  }

  if (!existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = await fs.stat(fullPath);
  if (!stat.isFile()) {
    return res.status(404).json({ error: 'File not found' });
  }

  return res.sendFile(fullPath);
});

// --------------------
// Static File Serving (Frontend)
// --------------------

app.get('/app.css', (_req: Request, res: Response) => {
  const cssPath = path.join(config.STATIC_DIR, 'css', 'app.css');
  if (!existsSync(cssPath)) {
    return res.status(404).send('CSS file not found');
  }
  return res.sendFile(cssPath);
});

app.get('/app.js', (_req: Request, res: Response) => {
  const jsPath = path.join(config.STATIC_DIR, 'js', 'app.js');
  if (!existsSync(jsPath)) {
    return res.status(404).send('JS file not found');
  }
  return res.sendFile(jsPath);
});

// Catch-all route
app.get('/:fullPath(*)', (req: Request, res: Response) => {
  const fullPath = (req.params.fullPath || '') as string;
  
  // Skip API and admin routes
  if (fullPath.startsWith('api/') || fullPath.startsWith('yuri/')) {
    return res.status(404).send('Not Found');
  }
  
  // Check for static assets
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf'];
  if (staticExtensions.some(ext => fullPath.endsWith(ext))) {
    const filePath = path.join(config.WEB_DIR, fullPath);
    if (existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).send('Not Found');
  }
  
  // Serve index.html for SPA
  const indexPath = path.join(config.PAGES_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(404).send('index.html not found');
  }
  
  return res.sendFile(indexPath);
});

// --------------------
// Start Server
// --------------------

async function startServer() {
  try {
    await ensureDirectories();
    
    app.listen(config.PORT, () => {
      console.log(`🚀 CDN Server running on http://0.0.0.0:${config.PORT}`);
      console.log(`📁 CDN Directory: ${config.CDN_DIR}`);
      console.log(`🌐 Web Directory: ${config.WEB_DIR}`);
      console.log(`🔐 Admin Panel: http://localhost:${config.PORT}/yuri/admin`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();