/**
 * Điểm khởi chạy chính của Truyen Audio Chatbot MCP Server
 */
import net from 'node:net';

// Tắt autoSelectFamily để tránh lỗi timeout/network unreachable trên môi trường IPv6 không định tuyến được
if (typeof net.setDefaultAutoSelectFamily === 'function') {
  net.setDefaultAutoSelectFamily(false);
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { apiClient } from './client.js';
import { config } from './config.js';
import { registerStoryTools } from './tools/story.tools.js';
import { registerChapterTools } from './tools/chapter.tools.js';
import { registerRecommendTools } from './tools/recommend.tools.js';
import { registerConsultTools } from './tools/consult.tools.js';
import { validateConfig } from './config.js';
import { toMcpResult } from './mcp-result.js';

// Khởi tạo máy chủ MCP
const server = new McpServer({
  name: config.serverName,
  version: config.serverVersion,
});

// Tool kiểm tra trạng thái và thông tin dịch vụ
server.tool(
  'mcp_info',
  'Kiểm tra kết nối và thông tin phiên bản của hệ thống Laravel MCP backend.',
  {},
  async () => {
    const res = await apiClient.get<{ status: string; service: string; version: string }>('info');
    return toMcpResult(res);
  }
);

// Đăng ký toàn bộ các nhóm công cụ chatbot
registerStoryTools(server);
registerChapterTools(server);
registerRecommendTools(server);
registerConsultTools(server);

// ponytail: stdio transport là chuẩn kết nối MCP cho AI agent cục bộ, nâng cấp SSE khi cần deploy remote
validateConfig();

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${config.serverName}] MCP Server đang chạy qua stdio...`);
}

main().catch((error) => {
  console.error(`[${config.serverName}] Khởi động thất bại:`, error);
  process.exit(1);
});
