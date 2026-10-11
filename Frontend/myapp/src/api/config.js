// Central place to configure backend API base URL.
// Supports Vite env override via VITE_API_BASE_URL.

const DEFAULT_API_BASE_URL = "https://backend-teal-chi-88.vercel.app";

export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export function apiUrl(path = "") {
  const p = String(path);
  if (!p) return API_BASE_URL;
  return `${API_BASE_URL}/${p.replace(/^\/+/, "")}`;
}

