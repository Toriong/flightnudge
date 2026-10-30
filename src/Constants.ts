/**
 * FlightNudge Constants
 * Configuration values and settings for the add-on
 */

export const ADDON_NAME = 'FlightNudge';

export const DRIVE_IO_REFERRER_LINK = 'https://www.driveio.io/?referrer=FlightNudge';
export const DRIVE_IO_COPY_FOLDER_LINK = 'https://www.driveio.io/standalone-plans/copy-folder-in-google-drive-extension?referrer=FlightNudge';

// Default reminder times in minutes before departure
export const DEFAULT_FLIGHT_REMINDERS = [
  24 * 60,    // 24 hours
  3 * 60,     // 3 hours
  90          // 90 minutes
];

export const DEFAULT_HOTEL_REMINDERS = [
  24 * 60,    // 24 hours
  2 * 60      // 2 hours
];

export const DEFAULT_RESTAURANT_REMINDERS = [
  24 * 60,    // 24 hours
  1 * 60      // 1 hour
];

// Maximum reminder time allowed by Calendar API (in minutes)
export const MAX_REMINDER_MINUTES = 40320; // 4 weeks

// Trigger interval in hours
export const TRIGGER_INTERVAL_HOURS = 1;

// Properties keys for user settings
export const SETTINGS_KEY_PREFIX = 'flightnudge_';
export const SETTINGS_FLIGHT_REMINDERS = `${SETTINGS_KEY_PREFIX}flight_reminders`;
export const SETTINGS_HOTEL_REMINDERS = `${SETTINGS_KEY_PREFIX}hotel_reminders`;
export const SETTINGS_RESTAURANT_REMINDERS = `${SETTINGS_KEY_PREFIX}restaurant_reminders`;
export const SETTINGS_AIRPORT_TRAVEL_TIME = `${SETTINGS_KEY_PREFIX}airport_travel_time`;
export const SETTINGS_LAST_RUN = `${SETTINGS_KEY_PREFIX}last_run`;
export const SETTINGS_PROCESSED_EVENTS = `${SETTINGS_KEY_PREFIX}processed_events`;

// Flight detection keywords (case-insensitive)
export const FLIGHT_KEYWORDS = [
  'flight',
  'flights',
  'airline',
  'airways',
  'aviation',
  'departure',
  'boarding',
  'gate',
  'terminal',
  'confirmation number',
  'booking reference',
  'eticket',
  'e-ticket',
  'aircraft',
  'airplane',
  'plane'
];

// Airline codes and names for detection
export const AIRLINE_INDICATORS = [
  // Major US carriers
  'AA', 'American Airlines',
  'DL', 'Delta',
  'UA', 'United',
  'WN', 'Southwest',
  'B6', 'JetBlue',
  'AS', 'Alaska Airlines',
  'NK', 'Spirit',
  'F9', 'Frontier',
  
  // Major international carriers
  'BA', 'British Airways',
  'LH', 'Lufthansa',
  'AF', 'Air France',
  'KL', 'KLM',
  'QF', 'Qantas',
  'EK', 'Emirates',
  'SQ', 'Singapore Airlines',
  'CX', 'Cathay Pacific',
  'JL', 'Japan Airlines',
  'NH', 'ANA'
];

// Hotel detection keywords
export const HOTEL_KEYWORDS = [
  'hotel',
  'resort',
  'check-in',
  'check in',
  'reservation',
  'booking',
  'accommodation',
  'lodge',
  'inn'
];

// Restaurant detection keywords
export const RESTAURANT_KEYWORDS = [
  'restaurant',
  'reservation',
  'table',
  'dining',
  'dinner',
  'lunch',
  'breakfast',
  'cuisine'
];

// Branding colors
export const BRAND_COLORS = {
  blue: 'rgba(157,214,252,1)',
  purple: 'rgb(202,160,250)',
  gradientStart: 'rgba(209,127,247,1)',
  gradientEnd: 'rgba(157,214,252,1)'
};
