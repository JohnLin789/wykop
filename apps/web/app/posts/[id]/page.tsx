'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { postsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import VoteButtons from '@/components/VoteButtons';
import CommentSection from '@/components/CommentSection';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await postsApi.getById(params.id as string);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载帖子失败');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>加载中...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || '帖子不存在'}</p>
          <Button asChild variant="outline">
            <Link href="/posts">返回列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Phoenix AI Hub
          </a>
          <Button asChild variant="outline">
            <Link href="/posts">返回列表</Link>
          </Button>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 帖子内容 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">{post.users?.username || '匿名'}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                  <span>•</span>
                  <span className="inline-block px-2 py-1 bg-secondary rounded text-xs">{post.category}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comment_count} 评论</span>
                  </button>
                </div>
                <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* 评论区 */}
        <div className="mb-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
