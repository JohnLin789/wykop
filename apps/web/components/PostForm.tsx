'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { postsApi } from '@/lib/api-client';

const CATEGORIES = [
  { value: 'general', label: '通用讨论' },
  { value: 'ai-tools', label: 'AI 工具' },
  { value: 'learning', label: '学习资源' },
  { value: 'news', label: 'AI 新闻' },
  { value: 'showcase', label: '项目展示' },
];

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleLength = title.length;
  const contentLength = content.length;
  const maxTitle = 200;
  const maxContent = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }

    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }

    if (title.length > maxTitle) {
      setError(`标题不能超过 ${maxTitle} 个字符`);
      return;
    }

    if (content.length > maxContent) {
      setError(`内容不能超过 ${maxContent} 个字符`);
      return;
    }

    setLoading(true);
    try {
      await postsApi.create({ title, content, category });
      router.push('/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发帖失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>发表新帖</CardTitle>
        <CardDescription>分享你的想法和见解</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title" className="block text-sm font-medium">
                标题
              </label>
              <span className={`text-xs ${titleLength > maxTitle * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {titleLength}/{maxTitle}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, maxTitle))}
              placeholder="输入你的想法标题..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground"
              maxLength={maxTitle}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium">
                内容
              </label>
              <span className={`text-xs ${contentLength > maxContent * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {contentLength}/{maxContent}
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxContent))}
              placeholder="详细描述你的想法..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none"
              rows={8}
              maxLength={maxContent}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? '发布中...' : '发布帖子'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
