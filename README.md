# FlightNudge

**Flight-sized Google Calendar reminders for the flights Gmail adds**

FlightNudge is a free Google Calendar Workspace add-on that automatically updates reminders for flight events that Gmail adds to your calendar. Instead of the default calendar reminders, your flights get flight-appropriate reminders (24 hours, 3 hours, and 90 minutes before departure by default).

A free tool by [Drive I/O](https://www.driveio.io/?referrer=FlightNudge).

## Features

- 🛫 **Automatic Flight Detection** - Intelligently identifies flight events from Gmail using robust pattern matching
- ⏰ **Smart Reminders** - Replaces default reminders with flight-appropriate ones (24h, 3h, 90min before departure)
- ⚙️ **Fully Configurable** - Customize reminder times for flights, hotels, and restaurants
- 🏨 **Hotel Support** - Optional reminder presets for hotel check-ins
- 🍽️ **Restaurant Support** - Optional reminder presets for restaurant reservations
- 🚗 **Airport Travel Time** - Add a "leave for airport" reminder with custom travel time
- 🔄 **Hourly Sync** - Runs automatically every hour via time-driven trigger
- ▶️ **Manual Run** - Process events on-demand with the "Run Now" button
- 🔒 **Privacy First** - Only uses non-restricted OAuth scopes, no access to Gmail or Drive

## How It Works

1. Gmail automatically adds flight confirmations to your Google Calendar (as `fromGmail` event types)
2. FlightNudge runs every hour (or when you click "Run Now")
3. It finds these flight events and analyzes them using smart pattern matching
4. If an event is detected as a flight (or hotel/restaurant), it replaces the reminders
5. Events you've already manually edited are skipped
6. You get flight-appropriate notifications automatically!

## Flight Detection

FlightNudge uses sophisticated pattern matching to identify flights from other Gmail-added events:

- Airline names and codes (UA, AA, DL, BA, LH, etc.)
- Flight numbers (e.g., "UA 1234", "Flight 789")
- Airport codes (SFO, JFK, LAX, etc.)
- Flight-specific keywords (boarding, gate, terminal, departure, e-ticket)
- Smart confidence scoring to avoid false positives

The detector is thoroughly tested with real-world Gmail flight event formats.

## Installation & Deployment

### Prerequisites

- Node.js (v16 or later)
- Google account with Calendar enabled
- [@google/clasp](https://github.com/google/clasp) CLI tool

### Setup Steps

1. **Clone and Install**

```bash
git clone https://github.com/YOUR_ORG/flightnudge.git
cd flightnudge
npm install
```

2. **Build TypeScript**

```bash
npm run build
```

3. **Set up Google Apps Script Project**

```bash
# Login to clasp (first time only)
npx clasp login

# Create new Apps Script project
npx clasp create --type standalone --title "FlightNudge"

# This creates .clasp.json with your script ID
```

4. **Deploy to Google Apps Script**

```bash
# Push code to Apps Script
npm run push

# Or use clasp directly
npx clasp push
```

5. **Enable Advanced Services**

In the Apps Script editor (open with `npx clasp open`):
- Click on the gear icon (Project Settings)
- Scroll to "Google Services"
- Enable "Google Calendar API v3"

6. **Set Up OAuth Consent**

- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Select your Apps Script project
- Go to "APIs & Services" → "OAuth consent screen"
- Configure the consent screen with your app details
- Add the required scopes (listed below)

7. **Install as Add-on (Testing)**

- In Apps Script editor: Deploy → Test deployments
- Click "Install" to add to your Google Calendar
- Grant the requested permissions

### Required OAuth Scopes

FlightNudge uses **only non-restricted scopes** (no CASA review required):

```
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.addons.execute
https://www.googleapis.com/auth/script.scriptapp
https://www.googleapis.com/auth/script.locale
```

These scopes allow:
- Reading and modifying calendar events
- Running as a Calendar add-on
- Managing time-driven triggers
- Getting user locale for timezone handling

**Note**: FlightNudge does NOT require access to:
- Gmail (no email reading)
- Google Drive (no file access)
- Restricted scopes (no CASA review needed)

## Usage

### First Run

1. Open Google Calendar
2. Look for the FlightNudge icon in the right sidebar (or Add-ons menu)
3. Click "Run Now" to process existing flight events
4. The hourly trigger is set up automatically on first use

### Configuring Reminders

1. Open FlightNudge from Calendar
2. Click "Settings"
3. Enter reminder times in minutes (comma-separated)
   - Default flights: `1440,180,90` (24h, 3h, 90min)
   - Default hotels: `1440,120` (24h, 2h)
   - Default restaurants: `1440,60` (24h, 1h)
4. Optionally set airport travel time (e.g., `120` for 2 hours)
5. Click "Save"

### Reminder Time Examples

- `30` = 30 minutes before
- `60` = 1 hour before
- `180` = 3 hours before
- `1440` = 24 hours before (1 day)
- `2880` = 48 hours before (2 days)
- Maximum: `40320` minutes (4 weeks)

## Development

### Project Structure

```
flightnudge/
├── src/
│   ├── Code.ts              # Main entry point, UI, triggers
│   ├── Constants.ts         # Configuration constants
│   ├── FlightDetector.ts    # Flight detection logic
│   ├── ReminderManager.ts   # Reminder update logic
│   ├── SettingsManager.ts   # User settings storage
│   └── Utils.ts             # Utility functions
├── tests/
│   ├── FlightDetector.test.ts  # Flight detection tests
│   └── Utils.test.ts           # Utility function tests
├── branding/
│   ├── logo.svg             # Vector logo
│   ├── icon-128.png         # 128x128 icon
│   ├── icon-512.png         # 512x512 icon
│   └── README.md            # Branding guide
├── dist/                    # Compiled JavaScript (generated)
├── .clasp.json.template     # Clasp config template
├── appsscript.json         # Apps Script manifest
├── package.json            # Node dependencies & scripts
├── tsconfig.json           # TypeScript config
└── jest.config.js          # Jest test config
```

### Available Scripts

```bash
npm run build        # Compile TypeScript to dist/
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint TypeScript files
npm run push         # Build and push to Apps Script
npm run deploy       # Build, push, and deploy
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test FlightDetector.test.ts

# Watch mode for development
npm run test:watch
```

### Testing Flight Detection

The `FlightDetector` includes comprehensive tests with real-world Gmail event formats:

```typescript
import { FlightDetector, EventType } from './src/FlightDetector';

const event = {
  summary: 'Flight to San Francisco - UA 1234',
  description: 'United Airlines Flight UA1234\nDeparture: SFO Gate 42',
  location: 'SFO'
};

const result = FlightDetector.classifyEvent(event);
// result.type === EventType.FLIGHT
// result.confidence > 0.5
```

## Publishing to Google Workspace Marketplace

### Prerequisites for Publishing

1. **Complete OAuth Consent Screen**
   - App name, description, logo
   - Support email
   - Developer contact information

2. **Prepare Marketplace Assets**
   - App icon (128x128 PNG) - available in `branding/`
   - Marketplace icon (512x512 PNG) - available in `branding/`
   - Screenshots (1280x800 recommended)
   - Promotional images (optional)

3. **Create Marketplace Listing**
   - Visit [Google Workspace Marketplace SDK](https://console.cloud.google.com/marketplace)
   - Fill in app details
   - Upload assets from `branding/` folder
   - Add detailed description and screenshots

4. **Submit for Review**
   - Since FlightNudge uses only non-restricted scopes, no CASA review is needed
   - Submit for standard Marketplace review
   - Expect 3-5 business days for approval

### Marketplace Description (Template)

```
FlightNudge: Flight-sized reminders for flights Gmail adds to Calendar

Never miss a flight with automatic, flight-appropriate reminders!

FlightNudge finds the flight events Gmail automatically adds to Google Calendar 
and replaces their reminders with flight-sized ones (24h, 3h, 90min before 
departure by default). Fully configurable, with optional support for hotel 
check-ins and restaurant reservations.

Features:
• Automatic flight detection from Gmail events
• Smart reminders (24h, 3h, 90min before departure)
• Fully configurable reminder times
• Hotel and restaurant reminder presets
• Airport travel time reminders
• Hourly automatic sync + manual run option
• Privacy-focused (no Gmail or Drive access)

Free tool by Drive I/O. Check out our other tools at driveio.io
```

## Technical Details

### Event Processing Logic

1. Fetches all `fromGmail` events using Calendar API's `eventTypes` filter
2. For each event:
   - Checks if already processed (stored in user properties)
   - Classifies event type (flight/hotel/restaurant/unknown)
   - If confidence > 0.5, applies appropriate reminders
   - Marks event as processed to avoid re-processing
   - Skips events the user manually edited

### Storage

User settings are stored in `PropertiesService.getUserProperties()`:
- Flight/hotel/restaurant reminder configurations
- Airport travel time setting
- Last run timestamp
- Processed event IDs (rolling window of last 1000 events)

### API Usage

- **Calendar Events.list**: Fetches `fromGmail` events (max 2500 per run)
- **Calendar Events.patch**: Updates event reminders
- Processes events for next 90 days by default
- Runs hourly (configurable via trigger interval constant)

### Performance

- Typical run: 100-500ms for 10-20 events
- Scales well up to 1000+ events
- No external API calls (Calendar API only)
- Minimal quota usage

## Troubleshooting

### "No fromGmail events found"

- Ensure Gmail is adding events to your calendar (check Gmail settings)
- Try searching for recent flight confirmation emails
- Make sure flights are in the next 90 days

### "Authorization required"

- Re-authorize the add-on in Google Calendar
- Check that all required scopes are enabled in Cloud Console
- Verify OAuth consent screen is properly configured

### "Cannot read property 'items'"

- Ensure Calendar Advanced Service is enabled in Apps Script project
- Check that Calendar API v3 is enabled in Cloud Console

### Events not being detected as flights

- Check the event's summary, description, and location fields
- Look for airline names, flight numbers, or airport codes
- File an issue with the event details (sanitized) for investigation

## Privacy & Security

FlightNudge is designed with privacy in mind:

- **No Gmail Access** - Does not read your emails
- **No Drive Access** - Does not access your files
- **Calendar Events Only** - Only reads/modifies calendar reminders
- **Local Processing** - All detection logic runs in your Apps Script environment
- **No External Servers** - No data sent to third parties
- **Open Source** - Code is fully auditable

## Contributing

Contributions welcome! Areas for improvement:

- Additional airline/airport detection patterns
- Internationalization (i18n) support
- More event type presets (train, bus, etc.)
- Enhanced UI/UX
- Additional test cases

Please open an issue or PR on GitHub.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_ORG/flightnudge/issues)
- **Email**: support@driveio.io
- **Website**: [driveio.io](https://www.driveio.io/?referrer=FlightNudge)

## Related Tools

Check out our other Drive I/O tools:
- [Copy Folder](https://www.driveio.io/standalone-plans/copy-folder-in-google-drive-extension?referrer=FlightNudge) - Copy entire Google Drive folders
- [TokenTally](https://github.com/Toriong/tokentally) - Live LLM token counter for Google Docs

---

Made with ✈️ by [Drive I/O](https://www.driveio.io/?referrer=FlightNudge)
