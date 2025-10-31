// emails/emailHandlers.js
import transporter from '../lib/sendgrid.js'; // Import the new SendGrid transporter
import { 
  createVerificationTemplate, 
  createWelcomeEmailTemplate,
  createResetPasswordTemplate
} from "./emailTemplates.js";
import { ENV } from "../lib/env.js";

export const sendVerificationEmail = async (email, name, verificationCode) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`, // Use your verified sender address
      to: email,
      subject: "Verify Your Account - Thug Slayers Messenger",
      html: createVerificationTemplate(verificationCode, name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent via SendGrid:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending email with SendGrid:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`, // Use your verified sender address
      to: email,
      subject: "Welcome to Thug Slayers Messenger!",
      html: createWelcomeEmailTemplate(name, clientURL),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent via SendGrid:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending email with SendGrid:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendResetPasswordEmail = async (email, name, resetOTP) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`, // Use your verified sender address
      to: email,
      subject: "Reset Your Password - Thug Slayers Messenger",
      html: createResetPasswordTemplate(resetOTP, name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset password email sent via SendGrid:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending email with SendGrid:", error);
    throw new Error("Failed to send reset password email");
  }
};