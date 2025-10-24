export function createVerificationTemplate(verificationCode, name) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Account</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0f172a; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e293b; border-radius:16px; overflow:hidden; border: 1px solid #334155;">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 40px 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Verify Your Account</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0; font-size: 16px;">Thug Slayers Messenger</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #cbd5e1; font-size: 16px; margin: 0 0 20px;">Hello <strong style="color: #06b6d4;">${name}</strong>,</p>
                <p style="color: #cbd5e1; font-size: 16px; margin: 0 0 30px;">
                  Thank you for joining Thug Slayers Messenger! Use the verification code below to complete your registration:
                </p>

                <!-- OTP Display -->
                <div style="text-align: center; margin: 40px 0;">
                  <div style="display: inline-block; padding: 20px 30px; background: #0f172a; border: 2px dashed #06b6d4; border-radius: 12px;">
                    <div style="font-size: 42px; font-weight: bold; color: #06b6d4; letter-spacing: 8px; font-family: monospace;">
                      ${verificationCode}
                    </div>
                  </div>
                </div>

                <!-- Instructions -->
                <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
                  This code will expire in <strong style="color: #f59e0b;">5 minutes</strong>.
                  If you didn't request this, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background: #0f172a; padding: 30px 40px; border-top: 1px solid #334155;">
                <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Thug Slayers Messenger. All rights reserved.
                </p>
                <p style="color: #64748b; font-size: 12px; text-align: center; margin: 8px 0 0;">
                  Secure messaging for the modern era
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Thug Slayers Messenger</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a;">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 600;">Welcome to Thug Slayers Messenger!</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0; font-size: 18px;">Secure, real-time messaging</p>
    </div>
    
    <div style="background-color: #1e293b; padding: 40px; border-radius: 0 0 16px 16px; border: 1px solid #334155;">
      <p style="font-size: 18px; color: #06b6d4;"><strong>Hello ${name},</strong></p>
      <p style="color: #cbd5e1;">We're excited to have you join our secure messaging platform! Thug Slayers Messenger connects you with friends in real-time with end-to-end encryption and advanced features.</p>
      
      <div style="background-color: #0f172a; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #06b6d4;">
        <p style="font-size: 16px; margin: 0 0 15px 0; color: #06b6d4;"><strong>Get started with these features:</strong></p>
        <ul style="padding-left: 20px; margin: 0; color: #cbd5e1;">
          <li style="margin-bottom: 10px;">Real-time messaging with friends</li>
          <li style="margin-bottom: 10px;">Secure end-to-end encryption</li>
          <li style="margin-bottom: 10px;">Image and file sharing</li>
          <li style="margin-bottom: 0;">Online status and typing indicators</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${clientURL}" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 500; display: inline-block; font-size: 16px;">Open Messenger</a>
      </div>
      
      <p style="margin-bottom: 5px; color: #94a3b8;">If you need any help or have questions, our support team is always here to assist you.</p>
      <p style="margin-top: 0; color: #94a3b8;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0; color: #64748b;">Best regards,<br>The Thug Slayers Messenger Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Thug Slayers Messenger. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
}

export function createResetPasswordTemplate(resetOTP, name) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0f172a; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e293b; border-radius:16px; overflow:hidden; border: 1px solid #334155;">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Reset Your Password</h1>
                <p style="color: #fef3c7; margin: 10px 0 0; font-size: 16px;">Thug Slayers Messenger</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #cbd5e1; font-size: 16px; margin: 0 0 20px;">Hello <strong style="color: #f59e0b;">${name}</strong>,</p>
                <p style="color: #cbd5e1; font-size: 16px; margin: 0 0 30px;">
                  You requested to reset your password. Use the reset code below to proceed:
                </p>

                <!-- OTP Display -->
                <div style="text-align: center; margin: 40px 0;">
                  <div style="display: inline-block; padding: 20px 30px; background: #0f172a; border: 2px dashed #f59e0b; border-radius: 12px;">
                    <div style="font-size: 42px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: monospace;">
                      ${resetOTP}
                    </div>
                  </div>
                </div>

                <!-- Instructions -->
                <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
                  This code will expire in <strong style="color: #f59e0b;">5 minutes</strong>.
                  If you didn't request this, please ignore this email.
                </p>

                <!-- Security Notice -->
                <div style="background: #7c2d12; border: 1px solid #9a3412; border-radius: 8px; padding: 16px; margin-top: 30px;">
                  <p style="color: #fed7aa; font-size: 14px; margin: 0; text-align: center;">
                    <strong>Security Tip:</strong> Never share this code with anyone.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background: #0f172a; padding: 30px 40px; border-top: 1px solid #334155;">
                <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Thug Slayers Messenger. All rights reserved.
                </p>
                <p style="color: #64748b; font-size: 12px; text-align: center; margin: 8px 0 0;">
                  Secure messaging for the modern era
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}