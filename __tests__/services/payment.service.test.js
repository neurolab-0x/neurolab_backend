import paymentService from '../../service/PaymentService.js';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'session_123',
          url: 'https://checkout.stripe.com/session_123'
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'session_123',
          payment_status: 'paid',
          customer_details: { email: 'patient@example.com' }
        })
      }
    }
  }));
});

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createPaymentSession should create a Stripe checkout session', async () => {
    const appointmentData = {
      _id: 'appointment123',
      price: 100,
      startTime: new Date('2023-10-20T10:00:00Z'),
      doctor: { fullName: 'Dr. Smith' }
    };

    const result = await paymentService.createPaymentSession(appointmentData);

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('session_123');
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session_123');
  });

  test('handlePaymentSuccess should retrieve session and confirm payment', async () => {
    const sessionId = 'session_123';

    const result = await paymentService.handlePaymentSuccess(sessionId);

    expect(result.success).toBe(true);
    expect(result.paid).toBe(true);
    expect(result.customerEmail).toBe('patient@example.com');
  });
});