import { ENDPOINTS } from './endpoints';
import type { ApiEnvelope } from '../types/api/common';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5146/api";

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: object | FormData | string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Queue for holding requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/** Low-level fetch wrapper — returns raw Response with token refresh logic. */
export const apiClient = async (
  endpoint: string,
  options: FetchOptions = {},
  isRetry = false
): Promise<Response> => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (options.body && typeof options.body === 'object') {
      options = { ...options, body: JSON.stringify(options.body) };
    }
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = { ...options, headers, body: options.body as BodyInit | null };

  const response = await fetch(url, fetchOptions);

  if (response.status === 401 && !url.includes("/refresh-token") && !isRetry) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:logout"));
      return response;
    }

    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            resolve(fetch(url, { ...fetchOptions, headers }));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshRes.json();

      if (refreshRes.ok && refreshData.success) {
        const newAccessToken: string = refreshData.data.token;
        const newRefreshToken: string | undefined = refreshData.data.refreshToken;

        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, newAccessToken);
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        return fetch(url, { ...fetchOptions, headers });
      } else {
        processQueue(new Error("Refresh failed"));
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth:logout"));
        return response;
      }
    } catch (err) {
      processQueue(err);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("auth:logout"));
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

/**
 * Typed wrapper around apiClient.
 * Parses the { success, data } envelope and returns data directly.
 * Throws ApiError for non-2xx or success=false responses.
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> => {
  const response = await apiClient(endpoint, options);

  // 204 No Content — body boş, başarı olarak kabul et
  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }
    return undefined as T;
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new ApiError(
      `Sunucudan geçersiz yanıt (status ${response.status})`,
      response.status,
    );
  }

  if (!response.ok || !envelope.success) {
    const message =
      envelope.error?.message ??
      envelope.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, envelope);
  }

  return envelope.data;
};
