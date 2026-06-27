import { postsApi } from '@/lib/api-client';
import { calculatePostScore } from '@/lib/ranking';

/**
 * 扩展 postsApi 以支持热度排序
 */
export const hotPostsApi = {
  async listHot({
    page = 1,
    limit = 20,
    category = null,
    search = null,
  }: {
    page?: number;
    limit?: number;
    category?: string | null;
    search?: string | null;
  } = {}) {
    // 获取帖子列表
    const { data, count } = await postsApi.list({
      page: 1,
      limit: 1000, // 获取更多帖子以便计算热度
      category,
      search,
      sortBy: 'created_at',
    });

    // 按热度排序
    const sorted = data.sort((a: any, b: any) => {
      const scoreA = calculatePostScore(a);
      const scoreB = calculatePostScore(b);
      return scoreB - scoreA;
    });

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedData = sorted.slice(from, to);

    return {
      data: paginatedData,
      count,
    };
  },
};
