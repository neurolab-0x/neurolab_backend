import calendarService from '../../service/CalendarService.js';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis', () => {
  const mockCalendarEvents = {
    insert: jest.fn().mockResolvedValue({ data: { id: 'event123', htmlLink: 'https://calendar.google.com/event' } }),
    update: jest.fn().mockResolvedValue({ data: { id: 'event123', updated: true } }),
    delete: jest.fn().mockResolvedValue({ data: { deleted: true } })
  };
  
  const mockCalendar = jest.fn().mockImplementation(() => ({
    events: mockCalendarEvents
  }));
  
  const mockOAuth2 = jest.fn().mockImplementation(() => ({
    setCredentials: jest.fn(),
    getToken: jest.fn().mockResolvedValue({ tokens: { access_token: 'new_token' } }),
    generateAuthUrl: jest.fn().mockReturnValue('https://google.com/auth')
  }));
  
  return {
    google: {
      auth: {
        OAuth2: mockOAuth2
      },
      calendar: mockCalendar
    }
  };
});

describe('CalendarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createEvent should create a calendar event', async () => {
    const eventDetails = {
      summary: 'Test Appointment',
      start: { dateTime: '2023-10-20T10:00:00Z' },
      end: { dateTime: '2023-10-20T11:00:00Z' },
      attendees: [{ email: 'patient@example.com' }]
    };

    const result = await calendarService.createEvent(eventDetails);

    expect(result.success).toBe(true);
    expect(result.eventId).toBe('event123');
    expect(result.htmlLink).toBe('https://calendar.google.com/event');
  });

  test('updateEvent should update a calendar event', async () => {
    const eventId = 'event123';
    const eventDetails = {
      summary: 'Updated Appointment',
      start: { dateTime: '2023-10-21T10:00:00Z' },
      end: { dateTime: '2023-10-21T11:00:00Z' }
    };

    const result = await calendarService.updateEvent(eventId, eventDetails);

    expect(result.success).toBe(true);
  });

  test('deleteEvent should delete a calendar event', async () => {
    const eventId = 'event123';

    const result = await calendarService.deleteEvent(eventId);

    expect(result.success).toBe(true);
  });

  test('getAuthUrl should return authorization URL', () => {
    const result = calendarService.getAuthUrl();
    
    expect(result).toBe('https://google.com/auth');
  });

  test('getTokens should exchange code for tokens', async () => {
    const code = 'auth_code_123';
    
    const result = await calendarService.getTokens(code);
    
    expect(result.access_token).toBe('new_token');
  });
});