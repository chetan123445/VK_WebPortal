export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-65uw.onrender.com";

// Optional: helper for fetch requests
export function apiFetch(path, options = {}) {
  return fetch(`${BASE_API_URL}${path}`, options);
}
