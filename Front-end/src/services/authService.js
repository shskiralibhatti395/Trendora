import { apiFetch } from "./api.js";

export const authService = {
  login: (email, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),

  getMe: () => apiFetch("/api/auth/me"),

  updateProfile: (payload) =>
    apiFetch("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email) =>
    apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, otp, password) =>
    apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, password }),
    }),
};
