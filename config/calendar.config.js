import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Google Calendar API configuration
const calendarConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  calendarId: process.env.GOOGLE_CALENDAR_ID
};

// Create OAuth2 client
const createOAuth2Client = () => {
  const oAuth2Client = new google.auth.OAuth2(
    calendarConfig.clientId,
    calendarConfig.clientSecret,
    calendarConfig.redirectUri
  );
  return oAuth2Client;
};

// Create Google Calendar API client
const createCalendarClient = (auth) => {
  return google.calendar({ version: 'v3', auth });
};

export { calendarConfig, createOAuth2Client, createCalendarClient };