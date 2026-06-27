import { supabase } from './supabase';
import type { Database } from './database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type User = Database['public']['Tables']['users']['Row'];

// Posts API
export const postsApi = {
  // 获取帖子列表
  async list({
    page = 1,
    limit = 20,
    category = null,
    search = null,
    sortBy = 'created_at',
  }: {
    page?: number;
    limit?: number;
    category?: string | null;
    search?: string | null;
    sortBy?: 'created_at' | 'upvotes';
  } = {}) {
    let query = supabase
      .from('posts')
      .select('*, users(username, avatar_url)', { count: 'exact' })
      .order(sortBy, { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as any[], count: count || 0 };
  },

  // 获取单个帖子
  async getById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(username, avatar_url, id)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // 创建帖子
  async create({ title, content, category }: { title: string; content: string; category: string }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.user.id,
        title,
        content,
        category,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 更新帖子
  async update(id: string, { title, content, category }: { title?: string; content?: string; category?: string }) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 删除帖子
  async delete(id: string) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  },
};

// Votes API
export const votesApi = {
  // 投票
  async vote(postId: string, voteType: 'upvote' | 'downvote') {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // 检查是否已投票
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('post_id', postId)
      .single();

    if (existingVote) {
      // 如果投票类型相同，删除投票
      if (existingVote.vote_type === voteType) {
        return await this.unvote(postId);
      }
      // 否则更新投票类型
      const { error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      if (error) throw error;
    } else {
      // 创建新投票
      const { error } = await supabase.from('votes').insert({
        user_id: user.user.id,
        post_id: postId,
        vote_type: voteType,
      });
      if (error) throw error;
    }

    // 更新帖子的投票数
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', postId);

    const upvotes = votes?.filter((v) => v.vote_type === 'upvote').length || 0;
    const downvotes = votes?.filter((v) => v.vote_type === 'downvote').length || 0;

    await supabase
      .from('posts')
      .update({ upvotes, downvotes })
      .eq('id', postId);
  },

  // 取消投票
  async unvote(postId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', user.user.id)
      .eq('post_id', postId);
    if (error) throw error;

    // 更新帖子的投票数
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', postId);

    const upvotes = votes?.filter((v) => v.vote_type === 'upvote').length || 0;
    const downvotes = votes?.filter((v) => v.vote_type === 'downvote').length || 0;

    await supabase
      .from('posts')
      .update({ upvotes, downvotes })
      .eq('id', postId);
  },

  // 获取用户对帖子的投票
  async getUserVote(postId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', user.user.id)
      .eq('post_id', postId)
      .single();
    return data?.vote_type || null;
  },
};

// Comments API
export const commentsApi = {
  // 获取评论列表
  async list(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  // 创建评论
  async create(postId: string, content: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.user.id,
        post_id: postId,
        content,
      })
      .select()
      .single();
    if (error) throw error;

    // 更新帖子的评论数
    const { data: comments } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', postId);

    await supabase
      .from('posts')
      .update({ comment_count: comments?.length || 0 })
      .eq('id', postId);

    return data;
  },

  // 删除评论
  async delete(id: string, postId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;

    // 更新帖子的评论数
    const { data: comments } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', postId);

    await supabase
      .from('posts')
      .update({ comment_count: comments?.length || 0 })
      .eq('id', postId);
  },
};
