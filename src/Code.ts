/**
 * FlightNudge - Main Entry Point
 * Google Calendar Workspace Add-on
 */

import { ADDON_NAME, TRIGGER_INTERVAL_HOURS, DRIVE_IO_REFERRER_LINK, DRIVE_IO_COPY_FOLDER_LINK } from './Constants';
import { ReminderManager } from './ReminderManager';
import { SettingsManager } from './SettingsManager';
import { formatMinutesToHuman, logWithTimestamp } from './Utils';

/**
 * Runs when the add-on is installed
 */
function onInstall(e: GoogleAppsScript.Events.AddonOnInstall): void {
  onOpen(e);
}

/**
 * Runs when a Calendar is opened
 */
function onOpen(_e?: any): void {
  // @ts-ignore - getUi exists at runtime but not in type definitions
  const menu = CalendarApp.getUi()
    .createAddonMenu()
    .addItem('Run Now', 'runNow')
    .addItem('Settings', 'showSettings')
    .addItem('About', 'showAbout');
  
  menu.addToUi();
  
  // Set up trigger on first run
  setupTriggerIfNeeded();
}

/**
 * Home page for the add-on
 */
function onHomePage(_e?: any): GoogleAppsScript.Card_Service.Card[] {
  return [buildHomeCard()];
}

/**
 * Settings handler
 */
function onSettings(_e?: any): GoogleAppsScript.Card_Service.Card {
  return buildSettingsCard();
}

/**
 * Build the home card
 */
function buildHomeCard(): GoogleAppsScript.Card_Service.Card {
  const settingsManager = new SettingsManager();
  const settings = settingsManager.getAllSettings();
  const lastRun = settingsManager.getLastRun();
  
  const card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle(ADDON_NAME)
      .setSubtitle('Flight-sized reminders')
  );

  const section = CardService.newCardSection();
  
  // Status info
  if (lastRun) {
    section.addWidget(
      CardService.newTextParagraph()
        .setText(`<b>Last run:</b> ${lastRun.toLocaleString()}`)
    );
  } else {
    section.addWidget(
      CardService.newTextParagraph()
        .setText('<b>Status:</b> Never run')
    );
  }

  section.addWidget(CardService.newDivider());

  // Current settings summary
  section.addWidget(
    CardService.newTextParagraph()
      .setText(`<b>Flight reminders:</b><br>${settings.flightReminders.map(formatMinutesToHuman).join(', ')}`)
  );

  section.addWidget(
    CardService.newTextParagraph()
      .setText(`<b>Hotel reminders:</b><br>${settings.hotelReminders.map(formatMinutesToHuman).join(', ')}`)
  );

  section.addWidget(
    CardService.newTextParagraph()
      .setText(`<b>Restaurant reminders:</b><br>${settings.restaurantReminders.map(formatMinutesToHuman).join(', ')}`)
  );

  if (settings.airportTravelTime > 0) {
    section.addWidget(
      CardService.newTextParagraph()
        .setText(`<b>Airport travel time:</b> ${formatMinutesToHuman(settings.airportTravelTime)}`)
    );
  }

  section.addWidget(CardService.newDivider());

  // Run now button
  section.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Run Now')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleRunNow')
          )
      )
      .addButton(
        CardService.newTextButton()
          .setText('Settings')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleSettings')
          )
      )
  );

  // Drive I/O promotion
  const promoSection = CardService.newCardSection();
  promoSection.addWidget(CardService.newDivider());
  promoSection.addWidget(
    CardService.newTextParagraph()
      .setText(`<font color="#9DD6FC"><b>Powered by Drive I/O</b></font><br>` +
               `Explore more <a href="${DRIVE_IO_REFERRER_LINK}">Drive I/O tools</a> ` +
               `like <a href="${DRIVE_IO_COPY_FOLDER_LINK}">Copy Folder</a>`)
  );

  card.addSection(section);
  card.addSection(promoSection);

  return card.build();
}

/**
 * Build the settings card
 */
function buildSettingsCard(): GoogleAppsScript.Card_Service.Card {
  const settingsManager = new SettingsManager();
  const settings = settingsManager.getAllSettings();

  const card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Settings')
      .setSubtitle('Configure reminder times')
  );

  const section = CardService.newCardSection();

  // Instructions
  section.addWidget(
    CardService.newTextParagraph()
      .setText('Enter reminder times in minutes (comma-separated). Examples: 1440,180,90 for 24h, 3h, 90min')
  );

  // Flight reminders
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('flightReminders')
      .setTitle('Flight Reminders (minutes)')
      .setValue(settings.flightReminders.join(','))
  );

  // Hotel reminders
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('hotelReminders')
      .setTitle('Hotel Reminders (minutes)')
      .setValue(settings.hotelReminders.join(','))
  );

  // Restaurant reminders
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('restaurantReminders')
      .setTitle('Restaurant Reminders (minutes)')
      .setValue(settings.restaurantReminders.join(','))
  );

  // Airport travel time
  section.addWidget(
    CardService.newTextInput()
      .setFieldName('airportTravelTime')
      .setTitle('Airport Travel Time (minutes, 0 to disable)')
      .setValue(settings.airportTravelTime.toString())
  );

  // Buttons
  section.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Save')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleSaveSettings')
          )
      )
      .addButton(
        CardService.newTextButton()
          .setText('Cancel')
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName('handleCancel')
          )
      )
  );

  card.addSection(section);
  return card.build();
}

/**
 * Handle Run Now button
 */
// @ts-ignore - used by Apps Script at runtime
function handleRunNow(_e?: any): GoogleAppsScript.Card_Service.ActionResponse {
  const result = runNow();
  
  const notification = CardService.newNotification()
    .setText(
      `Processed ${result.totalProcessed} events. ` +
      `Updated: ${result.flightsUpdated} flights, ${result.hotelsUpdated} hotels, ` +
      `${result.restaurantsUpdated} restaurants. Skipped: ${result.skipped}`
    );

  return CardService.newActionResponseBuilder()
    .setNotification(notification)
    .setNavigation(CardService.newNavigation().updateCard(buildHomeCard()))
    .build();
}

/**
 * Handle Settings button
 */
// @ts-ignore - used by Apps Script at runtime
function handleSettings(_e?: any): GoogleAppsScript.Card_Service.ActionResponse {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(buildSettingsCard()))
    .build();
}

/**
 * Handle Save Settings
 */
// @ts-ignore - used by Apps Script at runtime
function handleSaveSettings(e: any): GoogleAppsScript.Card_Service.ActionResponse {
  const formInputs = e.formInput;
  const settingsManager = new SettingsManager();
  
  try {
    // Parse flight reminders
    const flightReminders = formInputs.flightReminders
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    
    // Parse hotel reminders
    const hotelReminders = formInputs.hotelReminders
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    
    // Parse restaurant reminders
    const restaurantReminders = formInputs.restaurantReminders
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    
    // Parse airport travel time
    const airportTravelTime = parseInt(formInputs.airportTravelTime, 10) || 0;

    // Validate and save
    const success = 
      settingsManager.setFlightReminders(flightReminders) &&
      settingsManager.setHotelReminders(hotelReminders) &&
      settingsManager.setRestaurantReminders(restaurantReminders) &&
      settingsManager.setAirportTravelTime(airportTravelTime);

    if (success) {
      const notification = CardService.newNotification()
        .setText('Settings saved successfully!');
      
      return CardService.newActionResponseBuilder()
        .setNotification(notification)
        .setNavigation(CardService.newNavigation().popCard())
        .build();
    } else {
      throw new Error('Invalid settings values');
    }
  } catch (error) {
    const notification = CardService.newNotification()
      .setText(`Error saving settings: ${error}`);
    
    return CardService.newActionResponseBuilder()
      .setNotification(notification)
      .build();
  }
}

/**
 * Handle Cancel
 */
// @ts-ignore - used by Apps Script at runtime
function handleCancel(_e?: any): GoogleAppsScript.Card_Service.ActionResponse {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popCard())
    .build();
}

/**
 * Run the reminder processor now (manual trigger)
 */
function runNow(): any {
  logWithTimestamp('Manual run triggered');
  const manager = new ReminderManager();
  return manager.processFromGmailEvents();
}

/**
 * Scheduled trigger function (runs hourly)
 */
function scheduledRun(): void {
  logWithTimestamp('Scheduled run triggered');
  const manager = new ReminderManager();
  manager.processFromGmailEvents();
}

/**
 * Show about dialog
 */
// @ts-ignore - used by Apps Script at runtime
function showAbout(): void {
  const html = HtmlService.createHtmlOutput(
    `<div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #9DD6FC;">${ADDON_NAME}</h2>
      <p>Automatically updates reminders for flights (and hotels/restaurants) that Gmail adds to your calendar.</p>
      <p><strong>Version:</strong> 1.0.0</p>
      <p><strong>By:</strong> <a href="${DRIVE_IO_REFERRER_LINK}" target="_blank">Drive I/O</a></p>
      <hr>
      <p style="font-size: 0.9em; color: #666;">
        FlightNudge is free and open source. 
        Check out our other tools at <a href="${DRIVE_IO_REFERRER_LINK}" target="_blank">driveio.io</a>
      </p>
    </div>`
  )
    .setWidth(400)
    .setHeight(300);
  
  // @ts-ignore - getUi exists at runtime
  CalendarApp.getUi().showModalDialog(html, 'About FlightNudge');
}

/**
 * Show settings dialog
 */
// @ts-ignore - used by Apps Script at runtime
function showSettings(): void {
  const html = HtmlService.createHtmlOutputFromFile('Settings')
    .setWidth(600)
    .setHeight(500);
  
  // @ts-ignore - getUi exists at runtime
  CalendarApp.getUi().showModalDialog(html, 'FlightNudge Settings');
}

/**
 * Set up the hourly trigger if it doesn't exist
 */
function setupTriggerIfNeeded(): void {
  const triggers = ScriptApp.getProjectTriggers();
  const hasScheduledTrigger = triggers.some(
    trigger => trigger.getHandlerFunction() === 'scheduledRun'
  );

  if (!hasScheduledTrigger) {
    ScriptApp.newTrigger('scheduledRun')
      .timeBased()
      .everyHours(TRIGGER_INTERVAL_HOURS)
      .create();
    
    logWithTimestamp('Created hourly trigger');
  }
}

/**
 * Remove all triggers (for cleanup)
 */
function removeAllTriggers(): void {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  logWithTimestamp('Removed all triggers');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    onInstall,
    onOpen,
    onHomePage,
    onSettings,
    runNow,
    scheduledRun,
    setupTriggerIfNeeded,
    removeAllTriggers
  };
}
