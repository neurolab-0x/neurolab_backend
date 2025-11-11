import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const calendarConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  calendarId: process.env.GOOGLE_CALENDAR_ID,
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,   // optional
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN, // required for long-term
};

// Create OAuth2 client
export const createOAuth2Client = () => {
  const oAuth2Client = new google.auth.OAuth2(
    calendarConfig.clientId,
    calendarConfig.clientSecret,
    calendarConfig.redirectUri
  );

  if (calendarConfig.refreshToken) {
    oAuth2Client.setCredentials({
      refresh_token: calendarConfig.refreshToken,
      access_token: calendarConfig.accessToken || undefined
    });
  }

  return oAuth2Client;
};

export const createCalendarClient = (auth) => {
  return google.calendar({ version: 'v3', auth });
};
