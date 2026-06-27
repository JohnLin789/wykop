-- 创建 follows 表（用户关注关系）
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- 创建 user_stats 表（用户统计）
create table if not exists public.user_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  posts_count integer default 0,
  followers_count integer default 0,
  following_count integer default 0,
  karma_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists idx_follows_follower_id on public.follows(follower_id);
create index if not exists idx_follows_following_id on public.follows(following_id);
create index if not exists idx_user_stats_karma on public.user_stats(karma_score desc);

-- 设置 RLS 策略
alter table public.follows enable row level security;
alter table public.user_stats enable row level security;

-- Follows RLS 策略
create policy "Follows are viewable by everyone" on public.follows
  for select using (true);

create policy "Users can follow others" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

-- User stats RLS 策略
create policy "User stats are viewable by everyone" on public.user_stats
  for select using (true);

create policy "Users can read their own stats" on public.user_stats
  for select using (true);
