import { calendarConfig, createOAuth2Client, createCalendarClient } from '../config/calendar.config.js';

export class CalendarService {
  constructor() {
    this.oAuth2Client = createOAuth2Client();
    this.calendar = null;
  }

  setCredentials(tokens) {
    this.oAuth2Client.setCredentials(tokens);
    this.calendar = createCalendarClient(this.oAuth2Client);
  }

  async createEvent(appointment) {
    if (!this.calendar) {
      throw new Error('Calendar client not initialized');
    }

    const event = {
      summary: `Appointment with ${appointment.doctorName || 'Doctor'}`,
      description: appointment.message || 'Medical appointment',
      start: {
        dateTime: appointment.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: appointment.endTime,
        timeZone: 'UTC',
      },
      attendees: [
        { email: appointment.userEmail },
        { email: appointment.doctorEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: calendarConfig.calendarId || 'primary',
        resource: event,
        sendNotifications: true
      });
      
      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateEvent(eventId, appointment) {
    if (!this.calendar) {
      throw new Error('Calendar client not initialized');
    }

    const event = {
      summary: `Appointment with ${appointment.doctorName || 'Doctor'}`,
      description: appointment.message || 'Medical appointment',
      start: {
        dateTime: appointment.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: appointment.endTime,
        timeZone: 'UTC',
      }
    };

    try {
      const response = await this.calendar.events.update({
        calendarId: calendarConfig.calendarId || 'primary',
        eventId: eventId,
        resource: event,
        sendNotifications: true
      });
      
      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteEvent(eventId) {
    if (!this.calendar) {
      throw new Error('Calendar client not initialized');
    }

    try {
      await this.calendar.events.delete({
        calendarId: calendarConfig.calendarId || 'primary',
        eventId: eventId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate authorization URL for user to grant calendar access
  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }
}

export default new CalendarService();