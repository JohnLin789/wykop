'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { postsApi } from '@/lib/api-client';
import EditPostForm from '@/components/EditPostForm';
import { useAuth } from '@/hooks/useAuth';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await postsApi.getById(params.id as string);
        
        // 检查权限
        if (data.user_id !== user?.id) {
          throw new Error('你没有权限编辑这个帖子');
        }
        
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载帖子失败');
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      loadPost();
    }
  }, [params.id, user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || '帖子不存在'}</p>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Phoenix AI Hub
          </a>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EditPostForm
          initialData={{
            title: post.title,
            content: post.content,
            category: post.category,
          }}
        />
      </div>
    </div>
  );
}
