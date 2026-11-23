/**
 * Bộ công cụ Chatbot - Quản lý Truyện (Stories)
 * Endpoint: /chatbot/stories/*
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';

export function registerStoryTools(server: McpServer): void {
  // 1. Truyện mới ra mắt
  server.tool(
    'new_stories',
    'Lấy danh sách truyện mới xuất bản gần đây để chatbot gợi ý độc giả.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      has_audio: z.boolean().optional().describe('Chỉ lấy truyện có audio'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets, ví dụ "id,title,url,advice_pitch"'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/new', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Truyện vừa có chương mới
  server.tool(
    'stories_recently_updated',
    'Lấy danh sách truyện vừa có chương mới ra để chatbot thông báo cập nhật.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/recently-updated', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Top truyện nhiều lượt thích
  server.tool(
    'stories_top_likes',
    'Lấy danh sách truyện được yêu thích (likes) nhiều nhất để chatbot tư vấn.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/top-likes', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Top truyện nhiều lượt xem
  server.tool(
    'stories_top_views',
    'Lấy danh sách truyện có lượt xem cao nhất để chatbot tư vấn.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/top-views', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Top truyện nhiều bình luận
  server.tool(
    'stories_top_comments',
    'Lấy danh sách truyện có nhiều bình luận sôi nổi nhất để chatbot tư vấn.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/top-comments', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Truyện đã hoàn thành
  server.tool(
    'stories_completed',
    'Lấy danh sách truyện đã hoàn thành trọn bộ (Full) để chatbot gợi ý.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/stories/completed', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Truyện tương tự
  server.tool(
    'story_similar',
    'Tìm các truyện tương tự với một truyện đang xem (theo thể loại và độ phổ biến).',
    {
      id: z.union([z.number().int().positive(), z.string().min(1)]).describe('ID hoặc slug của truyện gốc'),
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng gợi ý (mặc định 5, tối đa 50)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get(`chatbot/stories/${id}/similar`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 8. Thẻ ngữ cảnh truyện
  server.tool(
    'story_context_card',
    'Lấy thẻ tóm tắt ngữ cảnh truyện (bối cảnh, tác giả, thống kê, pitch tư vấn) cho chatbot.',
    {
      id: z.union([z.number().int().positive(), z.string().min(1)]).describe('ID hoặc slug của truyện'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get(`chatbot/stories/${id}/context-card`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 9. Tần suất ra chương
  server.tool(
    'story_release_pace',
    'Phân tích tần suất và lịch ra chương của truyện để chatbot trả lời độc giả.',
    {
      id: z.union([z.number().int().positive(), z.string().min(1)]).describe('ID hoặc slug của truyện'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get(`chatbot/stories/${id}/release-pace`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}