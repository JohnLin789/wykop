import { useState, useCallback, useEffect } from 'react';
import { postsApi } from '@/lib/api-client';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  category?: string | null;
  search?: string | null;
  sortBy?: 'created_at' | 'upvotes';
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(options.page || 1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const limit = options.limit || 20;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count } = await postsApi.list({
        page,
        limit,
        category: options.category,
        search: options.search,
        sortBy: options.sortBy || 'created_at',
      });
      setPosts((prev) => (page === 1 ? data : [...prev, ...data]));
      setTotal(count);
      setHasMore(page * limit < count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, options.category, options.search, options.sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setPosts([]);
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    page,
    hasMore,
    total,
    loadMore,
    refresh,
  };
}
