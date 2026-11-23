/**
 * HTTP Client giao tiếp với Laravel MCP API
 */
import { config } from './config.js';
import type { ApiResponse } from './types.js';

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 200;

export class McpApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = config.apiUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Tạo headers chung cho request
   */
  private getHeaders(): Readonly<Record<string, string>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    return headers;
  }

  /**
   * Gọi fetch có timeout (AbortController) và retry nhẹ cho lỗi mạng/5xx.
   */
  private async fetchWithRetry(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeoutId);

        // Retry cho 5xx (server transient), không retry 4xx
        if (response.status >= 500 && response.status <= 599 && attempt < MAX_RETRIES - 1) {
          await this.delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        if (attempt < MAX_RETRIES - 1) {
          await this.delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Unknown network error');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Xử lý gọi API tổng quát
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>
  ): Promise<ApiResponse<T>> {
    let cleanEndpoint = endpoint.replace(/^\/+/, '');
    if (this.baseUrl.endsWith('/chatbot') && cleanEndpoint.startsWith('chatbot/')) {
      cleanEndpoint = cleanEndpoint.slice('chatbot/'.length);
    }
    let url = `${this.baseUrl}/${cleanEndpoint}`;

    if (queryParams) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    try {
      const response = await this.fetchWithRetry(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 204) {
        return {
          status: 'success',
          success: true,
          data: undefined as T,
        };
      }

      const text = await response.text();
      if (!text) {
        return {
          status: response.ok ? 'success' : 'error',
          success: response.ok,
          data: undefined as T,
        };
      }

      let json: ApiResponse<T>;
      try {
        json = JSON.parse(text) as ApiResponse<T>;
      } catch {
        throw new Error(
          `Phản hồi từ Laravel API không phải JSON hợp lệ (HTTP ${response.status}).`
        );
      }

      // Nếu backend trả lỗi HTTP, đánh dấu rõ ràng
      if (!response.ok && json.status !== 'error') {
        json = {
          ...json,
          status: 'error',
          success: false,
          message: json.message ?? `HTTP ${response.status}`,
        };
      }
      return json;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network error';
      // Chỉ trả message chung cho client, không leak toàn URL.
      // Chi tiết URL được log ra stderr cho debugging server-side.
      console.error(`[McpApiClient] Lỗi khi gọi ${this.safeUrlForLog(url)}: ${message}`);
      return {
        status: 'error',
        error_code: 'CLIENT_NETWORK_ERROR',
        message: 'Lỗi kết nối tới Laravel API',
      };
    }
  }

  /**
   * Trả URL đã loại bỏ query string để log an toàn (không leak tham số người dùng).
   */
  private safeUrlForLog(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return url.split('?')[0];
    }
  }

  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>) {
    return this.request<T>('GET', endpoint, undefined, queryParams);
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>
  ) {
    return this.request<T>('POST', endpoint, body, queryParams);
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>
  ) {
    return this.request<T>('PATCH', endpoint, body, queryParams);
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>
  ) {
    return this.request<T>('PUT', endpoint, body, queryParams);
  }

  delete<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | readonly (string | number)[] | undefined>) {
    return this.request<T>('DELETE', endpoint, undefined, queryParams);
  }
}

export const apiClient = new McpApiClient();
