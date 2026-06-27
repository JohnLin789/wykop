'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfile from '@/components/UserProfile';
import UserStats from '@/components/UserStats';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { postsApi } from '@/lib/api-client';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { user, loading, error } = useUserProfile();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadUserPosts = async () => {
        try {
          const { data } = await postsApi.list({
            limit: 100,
            // 这里需要在 API 中添加 user_id 筛选
          });
          // 临时解决方案：在客户端过滤
          setUserPosts(data.filter((post: any) => post.user_id === user.id));
        } finally {
          setPostsLoading(false);
        }
      };
      loadUserPosts();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (error || !user) {
    return <div className="flex items-center justify-center min-h-screen">用户不存在</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Phoenix AI Hub
          </a>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 用户信息 */}
          <UserProfile user={user}>
            {authUser?.id === user.id && (
              <Button asChild variant="outline">
                <Link href="/profile/edit">编辑资料</Link>
              </Button>
            )}
          </UserProfile>

          {/* 用户统计 */}
          <UserStats stats={user.stats} />

          {/* 用户的帖子 */}
          <div>
            <h2 className="text-2xl font-bold mb-4">发表的帖子</h2>
            {postsLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无帖子
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
