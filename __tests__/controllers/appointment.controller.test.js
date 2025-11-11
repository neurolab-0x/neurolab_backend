const { AppointmentController } = require('../../controllers/appointment.controller');
const { SchedulingService } = require('../../service/SchedulingService');
const { NotificationService } = require('../../service/NotificationService');
const  calendarService  = require('../../service/CalendarService');
const { PaymentService } = require('../../service/PaymentService');
const Appointment = require('../../models/appointment.model');
const Doctor = require('../../models/doctor.models');
const User = require('../../models/user.models');
const { mqttService } = require('../../config/mqtt/config');

jest.mock('../../service/SchedulingService');
jest.mock('../../service/NotificationService');
jest.mock('../../service/CalendarService', () => ({
  setCredentials: jest.fn(),
  createEvent: jest.fn(),
}));
jest.mock('../../service/PaymentService');
jest.mock('../../config/mqtt/config', () => ({
  mqttService: {
    isConnected: jest.fn(),
    publish: jest.fn(),
  },
}));

jest.mock('../../models/appointment.model', () => {
  const mockAppointment = {
    save: jest.fn(),
    populate: jest.fn().mockReturnThis(),
  };
  const Appointment = jest.fn().mockImplementation(() => mockAppointment);
  Appointment.findById = jest.fn(() => ({
    ...mockAppointment,
    status: 'PENDING',
    user: 'user123',
  }));
  return Appointment;
});
jest.mock('../../models/doctor.models', () => ({
  findById: jest.fn(),
}));
jest.mock('../../models/user.models', () => ({
  findById: jest.fn(),
}));

describe('AppointmentController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { doctorId: 'doctor123', appointmentId: 'appointment123' },
      body: {
        startTime: '2023-10-20T10:00:00Z',
        endTime: '2023-10-20T11:00:00Z',
        message: 'Test appointment'
      },
      user: { _id: 'user123', userId: 'user123' },
      query: { date: '2023-10-20' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAvailableTimeSlots', () => {
    it('should return available time slots', async () => {
      const availableSlots = [{ start: '10:00', end: '11:00' }];
      SchedulingService.prototype.getAvailableTimeSlots.mockResolvedValue(availableSlots);

      await AppointmentController.getAvailableTimeSlots(req, res, next);

      expect(SchedulingService.prototype.getAvailableTimeSlots).toHaveBeenCalledWith('doctor123', '2023-10-20');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ availableSlots });
    });
  });

  describe('requestAppointment', () => {
    it('should request an appointment', async () => {
      const mockDoctor = { _id: 'doctor123' };
      const mockUser = { _id: 'user123', fullName: 'Test User' };
      const mockAppointment = { _id: 'appointment123', save: jest.fn() };
      Doctor.findById.mockResolvedValue(mockDoctor);
      User.findById.mockResolvedValue(mockUser);
      SchedulingService.prototype.checkAvailability.mockResolvedValue({ available: true });
      Appointment.mockReturnValue(mockAppointment);
      mqttService.isConnected.mockReturnValue(true);
      NotificationService.prototype.sendAppointmentConfirmation.mockResolvedValue({ success: true });

      await AppointmentController.requestAppointment(req, res, next);

      expect(Doctor.findById).toHaveBeenCalledWith('doctor123');
      expect(SchedulingService.prototype.checkAvailability).toHaveBeenCalledWith('doctor123', req.body.startTime, req.body.endTime);
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment requested" }));
    });
  });

  describe('acceptAppointment', () => {
    it('should accept an appointment', async () => {
      const mockAppointment = { 
        _id: 'appointment123', 
        status: 'PENDING',
        save: jest.fn(),
        populate: jest.fn().mockReturnThis(),
        user: 'user123',
      };
      const mockDoctor = { _id: 'doctor123', calendarTokens: 'some-tokens' };
      const mockUser = { _id: 'user123', email: 'user@example.com' };
      Appointment.findById.mockResolvedValue(mockAppointment);
      User.findById.mockResolvedValueOnce(mockDoctor).mockResolvedValueOnce(mockUser);
      calendarService.createEvent.mockResolvedValue({ success: true });
      NotificationService.prototype.sendStatusUpdate.mockResolvedValue({ success: true });

      await AppointmentController.acceptAppointment(req, res, next);

      expect(Appointment.findById).toHaveBeenCalledWith('appointment123');
      expect(mockAppointment.status).toBe('ACCEPTED');
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment accepted" }));
    });
  });
});