'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { commentsApi } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载评论
  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await commentsApi.list(postId);
        setComments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载评论失败');
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!newComment.trim()) {
      setError('评论不能为空');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const comment = await commentsApi.create(postId, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发表评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await commentsApi.delete(id, postId);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除评论失败');
    }
  };

  if (commentsLoading) {
    return <div className="text-center py-4 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">评论 ({comments.length})</h3>

        {/* 发表评论 */}
        {user ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <div className="p-2 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的想法..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none"
                  rows={3}
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? '发表中...' : '发表评论'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 p-4 text-center text-muted-foreground">
            请<a href="/login" className="text-primary hover:underline">登录</a>后评论
          </Card>
        )}

        {/* 评论列表 */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无评论，来发表第一条评论吧</div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{comment.users?.username || '匿名'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
