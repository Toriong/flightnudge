/**
 * Reminder Manager for FlightNudge
 * Handles updating reminders on calendar events
 */

import { FlightDetector, EventType } from './FlightDetector';
import { SettingsManager } from './SettingsManager';
import { logWithTimestamp, remindersAreEqual } from './Utils';

export interface ProcessingResult {
  totalProcessed: number;
  flightsUpdated: number;
  hotelsUpdated: number;
  restaurantsUpdated: number;
  skipped: number;
  errors: number;
}

export class ReminderManager {
  private settingsManager: SettingsManager;

  constructor() {
    this.settingsManager = new SettingsManager();
  }

  /**
   * Process all fromGmail events in the calendar
   */
  processFromGmailEvents(daysAhead: number = 90): ProcessingResult {
    const result: ProcessingResult = {
      totalProcessed: 0,
      flightsUpdated: 0,
      hotelsUpdated: 0,
      restaurantsUpdated: 0,
      skipped: 0,
      errors: 0
    };

    try {
      const calendar = CalendarApp.getDefaultCalendar();
      const calendarId = calendar.getId();
      
      const now = new Date();
      const endDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      logWithTimestamp(`Fetching fromGmail events from ${now.toISOString()} to ${endDate.toISOString()}`);

      // Use Calendar Advanced Service to filter by eventType
      const events = Calendar.Events?.list(calendarId, {
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        eventTypes: ['fromGmail'],
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500
      });

      if (!events || !events.items || events.items.length === 0) {
        logWithTimestamp('No fromGmail events found');
        return result;
      }

      logWithTimestamp(`Found ${events.items.length} fromGmail events`);

      for (const event of events.items) {
        result.totalProcessed++;
        
        try {
          if (!event.id) {
            result.skipped++;
            continue;
          }

          // Skip if already processed
          if (this.settingsManager.hasProcessedEvent(event.id)) {
            result.skipped++;
            continue;
          }

          // Classify the event
          const classification = FlightDetector.classifyEvent(event);
          
          if (classification.type === EventType.UNKNOWN || classification.confidence < 0.5) {
            result.skipped++;
            continue;
          }

          // Get appropriate reminders for event type
          let targetReminders: number[];
          switch (classification.type) {
            case EventType.FLIGHT:
              targetReminders = this.settingsManager.getFlightReminders();
              break;
            case EventType.HOTEL:
              targetReminders = this.settingsManager.getHotelReminders();
              break;
            case EventType.RESTAURANT:
              targetReminders = this.settingsManager.getRestaurantReminders();
              break;
            default:
              result.skipped++;
              continue;
          }

          // Add airport travel reminder for flights if configured
          if (classification.type === EventType.FLIGHT) {
            const travelTime = this.settingsManager.getAirportTravelTime();
            if (travelTime > 0 && event.start?.dateTime) {
              targetReminders = [...targetReminders, travelTime];
            }
          }

          // Update reminders
          const updated = this.updateEventReminders(calendarId, event, targetReminders);
          
          if (updated) {
            // Mark as processed
            this.settingsManager.markEventProcessed(event.id);
            
            switch (classification.type) {
              case EventType.FLIGHT:
                result.flightsUpdated++;
                break;
              case EventType.HOTEL:
                result.hotelsUpdated++;
                break;
              case EventType.RESTAURANT:
                result.restaurantsUpdated++;
                break;
            }
            
            logWithTimestamp(
              `Updated ${classification.type} event: ${event.summary}`,
              { confidence: classification.confidence, reminders: targetReminders }
            );
          } else {
            result.skipped++;
          }
        } catch (error) {
          result.errors++;
          logWithTimestamp(`Error processing event ${event.id}:`, error);
        }
      }

      this.settingsManager.updateLastRun();
      logWithTimestamp('Processing complete', result);

    } catch (error) {
      logWithTimestamp('Error in processFromGmailEvents:', error);
      result.errors++;
    }

    return result;
  }

  /**
   * Update reminders for a single event
   */
  private updateEventReminders(
    calendarId: string,
    event: GoogleAppsScript.Calendar.Schema.Event,
    reminderMinutes: number[]
  ): boolean {
    try {
      if (!event.id) return false;

      // Check if event already has these reminders
      const currentReminders = event.reminders?.overrides || [];
      const targetReminders = reminderMinutes.map(minutes => ({
        method: 'popup' as const,
        minutes
      }));

      if (remindersAreEqual(currentReminders, targetReminders)) {
        return false; // Already has correct reminders
      }

      // Update the event
      const updatedEvent: GoogleAppsScript.Calendar.Schema.Event = {
        reminders: {
          useDefault: false,
          overrides: targetReminders
        }
      };

      Calendar.Events?.patch(updatedEvent, calendarId, event.id);
      return true;
    } catch (error) {
      logWithTimestamp(`Error updating reminders for event ${event.id}:`, error);
      return false;
    }
  }

  /**
   * Process a single event by ID (for manual runs)
   */
  processSingleEvent(eventId: string): boolean {
    try {
      const calendar = CalendarApp.getDefaultCalendar();
      const calendarId = calendar.getId();
      
      const event = Calendar.Events?.get(calendarId, eventId);
      if (!event) return false;

      const classification = FlightDetector.classifyEvent(event);
      
      if (classification.type === EventType.UNKNOWN || classification.confidence < 0.5) {
        logWithTimestamp('Event not classified as flight/hotel/restaurant', { eventId, classification });
        return false;
      }

      let targetReminders: number[];
      switch (classification.type) {
        case EventType.FLIGHT:
          targetReminders = this.settingsManager.getFlightReminders();
          break;
        case EventType.HOTEL:
          targetReminders = this.settingsManager.getHotelReminders();
          break;
        case EventType.RESTAURANT:
          targetReminders = this.settingsManager.getRestaurantReminders();
          break;
        default:
          return false;
      }

      const updated = this.updateEventReminders(calendarId, event, targetReminders);
      if (updated && event.id) {
        this.settingsManager.markEventProcessed(event.id);
      }
      
      return updated;
    } catch (error) {
      logWithTimestamp(`Error processing single event ${eventId}:`, error);
      return false;
    }
  }
}
