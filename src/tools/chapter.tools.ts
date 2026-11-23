/**
 * Bộ công cụ Chatbot - Quản lý Chương (Chapters)
 * Endpoint: /chatbot/chapters/*
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';

export function registerChapterTools(server: McpServer): void {
  // 1. Chapter mới ra
  server.tool(
    'new_chapters',
    'Lấy danh sách chương mới phát hành gần đây trên toàn hệ thống hoặc theo truyện.',
    {
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng chương (mặc định 10, tối đa 50)'),
      story_id: z.number().int().positive().optional().describe('Lọc theo ID truyện'),
      has_audio: z.boolean().optional().describe('Chỉ lấy chương có audio'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/chapters/new', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}