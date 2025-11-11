import { NotificationService } from '../../service/NotificationService.js';
import { mqttService } from '../../config/mqtt/config.js';
import { EmailService } from '../../service/EmailService.js';

// Mock dependencies
jest.mock('../../config/mqtt/config.js', () => ({
  mqttService: {
    publish: jest.fn()
  }
}));

jest.mock('../../service/EmailService.js', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    sendEmail: jest.fn().mockResolvedValue({ success: true })
  }))
}));

describe('NotificationService', () => {
  let notificationService;
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
    notificationService = new NotificationService(emailService);
    jest.clearAllMocks();
  });

  const appointmentData = {
    _id: 'appointment123',
    user: { email: 'patient@example.com', fullName: 'John Doe' },
    doctor: { email: 'doctor@example.com', fullName: 'Dr. Smith' },
    startTime: new Date('2023-10-20T10:00:00Z'),
    endTime: new Date('2023-10-20T11:00:00Z'),
    save: jest.fn(),
  };

  test('sendAppointmentConfirmation should send confirmation email and MQTT message', async () => {
    const result = await notificationService.sendAppointmentConfirmation(appointmentData, appointmentData.user, appointmentData.doctor);
    
    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(mqttService.publish).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  test('sendAppointmentReminder should send reminder email', async () => {
    const result = await notificationService.sendAppointmentReminder(appointmentData, appointmentData.user, appointmentData.doctor);
    
    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  test('sendStatusUpdate should send status update email and MQTT message', async () => {
    const status = 'ACCEPTED';
    const result = await notificationService.sendStatusUpdate(appointmentData, appointmentData.user, appointmentData.doctor, status);
    
    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(mqttService.publish).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});