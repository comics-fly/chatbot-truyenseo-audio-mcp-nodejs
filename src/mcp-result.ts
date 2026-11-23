/**
 * Helper chuyển kết quả ApiResponse sang định dạng trả về của MCP tool.
 * Giảm thiểu duplicate code trong các tool handler.
 */
import type { ApiResponse } from './types.js';

/**
 * @param res Kết quả gọi API Laravel.
 * @returns Object content tương ứng chuẩn MCP `CallToolResult`.
 */
export function toMcpResult<T>(res: ApiResponse<T>): { content: [{ type: 'text'; text: string }] } {
  return {
    content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
  };
}
