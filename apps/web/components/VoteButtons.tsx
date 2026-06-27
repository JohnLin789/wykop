'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useVote } from '@/hooks/useVote';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { votesApi } from '@/lib/api-client';

interface VoteButtonsProps {
  postId: string;
  upvotes?: number;
  downvotes?: number;
}

export default function VoteButtons({ postId, upvotes = 0, downvotes = 0 }: VoteButtonsProps) {
  const { user } = useAuth();
  const { userVote, vote, loading } = useVote(postId);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);

  useEffect(() => {
    if (user) {
      votesApi.getUserVote(postId).then((voteType) => {
        // 这个会在投票时更新
      });
    }
  }, [postId, user]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      alert('请先登录');
      return;
    }

    // 乐观更新
    if (voteType === 'upvote') {
      if (userVote === 'upvote') {
        setCurrentUpvotes((prev) => prev - 1);
      } else if (userVote === 'downvote') {
        setCurrentUpvotes((prev) => prev + 1);
        setCurrentDownvotes((prev) => prev - 1);
      } else {
        setCurrentUpvotes((prev) => prev + 1);
      }
    } else {
      if (userVote === 'downvote') {
        setCurrentDownvotes((prev) => prev - 1);
      } else if (userVote === 'upvote') {
        setCurrentDownvotes((prev) => prev + 1);
        setCurrentUpvotes((prev) => prev - 1);
      } else {
        setCurrentDownvotes((prev) => prev + 1);
      }
    }

    await vote(voteType);
  };

  const score = currentUpvotes - currentDownvotes;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 'upvote' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-xs">{currentUpvotes}</span>
      </Button>
      <div className="text-xs font-semibold text-muted-foreground min-w-[2rem] text-center">
        {score > 0 ? '+' : ''}{score}
      </div>
      <Button
        variant={userVote === 'downvote' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-xs">{currentDownvotes}</span>
      </Button>
    </div>
  );
}
