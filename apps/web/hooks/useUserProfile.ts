import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserStats, getFollowersCount, getFollowingCount } from '@/lib/user-stats';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface UserProfileWithStats extends UserProfile {
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
    karma_score: number;
  };
  isFollowing?: boolean;
}

export function useUserProfile(username?: string) {
  const [user, setUser] = useState<UserProfileWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('users').select('*');

        if (username) {
          query = query.eq('username', username);
        } else {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) throw new Error('Not authenticated');
          query = query.eq('id', userData.user.id);
        }

        const { data, error: queryError } = await query.single();
        if (queryError) throw queryError;

        const stats = await getUserStats(data.id);
        const followersCount = await getFollowersCount(data.id);
        const followingCount = await getFollowingCount(data.id);

        // 检查当前用户是否关注了该用户
        let isFollowing = false;
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user && userData.user.id !== data.id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', userData.user.id)
            .eq('following_id', data.id)
            .single();
          isFollowing = !!followData;
        }

        setUser({
          ...data,
          stats: {
            ...stats,
            followers_count: followersCount,
            following_count: followingCount,
          },
          isFollowing,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  return { user, loading, error };
}
