// For production, use the deployed backend URL; for local dev, use localhost
const API_BASE = 
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.origin === 'https://trendora-pi.vercel.app'
    ? 'https://trendora-backend-ngio.onrender.com'
    : 'http://localhost:5000');

export async function apiFetch(path, options = {}) {
  // Ensure path starts with /api if it doesn't already
  const finalPath = path.startsWith('/api') ? path : `/api${path}`;
  
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

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
