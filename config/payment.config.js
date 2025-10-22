import dotenv from 'dotenv';

dotenv.config();

const paymentConfig = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  currency: 'usd',
  successUrl: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:5173/payment/success',
  cancelUrl: process.env.PAYMENT_CANCEL_URL || 'http://localhost:5173/payment/cancel'
};

export default paymentConfig;