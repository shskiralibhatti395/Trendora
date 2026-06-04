import { apiFetch } from "./api.js";

export const cartService = {
  getCart: () => apiFetch("/api/cart"),
  saveCart: (cart) =>
    apiFetch("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ cart }),
    }),
  getWishlist: () => apiFetch("/api/wishlist"),
  saveWishlist: (wishlist) =>
    apiFetch("/api/wishlist", {
      method: "PUT",
      body: JSON.stringify({ wishlist }),
    }),
};
