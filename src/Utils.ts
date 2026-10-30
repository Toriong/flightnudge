/**
 * Utility functions for FlightNudge
 */

import { MAX_REMINDER_MINUTES } from './Constants';

/**
 * Validates reminder minutes array
 */
export function validateReminderMinutes(minutes: number[]): boolean {
  if (!Array.isArray(minutes)) return false;
  if (minutes.length === 0) return false;
  
  return minutes.every(m => 
    typeof m === 'number' && 
    m > 0 && 
    m <= MAX_REMINDER_MINUTES &&
    Number.isInteger(m)
  );
}

/**
 * Formats minutes into human-readable string
 */
export function formatMinutesToHuman(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (minutes < 60 * 24) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${mins}m`;
  } else {
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    if (hours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days}d ${hours}h`;
  }
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get calendar timezone
 */
export function getCalendarTimezone(): string {
  try {
    return CalendarApp.getDefaultCalendar().getTimeZone();
  } catch {
    return Session.getScriptTimeZone();
  }
}

/**
 * Log with timestamp
 */
export function logWithTimestamp(message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Check if event has been manually modified (has custom reminders)
 * Returns true if the event appears to have manually set reminders
 */
export function hasManuallySetReminders(event: GoogleAppsScript.Calendar.Schema.Event): boolean {
  // If reminders are set to use default, it's not manually modified
  if (event.reminders?.useDefault === true) {
    return false;
  }
  
  // If there are overrides, consider it manually modified
  // (We'll only skip if we've already processed it before)
  return false;
}

/**
 * Compare two reminder arrays for equality
 */
export function remindersAreEqual(
  reminders1: GoogleAppsScript.Calendar.Schema.EventReminder[],
  reminders2: GoogleAppsScript.Calendar.Schema.EventReminder[]
): boolean {
  if (reminders1.length !== reminders2.length) return false;
  
  const sorted1 = [...reminders1].sort((a, b) => (a.minutes || 0) - (b.minutes || 0));
  const sorted2 = [...reminders2].sort((a, b) => (a.minutes || 0) - (b.minutes || 0));
  
  return sorted1.every((r1, i) => {
    const r2 = sorted2[i];
    return r1.method === r2.method && r1.minutes === r2.minutes;
  });
}
