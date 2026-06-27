'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VoteButtons from './VoteButtons';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  users?: {
    username: string;
    avatar_url?: string;
  };
}

export default function PostCard({
  id,
  title,
  content,
  category,
  upvotes,
  downvotes,
  comment_count,
  created_at,
  users,
}: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  const score = upvotes - downvotes;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/posts/${id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {title}
              </CardTitle>
            </Link>
            <CardDescription className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">{users?.username || '匿名'}</span>
                <span>•</span>
                <span>{timeAgo}</span>
                <span>•</span>
                <span className="inline-block px-2 py-1 bg-secondary rounded">{category}</span>
              </div>
            </CardDescription>
          </div>
          <VoteButtons postId={id} upvotes={upvotes} downvotes={downvotes} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{content}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{comment_count} 评论</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowUpRight className="w-4 h-4" />
            <span>{score} 热度</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
