import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone';
import { format, parse } from 'date-fns';

/**
 * Converts a date from UTC to the client's timezone
 * @param utcDate - Date in UTC
 * @param timezone - IANA timezone (e.g., "America/Lima")
 * @returns Date in client's timezone
 */
export function utcToClientTimezone(utcDate: Date, timezone: string = 'America/Lima'): Date {
  return toZonedTime(utcDate, timezone);
}

/**
 * Converts a date from client's timezone to UTC
 * @param localDate - Date in client's timezone
 * @param timezone - IANA timezone (e.g., "America/Lima")
 * @returns Date in UTC
 */
export function clientTimezoneToUtc(localDate: Date, timezone: string = 'America/Lima'): Date {
  return fromZonedTime(localDate, timezone);
}

/**
 * Formats a date in the client's timezone
 * @param date - Date to format
 * @param formatStr - Format string (e.g., "yyyy-MM-dd HH:mm:ss")
 * @param timezone - IANA timezone
 * @returns Formatted date string
 */
export function formatInTimezone(date: Date, formatStr: string, timezone: string = 'America/Lima'): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Combines a date string and time string in the client's timezone and converts to UTC
 * Used when creating reservations from the form
 * @param dateStr - Date string (YYYY-MM-DD)
 * @param timeStr - Time string (HH:mm)
 * @param timezone - IANA timezone
 * @returns UTC Date object
 */
export function combineDateTimeToUtc(dateStr: string, timeStr: string, timezone: string = 'America/Lima'): Date {
  // Parse the date and time in the local timezone
  const localDateTimeStr = `${dateStr} ${timeStr}`;
  const localDate = parse(localDateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
  
  // Convert to UTC
  return fromZonedTime(localDate, timezone);
}

/**
 * Extracts date and time components from a UTC date in the client's timezone
 * Used when displaying reservations
 * @param utcDate - UTC Date object
 * @param timezone - IANA timezone
 * @returns Object with date and time strings
 */
export function extractDateTimeFromUtc(utcDate: Date, timezone: string = 'America/Lima'): { date: string; time: string } {
  const localDate = toZonedTime(utcDate, timezone);
  
  return {
    date: format(localDate, 'yyyy-MM-dd'),
    time: format(localDate, 'HH:mm')
  };
}

/**
 * Gets the current date in the client's timezone (without time component)
 * @param timezone - IANA timezone
 * @returns Date string (YYYY-MM-DD)
 */
export function getCurrentDateInTimezone(timezone: string = 'America/Lima'): string {
  const now = new Date();
  const localDate = toZonedTime(now, timezone);
  return format(localDate, 'yyyy-MM-dd');
}
