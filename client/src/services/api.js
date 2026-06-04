const API_BASE = import.meta.env.VITE_API_URL || "";

let _token = null;

export function setToken(token) {
  _token = token;
}

export function clearToken() {
  _token = null;
}

export async function apiFetch(path, options = {}) {
  const finalPath = "/api/" + path.replace(/^\/?(api\/?)?/, "");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const response = await fetch(`${API_BASE}${finalPath}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
