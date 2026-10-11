// Normalize axios/fetch errors into user-friendly messages.

export class ApiError extends Error {
  constructor(message, { status, code, detail } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export function isAxiosError(err) {
  return !!err && typeof err === "object" && "isAxiosError" in err;
}

export function getApiErrorMessage(err, fallback = "Something went wrong") {
  if (!err) return fallback;

  // Our own thrown error
  if (err instanceof ApiError) return err.message || fallback;

  // Axios error
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (Array.isArray(data.detail) && data.detail.length) return fallback;
    }

    if (status === 401) return "You are not authorized. Please login and try again.";
    if (status === 403) return "Access denied.";
    if (status === 404) return "Not found.";
    if (status >= 500) return "Server error. Please try again later.";

    return err.message || fallback;
  }

  // Fetch error / generic JS error
  if (typeof err.message === "string" && err.message.trim()) return err.message;

  return fallback;
}

export function getStatus(err) {
  if (!err) return undefined;
  if (err instanceof ApiError) return err.status;
  if (isAxiosError(err)) return err.response?.status;
  return undefined;
}

