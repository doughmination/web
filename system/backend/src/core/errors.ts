/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Lightweight stand-in for FastAPI's HTTPException.
 * Thrown anywhere in the app, caught by the error-handling middleware
 * (added in main.ts), and translated into a JSON response.
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly headers?: Record<string, string>;

  constructor(statusCode: number, detail: string, headers?: Record<string, string>) {
    super(detail);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.headers = headers;
  }
}