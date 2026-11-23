/**
 * Kiểm tra tự động cho nhóm công cụ Chatbot tư vấn truyện (MCP Server).
 * Sử dụng node:test và node:assert.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStoryTools } from '../src/tools/story.tools.js';
import { registerChapterTools } from '../src/tools/chapter.tools.js';
import { registerRecommendTools } from '../src/tools/recommend.tools.js';
import { registerConsultTools } from '../src/tools/consult.tools.js';
import { config } from '../src/config.js';
import { McpApiClient } from '../src/client.js';

test('Cấu hình mặc định của MCP Server', () => {
  assert.equal(config.serverName, 'truyen-audio-mcp');
  assert.equal(config.serverVersion, '1.2.2');
  assert.ok(config.apiUrl.length > 0);
});

test('McpApiClient xử lý URL, array params và format lỗi kết nối chuẩn xác', async () => {
  const client = new McpApiClient('http://test-server.local:8000/chatbot/');
  const res = await client.get('chatbot/stories/new', {
    search: 'Tiên hiệp',
    page: 2,
    fields: ['id', 'title'],
  });

  assert.equal(res.status, 'error');
  assert.equal(res.error_code, 'CLIENT_NETWORK_ERROR');
  // Message chung không leak URL/tham số người dùng; chi tiết log ở server-side.
  assert.equal(res.message, 'Lỗi kết nối tới Laravel API');
});

test('Đăng ký đầy đủ 15 công cụ chatbot tư vấn truyện', () => {
  const server = new McpServer({
    name: 'test-server-chatbot',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const registeredToolNames = Object.keys(
    (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools || {}
  );

  const expectedTools = [
    'new_stories',
    'stories_recently_updated',
    'stories_top_likes',
    'stories_top_views',
    'stories_top_comments',
    'stories_completed',
    'story_similar',
    'story_context_card',
    'story_release_pace',
    'new_chapters',
    'recommend_by_length',
    'recommend_by_mood',
    'recommend_audio_picks',
    'consult',
    'categories',
  ];

  for (const name of expectedTools) {
    assert.ok(registeredToolNames.includes(name), `Thiếu tool chatbot: ${name}`);
  }

  assert.equal(registeredToolNames.length, 15, 'Phải đăng ký đúng 15 công cụ chatbot');
});

test('Validation schema của new_stories phản ánh rule của Laravel backend', () => {
  const server = new McpServer({
    name: 'test-server-chatbot-validation',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  // Tuỳ chọn không bắt buộc
  assert.equal(tools.new_stories.inputSchema.safeParse({}).success, true);
  // limit trong khoảng 1-50
  assert.equal(tools.new_stories.inputSchema.safeParse({ limit: 50 }).success, true);
  assert.equal(tools.new_stories.inputSchema.safeParse({ limit: 1 }).success, true);
  assert.equal(tools.new_stories.inputSchema.safeParse({ limit: 0 }).success, false, 'limit không được là 0');
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ limit: 51 }).success,
    false,
    'limit tối đa là 50'
  );
  // category_id phải số dương
  assert.equal(tools.new_stories.inputSchema.safeParse({ category_id: 1 }).success, true);
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ category_id: -1 }).success,
    false,
    'category_id phải dương'
  );
  // category_slug tối đa 100 ký tự
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ category_slug: 'tien-hiep' }).success,
    true
  );
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ category_slug: 'a'.repeat(101) }).success,
    false,
    'category_slug tối đa 100 ký tự'
  );
  // has_audio phải boolean
  assert.equal(tools.new_stories.inputSchema.safeParse({ has_audio: true }).success, true);
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ has_audio: 'yes' }).success,
    false,
    'has_audio phải kiểu boolean'
  );
  // fields hỗ trợ chuỗi hoặc mảng
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ fields: 'id,title' }).success,
    true
  );
  assert.equal(
    tools.new_stories.inputSchema.safeParse({ fields: ['id', 'title'] }).success,
    true
  );
});

test('Validation schema của story_similar và story_context_card', () => {
  const server = new McpServer({
    name: 'test-server-chatbot-similar',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  // id chấp nhận số hoặc slug (string)
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: 42 }).success,
    true
  );
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: 'dau-la-dai-luc' }).success,
    true
  );
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: 0 }).success,
    false,
    'id số phải dương'
  );
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: '' }).success,
    false,
    'id slug không được rỗng'
  );
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: 1, limit: 50 }).success,
    true
  );
  assert.equal(
    tools.story_similar.inputSchema.safeParse({ id: 1, limit: 51 }).success,
    false,
    'limit tối đa 50'
  );

  // context-card không bắt buộc limit, chỉ id
  assert.equal(
    tools.story_context_card.inputSchema.safeParse({ id: 10 }).success,
    true
  );
  assert.equal(
    tools.story_context_card.inputSchema.safeParse({ id: 'tien-hiep' }).success,
    true
  );
  assert.equal(
    tools.story_context_card.inputSchema.safeParse({ id: 0 }).success,
    false,
    'context-card id phải dương'
  );
});

test('Validation schema của recommend_by_length / by_mood / audio_picks', () => {
  const server = new McpServer({
    name: 'test-server-chatbot-recommend',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  // by-length: tier phải short/medium/epic
  assert.equal(
    tools.recommend_by_length.inputSchema.safeParse({ tier: 'short' }).success,
    true
  );
  assert.equal(
    tools.recommend_by_length.inputSchema.safeParse({ tier: 'epic' }).success,
    true
  );
  assert.equal(
    tools.recommend_by_length.inputSchema.safeParse({ tier: 'long' }).success,
    false,
    'tier phải thuộc enum short|medium|epic'
  );

  // by-mood: mood phải thuộc enum
  assert.equal(
    tools.recommend_by_mood.inputSchema.safeParse({ mood: 'humor' }).success,
    true
  );
  assert.equal(
    tools.recommend_by_mood.inputSchema.safeParse({ mood: 'angry' }).success,
    false,
    'mood phải thuộc enum'
  );

  // audio-picks: context phải all/bedtime/commute/workout/full
  assert.equal(
    tools.recommend_audio_picks.inputSchema.safeParse({ context: 'bedtime' }).success,
    true
  );
  assert.equal(
    tools.recommend_audio_picks.inputSchema.safeParse({ context: 'full' }).success,
    true
  );
  assert.equal(
    tools.recommend_audio_picks.inputSchema.safeParse({ context: 'night' }).success,
    false,
    'context phải thuộc enum all|bedtime|commute|workout|full'
  );
});

test('Validation schema của consult', () => {
  const server = new McpServer({
    name: 'test-server-chatbot-consult',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  assert.equal(tools.consult.inputSchema.safeParse({}).success, true);
  assert.equal(
    tools.consult.inputSchema.safeParse({ criteria: 'new_stories' }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ criteria: 'completed' }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ criteria: 'invalid' }).success,
    false,
    'criteria phải thuộc enum'
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ intent: 'tin-moi' }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ limit: 30 }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ limit: 31 }).success,
    false,
    'limit tối đa 30'
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ limit: 0 }).success,
    false,
    'limit phải >= 1'
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ keyword: 'tien hiep' }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ keyword: 'a'.repeat(201) }).success,
    false,
    'keyword tối đa 200 ký tự'
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ has_audio: true }).success,
    true
  );
  assert.equal(
    tools.consult.inputSchema.safeParse({ has_audio: '1' }).success,
    false,
    'has_audio phải kiểu boolean'
  );
});

test('categories không có tham số đầu vào', () => {
  const server = new McpServer({
    name: 'test-server-chatbot-categories',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerRecommendTools(server);
  registerConsultTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  assert.equal(
    tools.categories.inputSchema.safeParse({}).success,
    true,
    'categories không yêu cầu tham số'
  );
});
