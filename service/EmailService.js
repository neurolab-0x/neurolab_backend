import nodemailer from 'nodemailer';
import config from '../config/email.config.js';

export class EmailService {
    constructor()  {
        this.transporter = nodemailer.createTransport(config.emailConfig);
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connected successfully');
        } catch (error) {
            console.error('Email service connection failed:', error);
            throw new Error('Email service configuration error');
        }
    }

    async sendVerificationEmail(user) {
        try {
            const verificationLink = `${config.appUrl}/verify-email/${user.verificationToken}`;
            
            const info = await this.transporter.sendMail({
                from: '"Neurolab" <noreply@neurolab.com>',
                to: user.email,
                subject: 'Verify your Neurolab account',
                html: `
                    <h1>Welcome to Neurolab!</h1>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
                `
            });

            console.log('Verification email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(user) {
        const resetLink = `${config.appUrl}/reset-password/${user.resetPasswordToken}`;
        
        await this.transporter.sendMail({
            to: user.email,
            subject: 'Reset your Neurolab password',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
            `
        });
    }
}