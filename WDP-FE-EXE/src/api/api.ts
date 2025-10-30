const BASE_URL = import.meta.env?.VITE_API_BASE_URL || ""; // empty => same-origin

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    // attempt to parse text; backend might return HTML on 404
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}
