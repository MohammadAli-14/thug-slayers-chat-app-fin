// lib/sendgrid-api.js
import sgMail from '@sendgrid/mail';
import { ENV } from './env.js';

// Set the API key for all subsequent calls
sgMail.setApiKey(ENV.SENDGRID_API_KEY);

export const sendEmailViaAPI = async (mailOptions) => {
  try {
    const msg = {
      to: mailOptions.to,
      from: {
        email: ENV.EMAIL_FROM, // Your verified sender email
        name: ENV.EMAIL_FROM_NAME, // Your sender name
      },
      subject: mailOptions.subject,
      html: mailOptions.html,
    };

    // Use SendGrid's API directly
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid API');
    return { success: true };
  } catch (error) {
    console.error('Error sending email with SendGrid API:', error);
    
    // Log more detailed error information if available
    if (error.response) {
      console.error('SendGrid API error details:', error.response.body);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};