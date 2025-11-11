import nodemailer from "nodemailer";
import config from "../config/email.config.js";

export class EmailService {
  constructor() {
    // We'll create the transporter in the init method
    this.transporter = null;
  }

  async init() {
    try {
      // Create a test account with Ethereal
      const testAccount = await nodemailer.createTestAccount();
      
      // Create a transporter with the test account
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log("Email service connected successfully");
      console.log("Ethereal test account created:");
      console.log("Username:", testAccount.user);
      console.log("Password:", testAccount.pass);
    } catch (error) {
      console.error("Email service connection failed:", error);
      throw new Error("Email service configuration error");
    }
  }

  async sendVerificationEmail(user) {
    try {
      const verificationLink = `${config.appUrl || 'http://localhost:5000'}/api/auth/verify-email/${user.verificationToken}`;

      const info = await this.transporter.sendMail({
        from: '"Neurolab" <noreply@neurolab.com>',
        to: user.email,
        subject: "Verify your Neurolab account",
        html: `
                    <h1>Welcome to Neurolab!</h1>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
                `,
      });

      // Get and log the preview URL for Ethereal emails
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL for verification email:', previewUrl);
        console.log('Open this URL to view the email in a browser');
      }

      console.log("Verification email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(user) {
    try {
      const resetLink = `${config.appUrl || 'http://localhost:5000'}/api/auth/reset-password/${user.resetPasswordToken}`;

      const info = await this.transporter.sendMail({
        from: '"Neurolab" <noreply@neurolab.com>',
        to: user.email,
        subject: "Reset your Neurolab password",
        html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
            `,
      });
      
      // Get and log the preview URL for Ethereal emails
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL for password reset email:', previewUrl);
        console.log('Open this URL to view the email in a browser');
      }
      
      console.log("Password reset email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  }
}
