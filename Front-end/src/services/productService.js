import { apiFetch } from "./api.js";

export const productService = {
  getProducts: (queryString = "") => apiFetch(`/api/products${queryString}`),
  getProductById: (id) => apiFetch(`/api/products/${id}`),
  addReview: (id, rating, comment) =>
    apiFetch(`/api/products/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
};
