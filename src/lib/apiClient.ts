const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5146/api";

import { ENDPOINTS } from './endpoints';

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

// Queue for holding requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const apiClient = async (
  endpoint: string,
  options: FetchOptions = {},
  isRetry = false
): Promise<Response> => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
      }
      if (options.body && typeof options.body === 'object') {
          options.body = JSON.stringify(options.body);
      }
  }

  // Inject Access Token
  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Only intercept 401 if it's not the refresh endpoint itself and not a retry
    if (response.status === 401 && !url.includes("/refresh-token") && !isRetry) {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        // No refresh token, force logout
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:logout"));
        return response;
      }

      if (isRefreshing) {
        // If already refreshing, queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            // New token arrived, retry original request
            headers.set("Authorization", `Bearer ${newToken}`);
            return fetch(url, { ...fetchOptions, headers });
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshRes = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success) {
          const newAccessToken = refreshData.data.token;
          const newRefreshToken = refreshData.data.refreshToken;
          
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
             localStorage.setItem("refreshToken", newRefreshToken);
          }

          processQueue(null, newAccessToken);
          
          // Retry original request
          headers.set("Authorization", `Bearer ${newAccessToken}`);
          return fetch(url, { ...fetchOptions, headers });
        } else {
          // Refresh failed (expired or invalid), force logout
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
  } catch (error) {
    throw error;
  }
};
