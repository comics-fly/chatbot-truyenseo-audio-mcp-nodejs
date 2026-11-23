/**
 * Bộ công cụ Chatbot - Gợi ý Nâng cao (Recommend)
 * Endpoint: /chatbot/recommend/*
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import { toMcpResult } from '../mcp-result.js';

export function registerRecommendTools(server: McpServer): void {
  // 1. Gợi ý theo độ dài
  server.tool(
    'recommend_by_length',
    'Gợi ý truyện theo độ dài: short (<=100 chương), medium (100-500), epic (>500).',
    {
      tier: z.enum(['short', 'medium', 'epic']).optional().describe('Phân loại độ dài (mặc định medium)'),
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/recommend/by-length', params);
    return toMcpResult(res);
    }
  );

  // 2. Gợi ý theo cảm xúc / mood
  server.tool(
    'recommend_by_mood',
    'Gợi ý truyện theo cảm xúc/trope: humor, chill, overpowered, tactical, action.',
    {
      mood: z.enum(['humor', 'chill', 'overpowered', 'tactical', 'action']).optional().describe('Cảm xúc/trope (mặc định chill)'),
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/recommend/by-mood', params);
    return toMcpResult(res);
    }
  );

  // 3. Gợi ý audio theo bối cảnh
  server.tool(
    'recommend_audio_picks',
    'Gợi ý truyện có audio chất lượng theo bối cảnh nghe: all, bedtime, commute, workout, full.',
    {
      context: z.enum(['all', 'bedtime', 'commute', 'workout', 'full']).optional().describe('Bối cảnh nghe (mặc định all)'),
      limit: z.number().int().min(1).max(50).optional().describe('Số lượng truyện (mặc định 10, tối đa 50)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo ID thể loại'),
      category_slug: z.string().max(100).optional().describe('Lọc theo slug thể loại'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Sparse fieldsets'),
    },
    async (params) => {
      const res = await apiClient.get('chatbot/recommend/audio-picks', params);
    return toMcpResult(res);
    }
  );
}