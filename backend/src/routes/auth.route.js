import express from 'express';
import { 
  signup, 
  login, 
  logout, 
  updateProfile, 
  verifyOTP, 
  resendOTP,
  forgotPassword,       // ADD
  verifyResetOTP,       // ADD
  resetPassword         // ADD
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection);

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