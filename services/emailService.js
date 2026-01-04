const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

const initializeEmailService = () => {
  if (config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
    console.log('Email service initialized');
  } else {
    console.warn('Email credentials not configured. Email functionality will be disabled.');
  }
};

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Email service not initialized. Skipping email to:', to);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      to,
      subject,
      html,
      from: `"${config.appName}" <${config.email.user}>`
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendTransactionNotification = async (email, amount, type, accountNo) => {
  const typeText = type === 'credit' ? 'credited to' : 'debited from';
  const subject = `${config.appName} - Transaction Notification`;
  const html = `
    <h2>Transaction Notification</h2>
    <p>Dear Customer,</p>
    <p>An amount of ₹${amount} has been ${typeText} your account ${accountNo}.</p>
    <p>If you did not authorize this transaction, please contact us immediately.</p>
    <br>
    <p>Thank you,<br>${config.appName}</p>
  `;

  return await sendEmail(email, subject, html);
};

const sendVerificationCode = async (email, code) => {
  const subject = `${config.appName} - Transaction Verification`;
  const html = `
    <h2>Transaction Verification</h2>
    <p>Hello,</p>
    <p>Your verification code for the transaction is: <strong>${code}</strong></p>
    <p>Please enter this code to complete your transaction.</p>
    <p>This code is valid for 10 minutes.</p>
    <br>
    <p>Thank you,<br>${config.appName}</p>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendTransactionNotification,
  sendVerificationCode
};

