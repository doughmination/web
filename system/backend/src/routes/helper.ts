/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Visitor logging helper.
 *
 * Logs page visits to SQLite + JSONL. The frontend pings POST /helper on
 * every route change (valid or 404), and this module records the visit
 * along with client IP, headers, fingerprint, etc.
 *
 * LogQuery is preserved for ad-hoc analysis (find by IP, path, time range,
 * suspicious patterns, CSV export) — not wired to any route, same as the
 * Python version, just available for scripts/tooling.
 *
 * Notes on the port:
 * - This uses Bun's built-in `bun:sqlite` module — a sync API that maps
 *   cleanly onto Python's sync `sqlite3` module, with no native compile
 *   step required (unlike the previous `better-sqlite3` dependency).
 * - Starlette parses `request.cookies` automatically; Express doesn't, so
 *   this uses the lightweight `cookie` package to parse the Cookie header
 *   by hand rather than pulling in full cookie-parser middleware app-wide.
 * - Python's `datetime.isoformat().replace("+00:00", "Z")` exists because
 *   Python's isoformat defaults to "+00:00"; `Date.toISOString()` in JS
 *   already ends in "Z", so no replace step is needed here.
 */

import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { Database } from 'bun:sqlite';
import { parse as parseCookies } from 'cookie';
import { Router, type Request, type Response } from 'express';

import { DATA_DIR } from '../core/config.js';

// ---------------------------------------------------------------------------
// Visitor logger
// ---------------------------------------------------------------------------

interface VisitorLogData {
  timestamp: string;
  unix_timestamp: number;
  ip_address: string;
  user_agent: string;
  referer: string;
  method: string;
  path: string;
  query_string: string;
  remote_addr: string;
  x_forwarded_for: string;
  x_real_ip: string;
  accept_language: string;
  accept_encoding: string;
  host: string;
  all_headers: Record<string, unknown>;
  cookies: Record<string, string | undefined>;
  body_size: number;
  response_code: number;
  request_time_ms: number;
  browser_fingerprint: string;
  country: string;
  asn: string;
}

class VisitorLogger {
  private db: Database;
  private logFile: string;

  constructor(dbPath: string, logFile: string) {
    this.logFile = logFile;
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        unix_timestamp REAL NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        referer TEXT,
        method TEXT,
        path TEXT,
        query_string TEXT,
        remote_addr TEXT,
        x_forwarded_for TEXT,
        x_real_ip TEXT,
        accept_language TEXT,
        accept_encoding TEXT,
        host TEXT,
        all_headers TEXT,
        cookies TEXT,
        body_size INTEGER,
        response_code INTEGER,
        request_time_ms REAL,
        browser_fingerprint TEXT,
        country TEXT,
        asn TEXT
      )
    `);

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_timestamp ON visitor_logs(timestamp)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_ip ON visitor_logs(ip_address)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_path ON visitor_logs(path)');
  }

  static getClientIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (xff) {
      const value = Array.isArray(xff) ? xff[0] : xff;
      return value.split(',')[0].trim();
    }
    for (const header of ['x-real-ip', 'cf-connecting-ip', 'true-client-ip']) {
      const value = req.headers[header];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }
    return req.socket.remoteAddress ?? '';
  }

  static getBrowserFingerprint(req: Request): string {
    const ua = req.headers['user-agent'] ?? '';
    const lang = req.headers['accept-language'] ?? '';
    const encoding = req.headers['accept-encoding'] ?? '';
    return createHash('md5').update(`${ua}|${lang}|${encoding}`).digest('hex');
  }

  logVisitor(
    req: Request,
    options: { path?: string; bodySize?: number; responseCode?: number; requestTimeMs?: number } = {},
  ): void {
    const now = new Date();
    const timestamp = now.toISOString();
    const unixTimestamp = now.getTime() / 1000;

    const cookies = parseCookies(req.headers.cookie ?? '');

    const logData: VisitorLogData = {
      timestamp,
      unix_timestamp: unixTimestamp,
      ip_address: VisitorLogger.getClientIp(req),
      user_agent: String(req.headers['user-agent'] ?? ''),
      referer: String(req.headers['referer'] ?? ''),
      method: req.method,
      // The frontend tells us which page it was on; fall back to the
      // actual request path if that wasn't supplied.
      path: options.path || req.path,
      query_string: req.url.includes('?') ? req.url.slice(req.url.indexOf('?') + 1) : '',
      remote_addr: req.socket.remoteAddress ?? '',
      x_forwarded_for: String(req.headers['x-forwarded-for'] ?? ''),
      x_real_ip: String(req.headers['x-real-ip'] ?? ''),
      accept_language: String(req.headers['accept-language'] ?? ''),
      accept_encoding: String(req.headers['accept-encoding'] ?? ''),
      host: String(req.headers.host ?? ''),
      all_headers: req.headers,
      cookies,
      body_size: options.bodySize ?? 0,
      response_code: options.responseCode ?? 200,
      request_time_ms: options.requestTimeMs ?? 0,
      browser_fingerprint: VisitorLogger.getBrowserFingerprint(req),
      country: 'Unknown', // Optional: integrate GeoIP
      asn: 'Unknown', // Optional: integrate ASN lookup
    };

    // JSONL on disk (easy to grep/tail)
    try {
      appendFileSync(this.logFile, `${JSON.stringify(logData)}\n`);
    } catch (err) {
      console.error(`Visitor log file write error: ${String(err)}`);
    }

    // SQLite for structured querying
    this.logToDb(logData);
  }

  private logToDb(logData: VisitorLogData): void {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO visitor_logs (
          timestamp, unix_timestamp, ip_address, user_agent, referer,
          method, path, query_string, remote_addr, x_forwarded_for,
          x_real_ip, accept_language, accept_encoding, host,
          all_headers, cookies, body_size, response_code,
          request_time_ms, browser_fingerprint, country, asn
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        logData.timestamp,
        logData.unix_timestamp,
        logData.ip_address,
        logData.user_agent,
        logData.referer,
        logData.method,
        logData.path,
        logData.query_string,
        logData.remote_addr,
        logData.x_forwarded_for,
        logData.x_real_ip,
        logData.accept_language,
        logData.accept_encoding,
        logData.host,
        JSON.stringify(logData.all_headers),
        JSON.stringify(logData.cookies),
        logData.body_size,
        logData.response_code,
        logData.request_time_ms,
        logData.browser_fingerprint,
        logData.country,
        logData.asn,
      );
    } catch (err) {
      console.error(`Database logging error: ${String(err)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export class LogQuery {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { readonly: true });
  }

  findByIp(ipAddress: string): unknown[] {
    return this.db
      .prepare('SELECT * FROM visitor_logs WHERE ip_address = ? ORDER BY timestamp DESC')
      .all(ipAddress);
  }

  findByPath(path: string): unknown[] {
    return this.db
      .prepare('SELECT * FROM visitor_logs WHERE path LIKE ? ORDER BY timestamp DESC')
      .all(`%${path}%`);
  }

  findByTimeRange(startTimestamp: number, endTimestamp: number): unknown[] {
    return this.db
      .prepare('SELECT * FROM visitor_logs WHERE unix_timestamp BETWEEN ? AND ? ORDER BY timestamp DESC')
      .all(startTimestamp, endTimestamp);
  }

  findSuspiciousPatterns(): unknown[] {
    return this.db
      .prepare(
        `
        SELECT ip_address, COUNT(*) as visit_count,
               MIN(timestamp) as first_visit, MAX(timestamp) as last_visit
        FROM visitor_logs
        WHERE unix_timestamp > (unixepoch('now') - 3600)
        GROUP BY ip_address
        HAVING COUNT(*) > 20
        ORDER BY visit_count DESC
      `,
      )
      .all();
  }

  exportToCsv(outputFile = 'visitor_logs.csv'): void {
    const rows = this.db.prepare('SELECT * FROM visitor_logs ORDER BY timestamp DESC').all() as Array<Record<string, unknown>>;

    if (rows.length === 0) {
      console.info('No logs to export');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];
    for (const row of rows) {
      csvLines.push(
        headers
          .map((h) => {
            const value = row[h] === null || row[h] === undefined ? '' : String(row[h]);
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(','),
      );
    }

    appendFileSync(outputFile, csvLines.join('\n'), { flag: 'w' });
    console.info(`Exported ${rows.length} entries to ${outputFile}`);
  }
}

// ---------------------------------------------------------------------------
// Express router
// ---------------------------------------------------------------------------

mkdirSync(DATA_DIR, { recursive: true });
export const DB_PATH = join(DATA_DIR, 'visitor_logs.db');
const LOG_FILE = join(DATA_DIR, 'visitor_logs.jsonl');

// Single shared logger instance for the lifetime of the process
const visitorLogger = new VisitorLogger(DB_PATH, LOG_FILE);

export const helperRouter = Router();

/** Log a page visit. Called by the frontend on every navigation. */
helperRouter.post('/helper', (req: Request, res: Response) => {
  const path = typeof req.body?.path === 'string' ? req.body.path : undefined;
  visitorLogger.logVisitor(req, { path });
  res.json({ ok: true });
});

/** GET fallback (e.g. sendBeacon image, no-CORS). */
helperRouter.get('/helper', (req: Request, res: Response) => {
  const path = typeof req.query.path === 'string' ? req.query.path : undefined;
  visitorLogger.logVisitor(req, { path });
  res.json({ ok: true });
});