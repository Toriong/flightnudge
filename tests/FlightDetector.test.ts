/**
 * Unit tests for FlightDetector
 */

import { FlightDetector, EventType } from '../src/FlightDetector';

describe('FlightDetector', () => {
  describe('Flight Detection', () => {
    it('should detect United Airlines flight with flight number', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Flight to San Francisco - UA 1234',
        description: 'United Airlines Flight UA1234\nDeparture: SFO Gate 42',
        location: 'SFO - San Francisco International Airport'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect American Airlines flight', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'AA 456 to New York',
        description: 'American Airlines\nFlight AA456\nBoarding: 2:30 PM',
        location: 'JFK Airport'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Delta flight with airport codes', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'LAX → ATL',
        description: 'Delta Flight 789\nDeparture from Los Angeles\nArrival in Atlanta',
        location: 'LAX'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect flight with boarding and gate information', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Flight to Chicago',
        description: 'Boarding at Gate 24\nTerminal 3\nDeparture: 10:15 AM\nFlight details',
        location: 'ORD'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Southwest flight', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Southwest Flight 1122',
        description: 'Flight from Denver to Phoenix\nConfirmation: ABC123',
        location: 'DEN'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect international flight', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'British Airways BA 215',
        description: 'Flight to London Heathrow\nE-ticket: 1234567890',
        location: 'LHR'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Lufthansa flight', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'LH 456 Frankfurt',
        description: 'Lufthansa Flight\nDeparture: Terminal 1',
        location: 'FRA'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Hotel Detection', () => {
    it('should detect hotel check-in', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Marriott Hotel Check-in',
        description: 'Hotel reservation confirmation\nCheck-in: 3:00 PM',
        location: 'San Francisco, CA'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.HOTEL);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect hotel booking', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Hotel Reservation',
        description: 'Hilton Hotel\nBooking confirmation: XYZ789',
        location: 'New York'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.HOTEL);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect resort accommodation', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Beach Resort Check-in',
        description: 'Resort accommodation\nCheck in at front desk',
        location: 'Miami Beach'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.HOTEL);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Restaurant Detection', () => {
    it('should detect restaurant reservation', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Dinner at The French Laundry',
        description: 'Restaurant reservation for 2\nTable booking confirmed',
        location: 'Yountville, CA'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.RESTAURANT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect dining reservation', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Lunch Reservation',
        description: 'Dining reservation at upscale restaurant\nParty of 4',
        location: 'Downtown'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.RESTAURANT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Ambiguous Cases', () => {
    it('should not confuse hotel with flight when flight keywords present', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Hotel near airport - check-in',
        description: 'Hotel reservation. Note: flight is tomorrow',
        location: 'Airport Hotel'
      };

      const result = FlightDetector.classifyEvent(event);
      // Should still classify as hotel despite "flight" mention
      expect(result.type).toBe(EventType.HOTEL);
    });

    it('should handle unknown events gracefully', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Package Delivery',
        description: 'Amazon package arriving',
        location: 'Home'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.UNKNOWN);
    });

    it('should prioritize flight over hotel when strong flight indicators', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'UA 1234 Flight - Hotel booked',
        description: 'United Airlines flight UA1234\nBoarding Gate 42\nNote: hotel reservation also made',
        location: 'SFO'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty event fields', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: '',
        description: '',
        location: ''
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.UNKNOWN);
    });

    it('should handle undefined event fields', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {};

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.UNKNOWN);
    });

    it('should detect flight with minimal information', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'United Airlines UA 999',
        description: '',
        location: ''
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
    });
  });

  describe('Real-world Gmail Flight Examples', () => {
    it('should detect typical Gmail flight event format', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Flight from San Francisco (SFO) to New York (JFK)',
        description: `United Airlines
Flight UA 1234
Confirmation number: ABC123
Departure: San Francisco International Airport (SFO)
Arrival: John F. Kennedy International Airport (JFK)
Aircraft: Boeing 737`,
        location: 'San Francisco International Airport (SFO)'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect Gmail format with e-ticket', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Flight: LAX to ORD',
        description: `American Airlines Flight AA 456
E-ticket number: 0012345678901
Departure: Los Angeles (LAX) Terminal 4
Arrival: Chicago O'Hare (ORD) Terminal 3
Seat: 12A`,
        location: 'LAX'
      };

      const result = FlightDetector.classifyEvent(event);
      expect(result.type).toBe(EventType.FLIGHT);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Helper Methods', () => {
    it('isFlight should return true for flight events', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'UA 1234 to NYC',
        description: 'United Airlines flight',
        location: 'JFK'
      };

      expect(FlightDetector.isFlight(event)).toBe(true);
    });

    it('isHotel should return true for hotel events', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Hotel Check-in',
        description: 'Marriott reservation',
        location: 'San Francisco'
      };

      expect(FlightDetector.isHotel(event)).toBe(true);
    });

    it('isRestaurant should return true for restaurant events', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Dinner Reservation',
        description: 'Restaurant table booking',
        location: 'Downtown'
      };

      expect(FlightDetector.isRestaurant(event)).toBe(true);
    });

    it('helper methods should return false for unknown events', () => {
      const event: GoogleAppsScript.Calendar.Schema.Event = {
        summary: 'Package Delivery',
        description: 'Amazon delivery',
        location: 'Home'
      };

      expect(FlightDetector.isFlight(event)).toBe(false);
      expect(FlightDetector.isHotel(event)).toBe(false);
      expect(FlightDetector.isRestaurant(event)).toBe(false);
    });
  });
});
