/**
 * Định nghĩa các kiểu dữ liệu cho dự án Truyen Audio Chatbot MCP
 */

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly hint?: string;
  readonly allowed_values?: readonly string[];
}

export interface ApiResponse<T> {
  readonly success?: boolean;
  readonly status?: 'success' | 'error';
  readonly data?: T;
  readonly error?: ApiError | null;
  readonly error_code?: string;
  readonly message?: string;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly current_page?: number;
  readonly page?: number;
  readonly last_page?: number;
  readonly per_page: number;
  readonly total: number;
  readonly has_more?: boolean;
}

export interface TextStats {
  readonly words: number;
  readonly characters: number;
  readonly sentences: number;
}

export type TextMode = 'full' | 'minimal' | 'none';
export type FieldsParam = string | readonly string[];

// -------------------------------------------------------------
// Chatbot Types (Tư vấn Truyện cho AI Agent)
// -------------------------------------------------------------
export type ChatbotStoryCriteria =
  | 'new_stories'
  | 'top_likes'
  | 'top_views'
  | 'top_comments'
  | 'completed'
  | 'stories_with_new_chapters'
  | 'trending'
  | 'recommend';

export type ChatbotStoryTier = 'short' | 'medium' | 'epic';
export type ChatbotMood = 'humor' | 'chill' | 'overpowered' | 'tactical' | 'action';
export type ChatbotAudioContext = 'all' | 'bedtime' | 'commute' | 'workout' | 'full';

export interface ChatbotStoryQueryParams {
  readonly limit?: number;
  readonly category_id?: number;
  readonly category_slug?: string;
  readonly has_audio?: boolean;
  readonly status?: 'ongoing' | 'completed' | 'paused';
  readonly tier?: ChatbotStoryTier;
  readonly mood?: ChatbotMood;
  readonly context?: ChatbotAudioContext;
  readonly fields?: FieldsParam;
}

export interface ChatbotChapterQueryParams {
  readonly limit?: number;
  readonly story_id?: number;
  readonly has_audio?: boolean;
  readonly fields?: FieldsParam;
}

export interface ChatbotConsultParams {
  readonly criteria?: ChatbotStoryCriteria;
  readonly intent?: string;
  readonly limit?: number;
  readonly category_id?: number;
  readonly category_slug?: string;
  readonly keyword?: string;
  readonly has_audio?: boolean;
  readonly fields?: FieldsParam;
}

export interface ChatbotCategoryItem {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly stories_count: number;
}

export interface ChatbotAdviceResponse {
  readonly intent: string;
  readonly headline: string;
  readonly explanation: string;
  readonly follow_up_questions?: readonly string[];
  readonly items?: readonly ChatbotStorySummary[];
}

export interface ChatbotStorySummary {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly status: string;
  readonly author: string;
  readonly cover_image?: string | null;
  readonly categories: readonly string[];
  readonly stats: {
    readonly views: number;
    readonly likes: number;
    readonly comments_count: number;
    readonly chapters_count: number;
  };
  readonly views: number;
  readonly likes: number;
  readonly comments_count: number;
  readonly chapters_count: number;
  readonly is_featured: boolean;
  readonly description?: string | null;
  readonly url: string;
  readonly advice_pitch: string;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ChatbotContextCard {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly status: string;
  readonly author: string;
  readonly cover_image?: string | null;
  readonly categories: readonly string[];
  readonly summary: string;
  readonly stats: {
    readonly views: number;
    readonly likes: number;
    readonly comments_count: number;
    readonly total_chapters: number;
    readonly has_audio: boolean;
  };
  readonly advice_pitch: string;
  readonly url: string;
}

export interface ChatbotReleasePace {
  readonly story_id: number;
  readonly story_title: string;
  readonly status: string;
  readonly total_chapters: number;
  readonly latest_chapter: {
    readonly chapter_number: number;
    readonly title: string;
    readonly published_at: string;
    readonly days_ago: number;
  } | null;
  readonly chapters_last_30_days: number;
  readonly pace_status: string;
  readonly first_chapter_at?: string | null;
}

export interface ChatbotConsultResponse {
  readonly success: boolean;
  readonly advice: ChatbotAdviceResponse;
}

export interface ChatbotCategoriesResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: readonly ChatbotCategoryItem[];
}