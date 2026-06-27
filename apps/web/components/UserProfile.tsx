'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface UserProfileProps {
  user: {
    username: string;
    email: string;
    avatar_url?: string;
    created_at: string;
  };
  children?: React.ReactNode;
}

export default function UserProfile({ user, children }: UserProfileProps) {
  const joinDate = formatDistanceToNow(new Date(user.created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
          {children}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          加入于 {joinDate}
        </div>
      </CardContent>
    </Card>
  );
}
