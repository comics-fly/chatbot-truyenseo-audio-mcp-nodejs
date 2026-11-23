/**
 * Cấu hình môi trường cho MCP Server
 *
 * Token API được đọc từ env. Nếu thiếu, ném lỗi rõ ràng tại khởi động (fail-fast)
 * thay vì để request đi không xác thực silently.
 */
export interface AppConfig {
  readonly apiUrl: string;
  readonly apiToken: string;
  readonly serverName: string;
  readonly serverVersion: string;
}

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.trim() !== '') {
    return value.trim();
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return '';
}

export const config: AppConfig = {
  apiUrl: readEnv('TRUYEN_AUDIO_API_URL', 'http://localhost:8000/chatbot'),
  apiToken: readEnv('TRUYEN_AUDIO_API_TOKEN'),
  serverName: 'truyen-audio-mcp',
  serverVersion: '1.2.0',
};

/**
 * Kiểm tra cấu hình bắt buộc khi khởi động MCP Server.
 * @throws Error nếu thiếu token API hoặc apiUrl không hợp lệ.
 */
export function validateConfig(): void {
  if (!config.apiToken) {
    throw new Error(
      'TRUYEN_AUDIO_API_TOKEN không được để trống. Vui lòng cấu hình biến môi trường trước khi khởi động MCP Server.'
    );
  }
  if (!config.apiUrl) {
    throw new Error('TRUYEN_AUDIO_API_URL không được để trống.');
  }
  try {
    // eslint-disable-next-line no-new
    new URL(config.apiUrl);
  } catch {
    throw new Error(`TRUYEN_AUDIO_API_URL không hợp lệ: ${config.apiUrl}`);
  }
}
