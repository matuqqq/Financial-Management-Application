import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransport({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development - use Ethereal Email or console
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal.pass',
      },
    });
  }
};

const transporter = createTransporter();

export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@financeflow.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #10B981; text-align: center;">Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #10B981; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 10 minutes. If you didn't request this password reset, 
          you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@financeflow.com',
    to: email,
    subject: 'Welcome to FinanceFlow!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #10B981; text-align: center;">Welcome to FinanceFlow!</h2>
        <p>Hi ${name},</p>
        <p>Welcome to FinanceFlow! We're excited to help you take control of your finances.</p>
        <p>Get started by:</p>
        <ul>
          <li>Adding your first transaction</li>
          <li>Setting up categories</li>
          <li>Exploring your dashboard</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background-color: #10B981; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>If you have any questions, don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The FinanceFlow Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    // Don't throw error for welcome email failure
  }
};