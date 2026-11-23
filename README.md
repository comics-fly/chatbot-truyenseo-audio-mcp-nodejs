# Truyen Audio Chatbot MCP Server

MCP Server xây dựng bằng **Node.js** & **TypeScript**, cung cấp bộ công cụ (tools) cho AI Agent tư vấn và gợi ý truyện từ hệ thống **Truyện Audio** (kết nối backend [truyen-audio-laravel](../truyen-audio-laravel/) qua endpoint `/chatbot/*`).

---

## Tính Năng & Danh Sách Tools

Hệ thống cung cấp **16 MCP tools** (15 domain tools + 1 info tool), hỗ trợ tối ưu token cho AI Agent thông qua **Sparse Fieldsets (`fields`)**:

### 1. Truyện (Stories) — `story.tools.ts`
- `new_stories`: Lấy danh sách truyện mới xuất bản gần đây. Hỗ trợ lọc `category_id`, `category_slug`, `has_audio`, `limit` (1-50), `fields`.
- `stories_recently_updated`: Lấy danh sách truyện vừa có chương mới ra. Hỗ trợ `category_id`, `category_slug`, `limit`, `fields`.
- `stories_top_likes`: Top truyện được yêu thích (likes) nhiều nhất.
- `stories_top_views`: Top truyện có lượt xem cao nhất.
- `stories_top_comments`: Top truyện có nhiều bình luận sôi nổi nhất.
- `stories_completed`: Danh sách truyện đã hoàn thành trọn bộ (Full).
- `story_similar`: Tìm truyện tương tự với một truyện (theo thể loại, độ phổ biến). Tham số: `id` (ID hoặc slug), `limit`, `fields`.
- `story_context_card`: Lấy thẻ tóm tắt ngữ cảnh truyện (bối cảnh, tác giả, thống kê, pitch tư vấn). Tham số: `id`, `fields`.
- `story_release_pace`: Phân tích tần suất và lịch ra chương của truyện. Tham số: `id`, `fields`.

### 2. Chương (Chapters) — `chapter.tools.ts`
- `new_chapters`: Lấy danh sách chương mới phát hành gần đây (toàn hệ thống hoặc theo `story_id`). Hỗ trợ `has_audio`, `limit` (1-50), `fields`.

### 3. Gợi ý Nâng cao (Recommend) — `recommend.tools.ts`
- `recommend_by_length`: Gợi ý truyện theo độ dài `tier`: `short` (<=100 chương), `medium` (100-500), `epic` (>500). Hỗ trợ `category_id`, `category_slug`, `limit`, `fields`.
- `recommend_by_mood`: Gợi ý truyện theo cảm xúc/trope `mood`: `humor`, `chill`, `overpowered`, `tactical`, `action`.
- `recommend_audio_picks`: Gợi ý truyện có audio chất lượng theo bối cảnh `context`: `all`, `bedtime`, `commute`, `workout`, `full`.

### 4. Tư vấn Tổng hợp & Danh mục — `consult.tools.ts`
- `consult`: Endpoint tư vấn thông minh tổng hợp. Hỗ trợ `criteria` (`new_stories`, `new_chapters`, `top_likes`, `top_views`, `top_comments`, `completed`, `trending`, `recommend`), `keyword`, `intent`, `category_id`, `category_slug`, `has_audio`, `limit` (1-30), `fields`.
- `categories`: Lấy danh mục thể loại kèm số lượng truyện để chatbot hướng dẫn độc giả.

### 5. Hệ thống
- `mcp_info`: Kiểm tra trạng thái kết nối và phiên bản API backend Laravel.

---

## Cài Đặt & Build

### Yêu Cầu Môi Trường
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Cài Đặt Dependencies
```bash
npm install
```

### Chạy Kiểm Thử (Tests)
```bash
npm test
```

### Build Ra 1 File Duy Nhất (Single Bundle)
Đóng gói toàn bộ mã nguồn và dependencies thành 1 file độc lập với `esbuild`:
```bash
npm run build
```

Kết quả tạo ra đúng **1 file duy nhất** tại [dist/index.js](dist/index.js) (đã nhúng shebang `#!/usr/bin/env node` và sẵn sàng thực thi trực tiếp).

---

## Cấu Hình Kết Nối MCP

### 1. Biến Môi Trường (.env)
Tạo file `.env` từ [.env.example](.env.example):
```env
TRUYEN_AUDIO_API_URL=http://localhost:8000/mcp
TRUYEN_AUDIO_API_TOKEN=your_mcp_bearer_token_here
```

### 2. Cách 1: Sử dụng trực tiếp qua NPM với `npx` (Khuyên dùng)
Cấu hình client chạy trực tiếp mà **không cần clone mã nguồn hay khai báo đường dẫn file**:

#### Cấu hình Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "truyen-audio-chatbot": {
      "command": "npx",
      "args": [
        "-y",
        "truyen-audio-chatbot-mcp@latest"
      ],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

#### Cấu hình Claude Code (`.mcp.json`)
```json
{
  "mcpServers": {
    "truyen-audio-chatbot": {
      "command": "npx",
      "args": ["-y", "truyen-audio-chatbot-mcp@latest"],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

### 3. Cách 2: Chạy từ mã nguồn Local (Dành cho nhà phát triển)
Nếu bạn đang phát triển hoặc muốn chạy trực tiếp file bundle sau khi `npm run build`:

```json
{
  "mcpServers": {
    "truyen-audio-chatbot": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

---

## Cấu Trúc Mã Nguồn

```
├── src/
│   ├── index.ts                  # Điểm khởi chạy MCP Server & đăng ký công cụ
│   ├── config.ts                 # Quản lý biến môi trường và cấu hình
│   ├── types.ts                  # Định nghĩa Types & DTOs
│   ├── client.ts                 # HTTP Client gọi API Laravel
│   └── tools/
│       ├── story.tools.ts        # Công cụ tư vấn truyện (new/top/similar/context-card/release-pace)
│       ├── chapter.tools.ts      # Công cụ chương mới phát hành
│       ├── recommend.tools.ts    # Công cụ gợi ý theo độ dài/cảm xúc/audio
│       └── consult.tools.ts      # Công cụ tư vấn tổng hợp & danh mục
├── test/
│   └── chatbot-tools.test.ts     # Unit test tự động
├── dist/                         # Thư mục mã nguồn sau khi build
├── .env.example                  # Mẫu biến môi trường
├── package.json
└── tsconfig.json
```
