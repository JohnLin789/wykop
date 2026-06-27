import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { updateUserStats, getFollowersCount } from '@/lib/user-stats';

export function useFollow(followingId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const follow = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('follows').insert({
        follower_id: userData.user.id,
        following_id: followingId,
      });

      if (insertError) throw insertError;

      // 更新粉丝数
      const followersCount = await getFollowersCount(followingId);
      await updateUserStats(followingId, {
        followers_count: followersCount,
      });

      setIsFollowing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Follow failed');
    } finally {
      setLoading(false);
    }
  }, [followingId]);

  const unfollow = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userData.user.id)
        .eq('following_id', followingId);

      if (deleteError) throw deleteError;

      // 更新粉丝数
      const followersCount = await getFollowersCount(followingId);
      await updateUserStats(followingId, {
        followers_count: followersCount,
      });

      setIsFollowing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unfollow failed');
    } finally {
      setLoading(false);
    }
  }, [followingId]);

  return {
    isFollowing,
    setIsFollowing,
    loading,
    error,
    follow,
    unfollow,
  };
}
