/**
 * Settings Manager for FlightNudge
 * Handles user preferences storage using PropertiesService
 */

import {
  DEFAULT_FLIGHT_REMINDERS,
  DEFAULT_HOTEL_REMINDERS,
  DEFAULT_RESTAURANT_REMINDERS,
  SETTINGS_FLIGHT_REMINDERS,
  SETTINGS_HOTEL_REMINDERS,
  SETTINGS_RESTAURANT_REMINDERS,
  SETTINGS_AIRPORT_TRAVEL_TIME,
  SETTINGS_LAST_RUN,
  SETTINGS_PROCESSED_EVENTS
} from './Constants';
import { validateReminderMinutes, safeJsonParse } from './Utils';

export interface FlightNudgeSettings {
  flightReminders: number[];
  hotelReminders: number[];
  restaurantReminders: number[];
  airportTravelTime: number;
}

export class SettingsManager {
  private properties: GoogleAppsScript.Properties.Properties;

  constructor() {
    this.properties = PropertiesService.getUserProperties();
  }

  /**
   * Get flight reminder settings (in minutes)
   */
  getFlightReminders(): number[] {
    const stored = this.properties.getProperty(SETTINGS_FLIGHT_REMINDERS);
    const parsed = safeJsonParse<number[]>(stored, DEFAULT_FLIGHT_REMINDERS);
    return validateReminderMinutes(parsed) ? parsed : DEFAULT_FLIGHT_REMINDERS;
  }

  /**
   * Set flight reminder settings
   */
  setFlightReminders(minutes: number[]): boolean {
    if (!validateReminderMinutes(minutes)) return false;
    this.properties.setProperty(SETTINGS_FLIGHT_REMINDERS, JSON.stringify(minutes));
    return true;
  }

  /**
   * Get hotel reminder settings
   */
  getHotelReminders(): number[] {
    const stored = this.properties.getProperty(SETTINGS_HOTEL_REMINDERS);
    const parsed = safeJsonParse<number[]>(stored, DEFAULT_HOTEL_REMINDERS);
    return validateReminderMinutes(parsed) ? parsed : DEFAULT_HOTEL_REMINDERS;
  }

  /**
   * Set hotel reminder settings
   */
  setHotelReminders(minutes: number[]): boolean {
    if (!validateReminderMinutes(minutes)) return false;
    this.properties.setProperty(SETTINGS_HOTEL_REMINDERS, JSON.stringify(minutes));
    return true;
  }

  /**
   * Get restaurant reminder settings
   */
  getRestaurantReminders(): number[] {
    const stored = this.properties.getProperty(SETTINGS_RESTAURANT_REMINDERS);
    const parsed = safeJsonParse<number[]>(stored, DEFAULT_RESTAURANT_REMINDERS);
    return validateReminderMinutes(parsed) ? parsed : DEFAULT_RESTAURANT_REMINDERS;
  }

  /**
   * Set restaurant reminder settings
   */
  setRestaurantReminders(minutes: number[]): boolean {
    if (!validateReminderMinutes(minutes)) return false;
    this.properties.setProperty(SETTINGS_RESTAURANT_REMINDERS, JSON.stringify(minutes));
    return true;
  }

  /**
   * Get airport travel time setting (in minutes)
   */
  getAirportTravelTime(): number {
    const stored = this.properties.getProperty(SETTINGS_AIRPORT_TRAVEL_TIME);
    const parsed = stored ? parseInt(stored, 10) : 0;
    return parsed > 0 ? parsed : 0;
  }

  /**
   * Set airport travel time (0 to disable)
   */
  setAirportTravelTime(minutes: number): boolean {
    if (minutes < 0 || !Number.isInteger(minutes)) return false;
    this.properties.setProperty(SETTINGS_AIRPORT_TRAVEL_TIME, minutes.toString());
    return true;
  }

  /**
   * Get all settings
   */
  getAllSettings(): FlightNudgeSettings {
    return {
      flightReminders: this.getFlightReminders(),
      hotelReminders: this.getHotelReminders(),
      restaurantReminders: this.getRestaurantReminders(),
      airportTravelTime: this.getAirportTravelTime()
    };
  }

  /**
   * Get last run timestamp
   */
  getLastRun(): Date | null {
    const stored = this.properties.getProperty(SETTINGS_LAST_RUN);
    if (!stored) return null;
    const timestamp = parseInt(stored, 10);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  /**
   * Update last run timestamp
   */
  updateLastRun(): void {
    this.properties.setProperty(SETTINGS_LAST_RUN, Date.now().toString());
  }

  /**
   * Check if event has been processed
   */
  hasProcessedEvent(eventId: string): boolean {
    const stored = this.properties.getProperty(SETTINGS_PROCESSED_EVENTS);
    const processed = safeJsonParse<Record<string, number>>(stored, {});
    return eventId in processed;
  }

  /**
   * Mark event as processed
   */
  markEventProcessed(eventId: string): void {
    const stored = this.properties.getProperty(SETTINGS_PROCESSED_EVENTS);
    const processed = safeJsonParse<Record<string, number>>(stored, {});
    processed[eventId] = Date.now();
    
    // Keep only last 1000 events to avoid hitting property size limits
    const entries = Object.entries(processed);
    if (entries.length > 1000) {
      entries.sort(([, a], [, b]) => b - a);
      const kept = Object.fromEntries(entries.slice(0, 1000));
      this.properties.setProperty(SETTINGS_PROCESSED_EVENTS, JSON.stringify(kept));
    } else {
      this.properties.setProperty(SETTINGS_PROCESSED_EVENTS, JSON.stringify(processed));
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults(): void {
    this.properties.deleteProperty(SETTINGS_FLIGHT_REMINDERS);
    this.properties.deleteProperty(SETTINGS_HOTEL_REMINDERS);
    this.properties.deleteProperty(SETTINGS_RESTAURANT_REMINDERS);
    this.properties.deleteProperty(SETTINGS_AIRPORT_TRAVEL_TIME);
  }
}
