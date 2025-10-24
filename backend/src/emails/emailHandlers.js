import transporter from "../lib/nodemailer.js";
import { 
  createVerificationTemplate, 
  createWelcomeEmailTemplate,
  createResetPasswordTemplate  // ADD THIS IMPORT
} from "./emailTemplates.js";
import { ENV } from "../lib/env.js";

export const sendVerificationEmail = async (email, name, verificationCode) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: "Verify Your Account - Thug Slayers Messenger",
      html: createVerificationTemplate(verificationCode, name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to Thug Slayers Messenger!",
      html: createWelcomeEmailTemplate(name, clientURL),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendResetPasswordEmail = async (email, name, resetOTP) => {
  try {
    const mailOptions = {
      from: `"${ENV.EMAIL_FROM_NAME}" <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: "Reset Your Password - Thug Slayers Messenger",
      html: createResetPasswordTemplate(resetOTP, name), // FIXED: Now using imported function
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }
};