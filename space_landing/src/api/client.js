/**
 * client.js — LỚP DUY NHẤT giao tiếp với backend FastAPI.
 *
 * Backend trả mọi response theo format chuẩn 6 trường:
 *   { statusCode, message, data, error, timestamp, path }
 * → mọi hàm ở đây đều trả về `data`, và ném ApiError (kèm message
 *   tiếng Việt từ backend) khi có lỗi. Component không phải tự parse.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "cosmic_library_token";

export class ApiError extends Error {
  constructor(message, statusCode, path) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.path = path;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Gọi 1 endpoint.
 * - json: object → gửi body JSON
 * - form: URLSearchParams → gửi body form-urlencoded (chuẩn OAuth2 login)
 * - auth=false: không gắn Authorization header (endpoint public)
 */
export async function apiRequest(path, { method = "GET", json, form, auth = true } = {}) {
  const headers = {};
  let body;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = form.toString();
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { method, headers, body });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Lỗi ${response.status}`;
    throw new ApiError(message, response.status, payload?.path);
  }

  return payload?.data;
}

/** Format ngày ISO từ backend (UTC) sang "dd/mm/yyyy HH:mm" giờ địa phương. */
export function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Format ngày ISO sang "dd/mm/yyyy". */
export function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Tập hợp tất cả endpoint của backend. */
export const api = {
  // ---------- Auth ----------
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", json: payload }),
  login: (username, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      form: new URLSearchParams({ username, password }),
      auth: false,
    }),
  getMe: () => apiRequest("/api/auth/me"),

  // ---------- Categories ----------
  getCategories: () => apiRequest("/api/categories", { auth: false }),
  createCategory: (payload) => apiRequest("/api/categories", { method: "POST", json: payload }),

  // ---------- Books ----------
  getBooks: ({ search = "", categoryId = "" } = {}) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (categoryId) query.set("category_id", categoryId);
    const qs = query.toString();
    return apiRequest(`/api/books${qs ? `?${qs}` : ""}`, { auth: false });
  },
  createBook: (payload) => apiRequest("/api/books", { method: "POST", json: payload }),
  updateBook: (bookId, payload) => apiRequest(`/api/books/${bookId}`, { method: "PUT", json: payload }),
  deleteBook: (bookId) => apiRequest(`/api/books/${bookId}`, { method: "DELETE" }),

  // ---------- Borrows ----------
  borrowBook: (bookId) => apiRequest("/api/borrows", { method: "POST", json: { book_id: bookId } }),
  returnBook: (recordId) => apiRequest(`/api/borrows/${recordId}/return`, { method: "POST" }),
  getMyBorrows: () => apiRequest("/api/borrows/my"),
};
