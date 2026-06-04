const API_BASE = "http://localhost:5000";
let token = null;

export function setToken(t) {
  token = t;
  localStorage.setItem("admin_token", t);
}

export function getToken() {
  if (!token) {
    token = localStorage.getItem("admin_token");
  }
  return token;
}

export function clearToken() {
  token = null;
  localStorage.removeItem("admin_token");
}

export async function apiFetch(path, options = {}) {
  const url = API_BASE + "/api" + path;

  const headers = {
    "Content-Type": "application/json",
  };

  const t = getToken();
  if (t) {
    headers["Authorization"] = "Bearer " + t;
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
