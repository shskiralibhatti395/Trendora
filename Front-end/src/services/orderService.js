import { apiFetch } from "./api.js";

export const orderService = {
  getOrders: () => apiFetch("/api/orders"),
  requestOtp: (payload) =>
    apiFetch("/api/orders/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  placeOrder: (payload) =>
    apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
