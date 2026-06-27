'use client';

import { useAuth } from '@/hooks/useAuth';
import PostForm from '@/components/PostForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/post/new');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Phoenix AI Hub
          </a>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PostForm />
      </div>
    </div>
  );
}
