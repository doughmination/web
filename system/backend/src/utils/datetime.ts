/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Datetime utility functions.
 *
 * Note: JS `Date` only carries millisecond precision (unlike Python's
 * microsecond-precision `datetime`), so any sub-millisecond digits in the
 * input are truncated rather than preserved. That's a non-issue in
 * practice here since the source data (PluralKit timestamps) is already
 * millisecond-or-coarser.
 */

const TIMESTAMP_PATTERN =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?([+-]\d{2}:\d{2})?$/;

/**
 * Parse a timestamp string with proper timezone handling.
 * Handles various ISO 8601 formats and excess fractional-second precision.
 *
 * @param timestampStr - ISO 8601 timestamp string
 * @returns A timezone-aware Date (UTC is assumed for inputs with no offset)
 * @throws Error if the timestamp cannot be parsed
 */
export function parseTimestamp(timestampStr: string): Date {
  try {
    let s = timestampStr;
    const hadExplicitTz = /[zZ]$|[+-]\d{2}:\d{2}$/.test(s);

    // Handle Z timezone indicator
    if (s.endsWith('Z') || s.endsWith('z')) {
      s = `${s.slice(0, -1)}+00:00`;
    }

    // Truncate fractional seconds to millisecond precision so `Date` can parse them
    const match = s.match(TIMESTAMP_PATTERN);
    if (match) {
      const [, base, frac, tz] = match;
      const fracPart = frac ? frac.slice(0, 4) : ''; // ".SSS" at most
      s = `${base}${fracPart}${tz ?? ''}`;
    }

    const dt = new Date(s);
    if (Number.isNaN(dt.getTime())) {
      throw new Error(`Could not parse timestamp: ${timestampStr}`);
    }

    if (!hadExplicitTz) {
      // Naive input: treat the parsed wall-clock value as UTC,
      // mirroring the Python fallback of dt.replace(tzinfo=timezone.utc)
      return new Date(
        Date.UTC(
          dt.getFullYear(),
          dt.getMonth(),
          dt.getDate(),
          dt.getHours(),
          dt.getMinutes(),
          dt.getSeconds(),
          dt.getMilliseconds(),
        ),
      );
    }

    return dt;
  } catch (err) {
    console.error(`Error parsing timestamp ${timestampStr}: ${String(err)}`);
    throw err;
  }
}