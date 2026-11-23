/**
 * Bộ công cụ Chatbot - Tư vấn Tổng hợp & Danh mục
 * Endpoint: /chatbot/consult, /chatbot/categories
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';

export function registerConsultTools(server: McpServer): void {
  // 1. Tư vấn thông minh tổng hợp
  server.tool(
    'consult',
    'Endpoint tư vấn thông minh tổng hợp: gợi ý theo criteria hoặc tìm kiếm theo keyword.',
    {
      criteria: z
        .enum(['new_stories', 'new_chapters', 'top_likes', 'top_views', 'top_comments', 'completed', 'trending', 'recommend'])
        .optional()
        .describe('Tiêu chí tư vấn (mặc định recommend)'),
      intent: z.string().max(100).optional().describe('Nhãn ý định (tuỳ chọn, phục vụ logging/ngữ cảnh)'),
      limit: z.number().int().min(1).max(30).optional().describe('Số lượng gợi ý (mặc định 5, tối đa 30)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      keyword: z.string().max(200).optional().describe('Từ khóa tìm kiếm truyện để tư vấn'),
      has_audio: z.boolean().optional().describe('Chỉ gợi ý truyện có audio'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets cho items'),
    },
    async (params) => {
      const res = await apiClient.post('chatbot/consult', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Danh mục thể loại cho chatbot
  server.tool(
    'categories',
    'Lấy danh mục thể loại kèm số lượng truyện để chatbot hướng dẫn độc giả chọn thể loại.',
    {},
    async () => {
      const res = await apiClient.get('chatbot/categories');
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}