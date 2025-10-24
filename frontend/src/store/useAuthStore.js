import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingOTP: false,
  isResendingOTP: false,
  socket: null,
  onlineUsers: [],
  isSendingResetOTP: false,
  isVerifyingResetOTP: false,
  isResettingPassword: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      toast.success("Verification code sent to your email!");
      
      // Return the email for navigation
      return { email: data.email, success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOTP: async (data) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ authUser: res.data });
      
      toast.success("Account verified successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      throw error;
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  resendOTP: async (data) => {
    set({ isResendingOTP: true });
    try {
      await axiosInstance.post("/auth/resend-otp", data);
      toast.success("New verification code sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
      throw error;
    } finally {
      set({ isResendingOTP: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  // Password Reset Functions - FIXED IMPLEMENTATION
  forgotPassword: async (data) => {
    set({ isSendingResetOTP: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      toast.success(res.data.message || "Reset code sent to your email");
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send reset code";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isSendingResetOTP: false });
    }
  },

  verifyResetOTP: async (data) => {
    set({ isVerifyingResetOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-reset-otp", data);
      toast.success("Reset code verified successfully");
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to verify reset code";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isVerifyingResetOTP: false });
    }
  },

  resetPassword: async (data) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", data);
      toast.success("Password reset successfully");
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isResettingPassword: false });
    }
  },
}));