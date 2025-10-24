import { sendWelcomeEmail } from './emailHandlers.js';

// Test function
async function testEmail() {
  try {
    const result = await sendWelcomeEmail(
      'mohammedali5072008@gmail.com',
      'Ali Bot',
      'http://localhost:3000'
    );
    console.log('✅ Email test passed:', result);
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Uncomment to test
   testEmail();