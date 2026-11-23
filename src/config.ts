/**
 * Cấu hình môi trường cho MCP Server
 *
 * MCP chatbot không yêu cầu xác thực API token, do chỉ cần cấu hình apiUrl.
 * Nếu thiếu url, ném lỗi rõ ràng tại khởi động (fail-fast).
 */
export interface AppConfig {
  readonly apiUrl: string;
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
  apiUrl: readEnv('TRUYEN_AUDIO_API_URL', 'https://truyenseo.com/chatbot'),
  serverName: 'truyen-audio-mcp',
  serverVersion: '1.2.2',
};

/**
 * Kiểm tra cấu hình bắt buộc khi khởi động MCP Server.
 * @throws Error nếu apiUrl không hợp lệ.
 */
export function validateConfig(): void {
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
