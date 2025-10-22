import calendarService from '../../service/CalendarService.js';

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
    const credentials = { access_token: 'token123' };
    const eventDetails = {
      summary: 'Test Appointment',
      start: '2023-10-20T10:00:00Z',
      end: '2023-10-20T11:00:00Z',
      attendees: ['patient@example.com']
    };

    const result = await calendarService.createEvent(credentials, eventDetails);

    expect(result.success).toBe(true);
    expect(result.eventId).toBe('event123');
    expect(result.eventLink).toBe('https://calendar.google.com/event');
  });

  test('updateEvent should update a calendar event', async () => {
    const credentials = { access_token: 'token123' };
    const eventId = 'event123';
    const eventDetails = {
      summary: 'Updated Appointment',
      start: '2023-10-21T10:00:00Z',
      end: '2023-10-21T11:00:00Z'
    };

    const result = await calendarService.updateEvent(credentials, eventId, eventDetails);

    expect(result.success).toBe(true);
  });

  test('deleteEvent should delete a calendar event', async () => {
    const credentials = { access_token: 'token123' };
    const eventId = 'event123';

    const result = await calendarService.deleteEvent(credentials, eventId);

    expect(result.success).toBe(true);
  });

  test('generateAuthUrl should return authorization URL', () => {
    const result = calendarService.generateAuthUrl();
    
    expect(result).toBe('https://google.com/auth');
  });

  test('exchangeCodeForToken should exchange code for tokens', async () => {
    const code = 'auth_code_123';
    
    const result = await calendarService.exchangeCodeForToken(code);
    
    expect(result.access_token).toBe('new_token');
  });
});