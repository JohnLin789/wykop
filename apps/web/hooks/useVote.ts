import { useState, useCallback } from 'react';
import { votesApi } from '@/lib/api-client';

export function useVote(postId: string) {
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = useCallback(
    async (voteType: 'upvote' | 'downvote') => {
      setLoading(true);
      setError(null);
      try {
        await votesApi.vote(postId, voteType);
        setUserVote((prev) => (prev === voteType ? null : voteType));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Vote failed');
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  const unvote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await votesApi.unvote(postId);
      setUserVote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unvote failed');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  return {
    userVote,
    loading,
    error,
    vote,
    unvote,
  };
}
