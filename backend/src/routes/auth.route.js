import express from 'express';
import { 
  signup, 
  login, 
  logout, 
  updateProfile, 
  verifyOTP, 
  resendOTP,
  forgotPassword,       
  verifyResetOTP,       
  resetPassword         
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js'; // ADD THIS

const router = express.Router();

// Use Arcjet if available, otherwise use simple rate limit
if (process.env.ARCJET_KEY && process.env.ARCJET_KEY !== "your_arcjet_key_here") {
  router.use(arcjetProtection);
} else {
  router.use(simpleRateLimit);
}

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

// OTP routes
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;