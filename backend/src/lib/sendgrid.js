// lib/sendgrid.js
import nodemailer from 'nodemailer';
import { ENV } from './env.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: ENV.SENDGRID_API_KEY, // This should now work
  },
});

// Add verification to check if the API key is loaded
console.log('SendGrid API Key loaded:', ENV.SENDGRID_API_KEY ? 'Yes' : 'No');

export default transporter;