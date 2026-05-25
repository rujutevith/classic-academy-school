const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = async (email, resetToken, username) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request - Classic Academy EIMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Classic Academy - Password Reset</h2>
                <p>Hello ${username},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Reset Password
                </a>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">Classic Academy School - Employee Information Management System</p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

const sendWelcomeEmail = async (email, username, password) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Classic Academy EIMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Welcome to Classic Academy EIMS!</h2>
                <p>Hello ${username},</p>
                <p>Your account has been created successfully. Here are your login credentials:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p><strong>Username:</strong> ${username}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please change your password after your first login.</p>
                <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Login to System
                </a>
                <hr>
                <p style="color: #666; font-size: 12px;">Classic Academy School - Employee Information Management System</p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };