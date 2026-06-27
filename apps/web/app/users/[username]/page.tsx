'use client';

import { useParams } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/UserProfile';
import UserStats from '@/components/UserStats';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const { user: authUser } = useAuth();
  const { user, loading, error } = useUserProfile(params.username as string);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadUserPosts = async () => {
        try {
          const { data } = await postsApi.list({
            limit: 100,
          });
          setUserPosts(data.filter((post: any) => post.user_id === user.id));
        } finally {
          setPostsLoading(false);
        }
      };
      loadUserPosts();
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>用户不存在</p>
        <Button asChild variant="outline">
          <Link href="/posts">返回列表</Link>
        </Button>
      </div>
    );
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
            {authUser?.id !== user.id && (
              <FollowButton userId={user.id} isFollowing={user.isFollowing || false} />
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
              <div className="text-center py-8 text-muted-foreground">暂无帖子</div>
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
