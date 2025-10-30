import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // This creates an index automatically
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // OTP Verification Fields
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resendCount: {
      type: Number,
      default: 0,
    },
    cooldownExpires: Date,
    welcomeEmailSent: {
      type: Boolean,
      default: false,
    },
    // Password Reset Fields
    resetPasswordOTP: Number,
    resetPasswordOTPExpire: Date,
    resetPasswordResendCount: {
      type: Number,
      default: 0,
    },
    resetPasswordCooldownExpires: Date,
    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordVerifiedExpires: {
      type: Date,
    },
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate 5-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const verificationCode = Math.floor(10000 + Math.random() * 90000); // 5-digit code
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
  return verificationCode;
};

// Generate password reset OTP
userSchema.methods.generateResetOTP = function () {
  const resetOTP = Math.floor(10000 + Math.random() * 90000);
  this.resetPasswordOTP = resetOTP;
  this.resetPasswordOTPExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
  return resetOTP;
};

// Keep only the compound index for optimized query performance
userSchema.index({ accountVerified: 1, createdAt: 1 });

const User = mongoose.model("User", userSchema);

export default User;