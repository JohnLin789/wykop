'use client';

import { Card, CardContent } from '@/components/ui/card';
import { getUserLevel } from '@/lib/user-stats';
import { Trophy, Users, Heart } from 'lucide-react';

interface UserStatsProps {
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
    karma_score: number;
  };
}

export default function UserStats({ stats }: UserStatsProps) {
  const { level, title } = getUserLevel(stats.karma_score);

  const statItems = [
    { label: '帖子', value: stats.posts_count, icon: Heart },
    { label: '关注', value: stats.following_count, icon: Users },
    { label: '粉丝', value: stats.followers_count, icon: Users },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 声誉值和等级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">声誉值</p>
                <p className="text-2xl font-bold">{stats.karma_score.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                level === 'legend' ? 'bg-yellow-500/20 text-yellow-600' :
                level === 'expert' ? 'bg-purple-500/20 text-purple-600' :
                level === 'contributor' ? 'bg-blue-500/20 text-blue-600' :
                level === 'member' ? 'bg-green-500/20 text-green-600' :
                'bg-gray-500/20 text-gray-600'
              }`}>
                {title}
              </span>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            {statItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
