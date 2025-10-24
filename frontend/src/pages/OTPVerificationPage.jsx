import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LoaderIcon, ShieldIcon, RotateCcwIcon } from "lucide-react";

function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const { verifyOTP, resendOTP, isVerifyingOTP, isResendingOTP } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Get email from navigation state or redirect back
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

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

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && index === 4) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 5) {
      alert("Please enter the complete 5-digit code");
      return;
    }

    try {
      await verifyOTP({ email, otp: otpValue });
      // Navigation happens automatically after successful verification
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP({ email });
      setTimer(300); // Reset timer to 5 minutes
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <ShieldIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Verify Your Email</h2>
                  <p className="text-slate-400">Enter the 5-digit code sent to</p>
                  <p className="text-cyan-400 font-medium mt-1">{email}</p>
                </div>

                {/* OTP INPUTS */}
                <div className="space-y-6">
                  <div>
                    <label className="auth-input-label">Verification Code</label>
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
                          className="w-16 h-16 text-center text-2xl font-bold bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* TIMER AND RESEND */}
                  <div className="text-center space-y-4">
                    <div className="text-slate-400 text-sm">
                      {timer > 0 ? (
                        <p>Code expires in <span className="text-cyan-400 font-mono">{formatTime(timer)}</span></p>
                      ) : (
                        <p className="text-amber-400">Code has expired</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendingOTP || timer > 0}
                      className="auth-link inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcwIcon className="w-4 h-4" />
                      {isResendingOTP ? "Sending..." : "Resend Code"}
                    </button>
                  </div>

                  {/* VERIFY BUTTON */}
                  <button
                    onClick={() => handleVerifyOTP()}
                    disabled={isVerifyingOTP || otp.join("").length !== 5}
                    className="auth-btn flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOTP ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldIcon className="w-5 h-5" />
                        Verify Account
                      </>
                    )}
                  </button>
                </div>

                {/* BACK TO SIGNUP */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/signup")}
                    className="auth-link"
                  >
                    Wrong email? Go back
                  </button>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/otp-verification.png" // You can use your existing images or create a new one
                  alt="Email verification illustration"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Secure Verification</h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Secure</span>
                    <span className="auth-badge">Encrypted</span>
                    <span className="auth-badge">Private</span>
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

export default OTPVerificationPage;