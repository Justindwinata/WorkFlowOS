import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@config';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      // Refresh token is stored in httpOnly cookie; the client sends it via withCredentials
      const response = await this.client.post<{ accessToken: string }>('/auth/refresh');

      const { accessToken } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }
      return accessToken;
    })();

    try {
      return await this.refreshTokenPromise;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  async get<T>(url: string, params?: object, options?: { dedupe?: boolean }) {
    const key = JSON.stringify({ url, params });

    if (options?.dedupe !== false) {
      if (this.inflightGet.has(key)) {
        return this.inflightGet.get(key)!;
      }

      const promise = this.client.get<T>(url, { params }).then((r) => r.data).finally(() => {
        this.inflightGet.delete(key);
      });

      this.inflightGet.set(key, promise);
      return promise;
    }

    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: object) {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: object) {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: object) {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string) {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  private inflightGet = new Map<string, Promise<any>>();
}

export const apiClient = new ApiClient();
