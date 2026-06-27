'use client';

import { Button } from '@/components/ui/button';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing: initialIsFollowing }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, setIsFollowing, loading, follow, unfollow } = useFollow(userId);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, setIsFollowing]);

  if (!user || user.id === userId) {
    return null;
  }

  const handleClick = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFollowing ? 'default' : 'outline'}
      className="flex items-center gap-2"
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          已关注
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          关注
        </>
      )}
    </Button>
  );
}
