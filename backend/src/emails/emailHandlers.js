// emails/emailHandlers.js
import { sendEmailViaAPI } from '../lib/sendgrid.js'; // Import the new API client
import { 
  createVerificationTemplate, 
  createWelcomeEmailTemplate,
  createResetPasswordTemplate
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, name, verificationCode) => {
  const mailOptions = {
    to: email,
    subject: "Verify Your Account - Thug Slayers Messenger",
    html: createVerificationTemplate(verificationCode, name),
  };

  await sendEmailViaAPI(mailOptions);
};

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const mailOptions = {
    to: email,
    subject: "Welcome to Thug Slayers Messenger!",
    html: createWelcomeEmailTemplate(name, clientURL),
  };

  await sendEmailViaAPI(mailOptions);
};

export const sendResetPasswordEmail = async (email, name, resetOTP) => {
  const mailOptions = {
    to: email,
    subject: "Reset Your Password - Thug Slayers Messenger",
    html: createResetPasswordTemplate(resetOTP, name),
  };

  await sendEmailViaAPI(mailOptions);
};