export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "https://vk-webportal-b2t9.onrender.com/api";

// Optional: helper for fetch requests
export function apiFetch(path, options = {}) {
  return fetch(`${BASE_API_URL}${path}`, options);
}
