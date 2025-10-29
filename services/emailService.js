// services/emailService.js

// Было 'require'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// 1. Создаем "транспортер"
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Отправляет одно рекламное письмо.
 * @param {string} to - Email получателя
 * @param {string} subject - Тема письма
 * @param {string} htmlBody - Тело письма (в формате HTML)
 */

// Было 'module.exports', стало 'export' прямо здесь
export const sendPromotionalEmail = async (to, subject, htmlBody) => {
  try {
    const mailOptions = {
      from: `"Sushi Icon Promo" <${process.env.EMAIL_USER}>`, 
      to: to, 
      subject: subject, 
      html: htmlBody, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// 'module.exports = { ... }' - БОЛЬШЕ НЕ НУЖЕН