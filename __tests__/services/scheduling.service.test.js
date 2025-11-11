import schedulingService from '../../service/SchedulingService.js';
import Appointment from '../../models/appointment.model.js';
import Doctor from '../../models/doctor.models.js';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../../models/appointment.model.js', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([]),
  }),
}));
jest.mock('../../models/doctor.models.js');

describe('SchedulingService', () => {
  const doctorId = new mongoose.Types.ObjectId().toHexString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkAvailability should return available when no conflicts', async () => {
    // Mock no conflicting appointments
    Doctor.findById.mockResolvedValue({ _id: doctorId });
    Appointment.find.mockResolvedValue([]);
    
    const result = await schedulingService.checkAvailability(
      doctorId, 
      '2023-10-20T10:00:00Z', 
      '2023-10-20T11:00:00Z'
    );
    
    expect(result.available).toBe(true);
  });

  test('checkAvailability should return not available when conflicts exist', async () => {
    // Mock conflicting appointment
    Doctor.findById.mockResolvedValue({ _id: doctorId });
    Appointment.find.mockResolvedValue([
      { _id: 'appointment123', status: 'ACCEPTED' }
    ]);
    
    const result = await schedulingService.checkAvailability(
      doctorId, 
      '2023-10-20T10:00:00Z', 
      '2023-10-20T11:00:00Z'
    );
    
    expect(result.available).toBe(false);
  });

  test('getAvailableTimeSlots should return available slots', async () => {
    // Mock appointments for the day
    Doctor.findById.mockResolvedValue({ _id: doctorId });
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
    
    const result = await schedulingService.getAvailableTimeSlots(doctorId, '2023-10-20');
    
    // Verify we get available slots excluding the booked ones
    expect(result.length).toBeGreaterThan(0);
  });
});