import axios, { type AxiosError } from "axios";
import type { ApiErrorBody, AuthResponse, PostDTO, ReminderDTO } from "./types";

const TOKEN_KEY = "buzzit_access_token";
const SESSION_KEY = "buzzit_session";

export interface SessionInfo {
  username: string;
  role: string;
}

const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { "Content-Type": "application/json" },
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredSession(): SessionInfo | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionInfo;
  } catch {
    return null;
  }
}

export function persistAuth(token: string, session: SessionInfo): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function applyAuthHeader(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    const status = err.response?.status;
    if (status === 401) {
      clearAuth();
      applyAuthHeader(null);
      if (!window.location.pathname.startsWith("/login") && window.location.pathname !== "/register") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

async function unwrap<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw new Error(formatError(e as AxiosError<ApiErrorBody>));
  }
}

function formatError(e: AxiosError<ApiErrorBody>): string {
  const body = e.response?.data;
  if (body && typeof body === "object") {
    if (body.details?.length) {
      return body.details.map((d) => `${d.field}: ${d.message}`).join("; ");
    }
    if (typeof body.error === "string") {
      return body.error;
    }
  }
  return e.message || "Request failed";
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/api/auth/register", { username, email, password });
    return data;
  } catch (e) {
    throw new Error(formatError(e as AxiosError<ApiErrorBody>));
  }
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/api/auth/login", { username, password });
    return data;
  } catch (e) {
    throw new Error(formatError(e as AxiosError<ApiErrorBody>));
  }
}

export async function fetchPosts(): Promise<PostDTO[]> {
  return unwrap(() => api.get<PostDTO[]>("/api/post").then((r) => r.data));
}

export async function fetchPost(id: string): Promise<PostDTO> {
  return unwrap(() => api.get<PostDTO>(`/api/post/${id}`).then((r) => r.data));
}

export async function createPost(body: Record<string, unknown>): Promise<PostDTO> {
  return unwrap(() => api.post<PostDTO>("/api/post", body).then((r) => r.data));
}

export async function updatePost(id: string, body: Record<string, unknown>): Promise<PostDTO> {
  return unwrap(() => api.put<PostDTO>(`/api/post/${id}`, body).then((r) => r.data));
}

export async function deletePost(id: string): Promise<void> {
  return unwrap(() => api.delete(`/api/post/${id}`).then(() => undefined));
}

export async function markPostComplete(id: string): Promise<PostDTO | null> {
  return unwrap(async () => {
    const res = await api.patch<PostDTO>(`/api/post/${id}/mark-complete`, {}, {
      validateStatus: (s) => s === 200 || s === 204,
    });
    if (res.status === 204) return null;
    return res.data;
  });
}

export async function fetchReminders(params: Record<string, string | undefined>): Promise<ReminderDTO[]> {
  return unwrap(() =>
    api.get<ReminderDTO[]>("/api/reminders", { params }).then((r) => r.data)
  );
}

export async function fetchReminder(id: string): Promise<ReminderDTO> {
  return unwrap(() => api.get<ReminderDTO>(`/api/reminders/${id}`).then((r) => r.data));
}

export async function createReminder(body: Record<string, unknown>): Promise<ReminderDTO> {
  return unwrap(() => api.post<ReminderDTO>("/api/reminders", body).then((r) => r.data));
}

export async function updateReminder(id: string, body: Record<string, unknown>): Promise<ReminderDTO> {
  return unwrap(() => api.put<ReminderDTO>(`/api/reminders/${id}`, body).then((r) => r.data));
}

export async function deleteReminder(id: string): Promise<void> {
  return unwrap(() => api.delete(`/api/reminders/${id}`).then(() => undefined));
}

export async function markReminderDone(id: string): Promise<ReminderDTO | null> {
  return unwrap(async () => {
    const res = await api.patch<ReminderDTO>(`/api/reminders/${id}/mark-done`, {}, {
      validateStatus: (s) => s === 200 || s === 204,
    });
    if (res.status === 204) return null;
    return res.data;
  });
}
