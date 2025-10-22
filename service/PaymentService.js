import Stripe from 'stripe';
import paymentConfig from '../config/payment.config.js';

export class PaymentService {
  constructor() {
    this.stripe = new Stripe(paymentConfig.stripeSecretKey);
  }
  
  async createPaymentSession(appointment, user, doctor) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: paymentConfig.currency,
              product_data: {
                name: `Appointment with Dr. ${doctor.fullName}`,
                description: `Medical appointment on ${new Date(appointment.startTime).toLocaleString()}`,
              },
              unit_amount: Math.round(appointment.price * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${paymentConfig.successUrl}?appointment_id=${appointment._id}`,
        cancel_url: `${paymentConfig.cancelUrl}?appointment_id=${appointment._id}`,
        customer_email: user.email,
        client_reference_id: appointment._id.toString(),
        metadata: {
          appointmentId: appointment._id.toString(),
          userId: user._id.toString(),
          doctorId: doctor._id.toString(),
        },
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Error creating payment session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handlePaymentSuccess(sessionId) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      return {
        success: true,
        appointmentId: session.client_reference_id,
        paymentId: session.payment_intent,
        amount: session.amount_total / 100, // Convert from cents
        status: session.payment_status
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PaymentService();