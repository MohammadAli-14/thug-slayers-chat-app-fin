import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LoaderIcon, ShieldIcon, RotateCcwIcon, LockIcon, CheckIcon, XIcon } from "lucide-react";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes
  const { 
    forgotPassword, 
    verifyResetOTP, 
    resetPassword, 
    isSendingResetOTP, 
    isVerifyingResetOTP, 
    isResettingPassword 
  } = useAuthStore();
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    let countdown;
    if (step === 2 && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdown);
  }, [step, timer]);

  // Validate passwords whenever they change
  useEffect(() => {
    if (step === 3) {
      validatePasswords();
    }
  }, [newPassword, confirmPassword, step]);

  const validatePasswords = () => {
    if (!newPassword && !confirmPassword) {
      setPasswordError("");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email });
      setStep(2);
      setTimer(300);
    } catch (error) {
      // Error handled in store
      console.error("Failed to send reset OTP:", error);
    }
  };

  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 5) {
      alert("Please enter the complete 5-digit code");
      return;
    }

    try {
      await verifyResetOTP({ email, otp: otpValue });
      setStep(3);
      setOtp(["", "", "", "", ""]);
    } catch (error) {
      console.error("Failed to verify reset OTP:", error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ email, password: newPassword });
      // Show success message and redirect to login
      setTimeout(() => {
        navigate("/login", { 
          replace: true,
          state: { message: "Password reset successfully! Please login with your new password." }
        });
      }, 1500);
    } catch (error) {
      console.error("Failed to reset password:", error);
    }
  };

  const handleResendOTP = async () => {
    try {
      await forgotPassword({ email });
      setTimer(300);
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, label: "" };
    
    let strength = 0;
    if (newPassword.length >= 6) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return { strength, label: labels[strength] };
  };

  const { strength, label } = getPasswordStrength();

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row h-full">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                
                {/* STEP 1: Enter Email */}
                {step === 1 && (
                  <>
                    <div className="text-center mb-8">
                      <ShieldIcon className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">Reset Your Password</h2>
                      <p className="text-slate-400">Enter your email to receive a reset code</p>
                    </div>

                    <form onSubmit={handleSendResetOTP} className="space-y-6">
                      <div>
                        <label className="auth-input-label">Email</label>
                        <div className="relative">
                          <MailIcon className="auth-input-icon" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="rajaali8383679@gmail.com"
                            required
                          />
                        </div>
                      </div>

                      <button 
                        className="auth-btn bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                        type="submit" 
                        disabled={isSendingResetOTP}
                      >
                        {isSendingResetOTP ? (
                          <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Send Reset Code"
                        )}
                      </button>
                    </form>
                  </>
                )}

                {/* STEP 2: Enter OTP */}
                {step === 2 && (
                  <>
                    <div className="text-center mb-8">
                      <ShieldIcon className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">Enter Reset Code</h2>
                      <p className="text-slate-400">Code sent to {email}</p>
                    </div>

                    <form onSubmit={handleVerifyResetOTP} className="space-y-6">
                      <div>
                        <label className="auth-input-label">Reset Code</label>
                        <div className="flex justify-between gap-3">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (inputRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              className="w-16 h-16 text-center text-2xl font-bold bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              autoFocus={index === 0}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center space-y-4">
                        <div className="text-slate-400 text-sm">
                          {timer > 0 ? (
                            <p>Code expires in <span className="text-amber-400 font-mono">{formatTime(timer)}</span></p>
                          ) : (
                            <p className="text-amber-400">Code has expired</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isSendingResetOTP || timer > 0}
                          className="auth-link inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 hover:text-amber-300"
                        >
                          <RotateCcwIcon className="w-4 h-4" />
                          {isSendingResetOTP ? "Sending..." : "Resend Code"}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingResetOTP || otp.join("").length !== 5}
                        className="auth-btn bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifyingResetOTP ? (
                          <>
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <ShieldIcon className="w-5 h-5" />
                            Verify Code
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}

                {/* STEP 3: New Password */}
                {step === 3 && (
                  <>
                    <div className="text-center mb-8">
                      <LockIcon className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">New Password</h2>
                      <p className="text-slate-400">Create your new secure password</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6">
                      {/* New Password Field */}
                      <div>
                        <label className="auth-input-label">New Password</label>
                        <div className="relative">
                          <LockIcon className="auth-input-icon" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`input ${newPassword && !passwordError ? 'border-green-500' : passwordError ? 'border-red-500' : ''}`}
                            placeholder="Enter new password"
                            required
                            minLength="6"
                          />
                          {newPassword && !passwordError && (
                            <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 size-5" />
                          )}
                          {passwordError && (
                            <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 size-5" />
                          )}
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400">Password strength:</span>
                              <span className={`text-xs font-medium ${
                                strength === 0 ? 'text-red-400' :
                                strength === 1 ? 'text-orange-400' :
                                strength === 2 ? 'text-yellow-400' :
                                strength === 3 ? 'text-lime-400' :
                                'text-green-400'
                              }`}>
                                {label}
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  strength === 0 ? 'bg-red-500 w-1/4' :
                                  strength === 1 ? 'bg-orange-500 w-2/4' :
                                  strength === 2 ? 'bg-yellow-500 w-3/4' :
                                  strength === 3 ? 'bg-lime-500 w-11/12' :
                                  'bg-green-500 w-full'
                                }`}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label className="auth-input-label">Confirm Password</label>
                        <div className="relative">
                          <LockIcon className="auth-input-icon" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`input ${confirmPassword && !passwordError ? 'border-green-500' : passwordError ? 'border-red-500' : ''}`}
                            placeholder="Confirm your password"
                            required
                            minLength="6"
                          />
                          {confirmPassword && !passwordError && (
                            <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 size-5" />
                          )}
                          {passwordError && (
                            <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 size-5" />
                          )}
                        </div>
                        
                        {/* Password Requirements */}
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-slate-400 mb-2">Password must contain:</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                            <span className={`text-xs ${newPassword.length >= 6 ? 'text-green-400' : 'text-slate-400'}`}>
                              At least 6 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                            <span className={`text-xs ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                              Passwords match
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {passwordError && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                          <p className="text-red-400 text-sm text-center">{passwordError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isResettingPassword || !!passwordError || newPassword.length < 6 || confirmPassword.length < 6}
                        className="auth-btn bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResettingPassword ? (
                          <>
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <LockIcon className="w-5 h-5" />
                            Reset Password
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}

                {/* Navigation Links */}
                <div className="mt-6 text-center space-y-2">
                  {step === 1 && (
                    <Link to="/login" className="auth-link block text-amber-400 hover:text-amber-300">
                      Back to Login
                    </Link>
                  )}
                  {(step === 2 || step === 3) && (
                    <button
                      onClick={() => {
                        setStep(step - 1);
                        setPasswordError(""); // Clear errors when going back
                      }}
                      className="auth-link text-amber-400 hover:text-amber-300"
                    >
                      Go Back
                    </button>
                  )}
                  <Link to="/signup" className="auth-link block text-cyan-400 hover:text-cyan-300">
                    Don't have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div className="text-center">
                <img
                  src="/forgot.png"
                  alt="Password reset illustration"
                  className="w-full h-auto object-contain max-h-64"
                />
                <div className="mt-6">
                  <h3 className="text-xl font-medium text-amber-400">Secure Password Reset</h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge bg-amber-500/20 text-amber-300">Secure</span>
                    <span className="auth-badge bg-amber-500/20 text-amber-300">Encrypted</span>
                    <span className="auth-badge bg-amber-500/20 text-amber-300">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;