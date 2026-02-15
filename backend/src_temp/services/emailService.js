import nodemailer from 'nodemailer';
import SystemConfig from '../models/SystemConfig.js';

export const getTransporter = async () => {
    try {
        const smtpConfig = await SystemConfig.findOne({ key: 'smtp' });

        if (!smtpConfig || !smtpConfig.value) {
            console.warn('⚠️ SMTP Configuration not found. Emails will not be sent.');
            return null;
        }

        const { host, port, user, pass, secure } = smtpConfig.value;

        return nodemailer.createTransport({
            host,
            port,
            secure: secure || false, // true for 465, false for other ports
            auth: {
                user,
                pass
            }
        });
    } catch (error) {
        console.error('❌ Error creating email transporter:', error);
        return null;
    }
};

export const sendEmail = async (to, subject, html) => {
    const transporter = await getTransporter();

    if (!transporter) {
        return { success: false, error: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: '"NullPtr Auth" <no-reply@nullptr.com>', // Sender address
            to,
            subject,
            html
        });

        console.log('📧 Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

export const sendOTP = async (email, otp) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">Verify Your Email</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">Use the following code to complete your registration:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, 'Your Verification Code', html);
};

export const sendPasswordReset = async (email, resetUrl) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #d946ef; text-align: center;">Reset Your Password</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">You requested a password reset. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #555; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #555; font-size: 14px;">Or copy this link: <br> <a href="${resetUrl}">${resetUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, 'Reset Your Password', html);
};
