import { supabase } from './supabase';

/**
 * 获取或创建用户统计
 */
export async function getUserStats(userId: string) {
  let { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // 记录不存在，创建新记录
    const { data: newStats, error: createError } = await supabase
      .from('user_stats')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) throw createError;
    return newStats;
  }

  if (error) throw error;
  return data;
}

/**
 * 更新用户统计
 */
export async function updateUserStats(
  userId: string,
  updates: {
    posts_count?: number;
    followers_count?: number;
    following_count?: number;
    karma_score?: number;
  }
) {
  const { data, error } = await supabase
    .from('user_stats')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 增加用户的帖子数
 */
export async function incrementPostCount(userId: string) {
  const stats = await getUserStats(userId);
  return updateUserStats(userId, {
    posts_count: (stats.posts_count || 0) + 1,
  });
}

/**
 * 减少用户的帖子数
 */
export async function decrementPostCount(userId: string) {
  const stats = await getUserStats(userId);
  return updateUserStats(userId, {
    posts_count: Math.max(0, (stats.posts_count || 1) - 1),
  });
}

/**
 * 增加用户的声誉值
 */
export async function addKarma(userId: string, amount: number) {
  const stats = await getUserStats(userId);
  return updateUserStats(userId, {
    karma_score: (stats.karma_score || 0) + amount,
  });
}

/**
 * 获取用户的粉丝数
 */
export async function getFollowersCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact' })
    .eq('following_id', userId);

  if (error) throw error;
  return count || 0;
}

/**
 * 获取用户的关注数
 */
export async function getFollowingCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact' })
    .eq('follower_id', userId);

  if (error) throw error;
  return count || 0;
}

/**
 * 获取用户等级
 */
export function getUserLevel(karma: number): { level: string; title: string } {
  if (karma >= 10000) return { level: 'legend', title: '传奇' };
  if (karma >= 5000) return { level: 'expert', title: '专家' };
  if (karma >= 1000) return { level: 'contributor', title: '贡献者' };
  if (karma >= 100) return { level: 'member', title: '成员' };
  return { level: 'newbie', title: '新手' };
}
