import { apiFetch } from "./api.js";

export const adminService = {
  getStats: () => apiFetch("/api/admin/stats"),
  getProducts: () => apiFetch("/api/admin/products"),
  createProduct: (payload) =>
    apiFetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProduct: (id, payload) =>
    apiFetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id) =>
    apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }),
  bulkDeleteProducts: (ids) =>
    apiFetch("/api/admin/products/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getOrders: () => apiFetch("/api/admin/orders"),
  updateOrderStatus: (id, status) =>
    apiFetch(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getUsers: () => apiFetch("/api/admin/users"),
  updateUserRole: (id, role) =>
    apiFetch(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  toggleBlockUser: (id) =>
    apiFetch(`/api/admin/users/${id}/block`, { method: "PUT" }),
};
