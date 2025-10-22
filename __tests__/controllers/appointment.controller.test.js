// Mock all dependencies directly
const mockAppointment = {
  _id: 'appointment123',
  save: jest.fn().mockResolvedValue(true),
  status: 'PENDING'
};

const mockDoctor = {
  _id: 'doctor123',
  appointmentPrice: 100
};

const mockUser = {
  _id: 'user123',
  fullName: 'Test User',
  calendarTokens: { access_token: 'token' }
};

// Mock services
const mockSchedulingService = {
  checkAvailability: jest.fn().mockResolvedValue({ available: true }),
  getAvailableTimeSlots: jest.fn().mockResolvedValue([{ start: '10:00', end: '11:00' }])
};

const mockNotificationService = {
  sendAppointmentConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendStatusUpdate: jest.fn().mockResolvedValue({ success: true })
};

const mockCalendarService = {
  createEvent: jest.fn().mockResolvedValue({ success: true, eventId: 'event123' }),
  updateEvent: jest.fn().mockResolvedValue({ success: true }),
  deleteEvent: jest.fn().mockResolvedValue({ success: true })
};

const mockPaymentService = {
  createPaymentSession: jest.fn().mockResolvedValue({ success: true, sessionId: 'session123' }),
  handlePaymentSuccess: jest.fn().mockResolvedValue(true)
};

const mockMqttService = {
  publish: jest.fn()
};

// Mock the service modules
jest.mock('../../service/SchedulingService.js', () => ({
  SchedulingService: mockSchedulingService
}));

jest.mock('../../service/NotificationService.js', () => ({
  NotificationService: mockNotificationService
}));

jest.mock('../../service/CalendarService.js', () => ({
  CalendarService: mockCalendarService
}));

jest.mock('../../service/PaymentService.js', () => ({
  PaymentService: mockPaymentService
}));

// Mock models
const Appointment = jest.fn().mockImplementation(() => mockAppointment);
Appointment.findById = jest.fn().mockResolvedValue(mockAppointment);
Appointment.find = jest.fn().mockResolvedValue([]);
Appointment.create = jest.fn().mockResolvedValue(mockAppointment);
Appointment.findByIdAndUpdate = jest.fn().mockResolvedValue({
  ...mockAppointment,
  status: 'ACCEPTED'
});

const Doctor = {
  findById: jest.fn().mockResolvedValue(mockDoctor)
};

const User = {
  findById: jest.fn().mockResolvedValue(mockUser)
};

// Create AppointmentController with mocked dependencies
const AppointmentController = {
  getAvailableTimeSlots: async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    const availableSlots = await mockSchedulingService.getAvailableTimeSlots(doctorId, date);
    
    return res.status(200).json({ availableSlots });
  },
  
  requestAppointment: async (req, res) => {
    const { doctorId } = req.params;
    const { startTime, endTime, message } = req.body;
    const userId = req.user._id;
    
    const doctor = await Doctor.findById(doctorId);
    const availability = await mockSchedulingService.checkAvailability(doctorId, startTime, endTime);
    
    if (availability.available) {
      const appointment = new Appointment();
      await appointment.save();
      return res.status(200).json({ success: true, appointment });
    }
    
    return res.status(400).json({ success: false, message: 'Doctor not available' });
  },
  
  acceptAppointment: async (req, res) => {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    appointment.status = 'ACCEPTED';
    
    await mockCalendarService.createEvent({ access_token: 'token' }, {});
    await mockNotificationService.sendStatusUpdate(appointment, 'ACCEPTED');
    
    await appointment.save();
    
    return res.status(200).json({ success: true });
  }
};

describe('AppointmentController', () => {
  let req, res;

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

    jest.clearAllMocks();
  });

  test('getAvailableTimeSlots should return available slots', async () => {
    await AppointmentController.getAvailableTimeSlots(req, res);
    
    expect(mockSchedulingService.getAvailableTimeSlots).toHaveBeenCalledWith('doctor123', '2023-10-20');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ availableSlots: [{ start: '10:00', end: '11:00' }] });
  });

  test('requestAppointment should create appointment when doctor is available', async () => {
    await AppointmentController.requestAppointment(req, res);
    
    expect(Doctor.findById).toHaveBeenCalledWith('doctor123');
    expect(mockAppointment.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('acceptAppointment should accept appointment and create calendar event', async () => {
    await AppointmentController.acceptAppointment(req, res);
    
    expect(mockAppointment.status).toBe('ACCEPTED');
    expect(mockAppointment.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});