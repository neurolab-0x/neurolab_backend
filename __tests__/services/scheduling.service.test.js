import schedulingService from '../../service/SchedulingService.js';
import Appointment from '../../models/appointment.model.js';

// Mock dependencies
jest.mock('../../models/appointment.model.js');

describe('SchedulingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkAvailability should return available when no conflicts', async () => {
    // Mock no conflicting appointments
    Appointment.find.mockResolvedValue([]);
    
    const result = await schedulingService.checkAvailability(
      'doctor123', 
      '2023-10-20T10:00:00Z', 
      '2023-10-20T11:00:00Z'
    );
    
    expect(result.available).toBe(true);
  });

  test('checkAvailability should return not available when conflicts exist', async () => {
    // Mock conflicting appointment
    Appointment.find.mockResolvedValue([
      { _id: 'appointment123', status: 'ACCEPTED' }
    ]);
    
    const result = await schedulingService.checkAvailability(
      'doctor123', 
      '2023-10-20T10:00:00Z', 
      '2023-10-20T11:00:00Z'
    );
    
    expect(result.available).toBe(false);
  });

  test('getAvailableTimeSlots should return available slots', async () => {
    // Mock appointments for the day
    Appointment.find.mockResolvedValue([
      { 
        startTime: new Date('2023-10-20T09:00:00Z'),
        endTime: new Date('2023-10-20T10:00:00Z'),
        status: 'ACCEPTED'
      },
      {
        startTime: new Date('2023-10-20T14:00:00Z'),
        endTime: new Date('2023-10-20T15:00:00Z'),
        status: 'ACCEPTED'
      }
    ]);
    
    const result = await schedulingService.getAvailableTimeSlots('doctor123', '2023-10-20');
    
    // Verify we get available slots excluding the booked ones
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(slot => slot.start === '09:00' && slot.end === '10:00')).toBe(false);
    expect(result.some(slot => slot.start === '14:00' && slot.end === '15:00')).toBe(false);
  });
});