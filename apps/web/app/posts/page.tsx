'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'general', label: '通用讨论' },
  { value: 'ai-tools', label: 'AI 工具' },
  { value: 'learning', label: '学习资源' },
  { value: 'news', label: 'AI 新闻' },
  { value: 'showcase', label: '项目展示' },
];

export default function PostsPage() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'upvotes'>('created_at');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { posts, loading, error, hasMore, loadMore, total } = usePosts({
    category: category === 'all' ? null : category,
    search: debouncedSearch || null,
    sortBy,
  });

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Phoenix AI Hub
          </a>
          <Button asChild>
            <Link href="/post/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新帖
            </Link>
          </Button>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <div className="space-y-4 mb-8">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索帖子..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* 分类和排序 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">分类</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      category === cat.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">排序</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'upvotes')}
                className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm"
              >
                <option value="created_at">最新发布</option>
                <option value="upvotes">最受欢迎</option>
              </select>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-4 text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{total}</span> 个结果
        </div>

        {/* 错误提示 */}
        {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-6">{error}</div>}

        {/* 帖子列表 */}
        <div className="space-y-4 mb-8">
          {posts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无帖子，来发表第一个吧！</p>
              <Button asChild className="mt-4">
                <Link href="/post/new">发表新帖</Link>
              </Button>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>

        {/* 加载更多按钮 */}
        {hasMore && (
          <div className="text-center py-8">
            <Button onClick={handleLoadMore} disabled={loading} variant="outline">
              {loading ? '加载中...' : '加载更多'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
