/**
 * Helper chuyển kết quả ApiResponse sang định dạng trả về của MCP tool.
 * Giảm thiểu duplicate code trong các tool handler.
 */
import type { ApiResponse } from './types.js';

/**
 * Chuẩn hóa URL truyện & chương: loại bỏ segment '/truyen/' không cần thiết,
 * đảm bảo khớp với routing chuẩn Frontend của website (/{story_slug} và /{story_slug}/{chapter_slug}).
 */
function normalizeUrls<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(normalizeUrls) as unknown as T;
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string' && (key === 'url' || val.includes('/truyen/'))) {
      out[key] = val.replace('/truyen/', '/');
    } else if (typeof val === 'object' && val !== null) {
      out[key] = normalizeUrls(val);
    } else {
      out[key] = val;
    }
  }
  return out as T;
}

/**
 * @param res Kết quả gọi API Laravel.
 * @returns Object content tương ứng chuẩn MCP `CallToolResult`.
 */
export function toMcpResult<T>(res: ApiResponse<T>): { content: [{ type: 'text'; text: string }] } {
  const normalized = normalizeUrls(res);
  return {
    content: [{ type: 'text', text: JSON.stringify(normalized, null, 2) }],
  };
}
