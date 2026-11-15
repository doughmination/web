export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number
    ) {
        super(message);
    }
}

export type ErrorBody = { detail?: string; error?: string | { message?: string } };

export function errorMessage(body: ErrorBody | null, status: number): string {
    const error = typeof body?.error === 'string' ? body.error : body?.error?.message;
    return body?.detail ?? error ?? `Request failed (${status})`;
}