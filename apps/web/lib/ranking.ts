// 热度算法
// 基于 Wilson 评分和时间衰减

/**
 * Wilson 置信区间评分
 * 用于平衡赞踩比例和样本数量
 * @param upvotes 赞数
 * @param downvotes 踩数
 * @returns 0-1 之间的分数
 */
export function wilsonScore(upvotes: number, downvotes: number): number {
  const n = upvotes + downvotes;
  if (n === 0) return 0;

  const phat = upvotes / n;
  const z = 1.96; // 95% 置信区间
  const denominator = 1 + (z * z) / n;

  const left = phat + (z * z) / (2 * n);
  const right = z * Math.sqrt(phat * (1 - phat) / n + (z * z) / (4 * n * n));

  const score = (left - right) / denominator;
  return Math.max(0, Math.min(1, score));
}

/**
 * 时间衰减函数
 * 越新的帖子得分越高，逐渐衰减
 * @param createdAt 创建时间
 * @returns 0-1 之间的分数
 */
export function timeDecay(createdAt: Date | string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const ageInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  // 48 小时内满分，之后按对数衰减
  if (ageInHours <= 48) return 1;
  return 48 / (48 + ageInHours);
}

/**
 * 评论热度加权
 * 评论多的帖子得分稍高
 * @param commentCount 评论数
 * @returns 1.0-2.0 之间的倍数
 */
export function commentBoost(commentCount: number): number {
  // 对数增长，避免评论数过多导致权重过高
  return 1 + Math.log10(commentCount + 1) * 0.3;
}

/**
 * 计算帖子的热度分数
 * @param post 帖子数据
 * @returns 最终的热度分数
 */
export function calculatePostScore(post: {
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
}): number {
  const wilson = wilsonScore(post.upvotes, post.downvotes);
  const decay = timeDecay(post.created_at);
  const boost = commentBoost(post.comment_count);

  // 最终分数 = Wilson分数 * 时间衰减 * 评论加权
  return wilson * decay * boost * 100; // 乘以 100 便于排序
}

/**
 * 排序帖子列表
 * @param posts 帖子列表
 * @returns 按热度排序的帖子列表
 */
export function rankPosts(
  posts: Array<{
    id: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    created_at: string;
    [key: string]: any;
  }>
): typeof posts {
  return posts.sort((a, b) => {
    const scoreA = calculatePostScore(a);
    const scoreB = calculatePostScore(b);
    return scoreB - scoreA;
  });
}

/**
 * 获取用户声誉值
 * 基于帖子投票和发表内容
 * @param posts 用户的帖子
 * @returns 声誉值
 */
export function calculateKarma(posts: Array<{ upvotes: number; downvotes: number }>): number {
  return posts.reduce((total, post) => {
    return total + post.upvotes * 10 - post.downvotes * 2;
  }, 0);
}
