/**
 * Flight Detection Logic for FlightNudge
 * Analyzes fromGmail events to determine if they are flights
 */

import {
  FLIGHT_KEYWORDS,
  AIRLINE_INDICATORS,
  HOTEL_KEYWORDS,
  RESTAURANT_KEYWORDS
} from './Constants';

export enum EventType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  RESTAURANT = 'restaurant',
  UNKNOWN = 'unknown'
}

export interface EventClassification {
  type: EventType;
  confidence: number; // 0-1
  reasons: string[];
}

export class FlightDetector {
  /**
   * Classify a fromGmail event
   */
  static classifyEvent(event: GoogleAppsScript.Calendar.Schema.Event): EventClassification {
    const title = (event.summary || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const location = (event.location || '').toLowerCase();
    
    const combined = `${title} ${description} ${location}`;

    // Check for flight indicators
    const flightScore = this.calculateFlightScore(combined, title, location);
    
    // Check for hotel indicators (lower priority)
    const hotelScore = this.calculateHotelScore(combined, title);
    
    // Check for restaurant indicators (lower priority)
    const restaurantScore = this.calculateRestaurantScore(combined, title);

    // Determine the most likely type
    const scores = [
      { type: EventType.FLIGHT, score: flightScore },
      { type: EventType.HOTEL, score: hotelScore },
      { type: EventType.RESTAURANT, score: restaurantScore }
    ];

    scores.sort((a, b) => b.score - a.score);
    const topScore = scores[0];

    if (topScore.score > 0.5) {
      return {
        type: topScore.type,
        confidence: topScore.score,
        reasons: this.getReasons(topScore.type, combined, title, location)
      };
    }

    return {
      type: EventType.UNKNOWN,
      confidence: 0,
      reasons: ['No strong indicators found']
    };
  }

  /**
   * Calculate flight detection score
   */
  private static calculateFlightScore(combined: string, title: string, location: string): number {
    let score = 0;

    // Check for flight keywords
    const flightKeywordMatches = FLIGHT_KEYWORDS.filter(kw => combined.includes(kw.toLowerCase()));
    if (flightKeywordMatches.length > 0) {
      score += 0.3 * Math.min(flightKeywordMatches.length / 3, 1);
    }

    // Check for airline indicators
    const airlineMatches = AIRLINE_INDICATORS.filter(indicator => 
      combined.includes(indicator.toLowerCase())
    );
    if (airlineMatches.length > 0) {
      score += 0.4;
    }

    // Check for flight number pattern (e.g., AA123, UA 456, Flight 789)
    const flightNumberPattern = /\b([A-Z]{2}\s?\d{1,4}|flight\s+\d{1,4})\b/i;
    if (flightNumberPattern.test(combined)) {
      score += 0.3;
    }

    // Check for airport codes (3 letter codes in uppercase)
    const airportCodePattern = /\b[A-Z]{3}\b/g;
    const airportMatches = (title + ' ' + location).match(airportCodePattern);
    if (airportMatches && airportMatches.length >= 2) {
      score += 0.4;
    }

    // Check for time indicators typical of flights
    let flightSpecificCount = 0;
    if (combined.includes('departure')) flightSpecificCount++;
    if (combined.includes('arrival')) flightSpecificCount++;
    if (combined.includes('boarding')) flightSpecificCount++;
    if (combined.includes('gate')) flightSpecificCount++;
    if (combined.includes('terminal')) flightSpecificCount++;
    
    if (flightSpecificCount > 0) {
      score += 0.2 * Math.min(flightSpecificCount / 2, 1);
    }
    
    // Boarding + gate + terminal is very strong signal
    if (combined.includes('boarding') && combined.includes('gate') && combined.includes('terminal')) {
      score += 0.3;
    }

    // Penalty for hotel/restaurant keywords
    if (HOTEL_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()))) {
      score -= 0.3;
    }
    if (RESTAURANT_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()))) {
      score -= 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate hotel detection score
   */
  private static calculateHotelScore(combined: string, _title: string): number {
    let score = 0;

    const hotelKeywordMatches = HOTEL_KEYWORDS.filter(kw => combined.includes(kw.toLowerCase()));
    if (hotelKeywordMatches.length > 0) {
      score += 0.4 * Math.min(hotelKeywordMatches.length / 2, 1);
    }

    // Check-in is a strong signal for hotels
    if (combined.includes('check-in') || combined.includes('check in')) {
      score += 0.4;
    }

    // Booking/reservation with hotel is strong
    if ((combined.includes('hotel') || combined.includes('resort')) && 
        (combined.includes('booking') || combined.includes('reservation'))) {
      score += 0.3;
    }

    // Penalty for flight keywords
    if (FLIGHT_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()))) {
      score -= 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate restaurant detection score
   */
  private static calculateRestaurantScore(combined: string, _title: string): number {
    let score = 0;

    const restaurantKeywordMatches = RESTAURANT_KEYWORDS.filter(kw => 
      combined.includes(kw.toLowerCase())
    );
    if (restaurantKeywordMatches.length > 0) {
      score += 0.4 * Math.min(restaurantKeywordMatches.length / 2, 1);
    }

    // Restaurant + reservation/table/dining is strong
    if (combined.includes('restaurant') && 
        (combined.includes('reservation') || combined.includes('table') || combined.includes('dining'))) {
      score += 0.4;
    }

    // Dinner/lunch reservation is a good signal
    if ((combined.includes('dinner') || combined.includes('lunch') || combined.includes('breakfast')) &&
        combined.includes('reservation')) {
      score += 0.3;
    }

    // Penalty for flight/hotel keywords
    if (FLIGHT_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()))) {
      score -= 0.4;
    }
    if (HOTEL_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()))) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get human-readable reasons for classification
   */
  private static getReasons(
    type: EventType,
    combined: string,
    title: string,
    location: string
  ): string[] {
    const reasons: string[] = [];

    if (type === EventType.FLIGHT) {
      const flightKeywordMatches = FLIGHT_KEYWORDS.filter(kw => combined.includes(kw.toLowerCase()));
      if (flightKeywordMatches.length > 0) {
        reasons.push(`Contains flight keywords: ${flightKeywordMatches.slice(0, 3).join(', ')}`);
      }

      const airlineMatches = AIRLINE_INDICATORS.filter(indicator => 
        combined.includes(indicator.toLowerCase())
      );
      if (airlineMatches.length > 0) {
        reasons.push(`Contains airline: ${airlineMatches[0]}`);
      }

      if (/\b([A-Z]{2}\s?\d{1,4}|flight\s+\d{1,4})\b/i.test(combined)) {
        reasons.push('Contains flight number pattern');
      }

      const airportCodePattern = /\b[A-Z]{3}\b/g;
      const airportMatches = (title + ' ' + location).match(airportCodePattern);
      if (airportMatches && airportMatches.length >= 2) {
        reasons.push(`Contains airport codes: ${airportMatches.join(', ')}`);
      }
    }

    return reasons.length > 0 ? reasons : ['Pattern match'];
  }

  /**
   * Quick check if event is likely a flight (for filtering)
   */
  static isFlight(event: GoogleAppsScript.Calendar.Schema.Event): boolean {
    const classification = this.classifyEvent(event);
    return classification.type === EventType.FLIGHT && classification.confidence > 0.5;
  }

  /**
   * Quick check if event is likely a hotel
   */
  static isHotel(event: GoogleAppsScript.Calendar.Schema.Event): boolean {
    const classification = this.classifyEvent(event);
    return classification.type === EventType.HOTEL && classification.confidence > 0.5;
  }

  /**
   * Quick check if event is likely a restaurant
   */
  static isRestaurant(event: GoogleAppsScript.Calendar.Schema.Event): boolean {
    const classification = this.classifyEvent(event);
    return classification.type === EventType.RESTAURANT && classification.confidence > 0.5;
  }
}
