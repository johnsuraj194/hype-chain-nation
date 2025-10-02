/*
  # Add Comments, Daily Rewards, and Chains Features

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)

    - `daily_rewards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `reward_date` (date)
      - `amount` (integer)
      - `streak_days` (integer)
      - `created_at` (timestamp)

    - `chains`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `total_hype` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `chain_posts`
      - `id` (uuid, primary key)
      - `chain_id` (uuid, references chains)
      - `post_id` (uuid, references posts)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table

  3. Indexes
    - Add indexes for performance optimization
*/

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INTEGER NOT NULL DEFAULT 10,
  streak_days INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.daily_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON public.daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_date ON public.daily_rewards(reward_date);

CREATE TABLE IF NOT EXISTS public.chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (LENGTH(title) > 0 AND LENGTH(title) <= 100),
  description TEXT,
  total_hype INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chains are viewable by everyone"
  ON public.chains FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create chains"
  ON public.chains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own chains"
  ON public.chains FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own chains"
  ON public.chains FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE INDEX IF NOT EXISTS idx_chains_creator_id ON public.chains(creator_id);
CREATE INDEX IF NOT EXISTS idx_chains_is_active ON public.chains(is_active);

CREATE TABLE IF NOT EXISTS public.chain_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.chains(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chain_id, post_id)
);

ALTER TABLE public.chain_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chain posts are viewable by everyone"
  ON public.chain_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add posts to chains"
  ON public.chain_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chains
      WHERE chains.id = chain_posts.chain_id
      AND chains.creator_id = auth.uid()
    )
  );

CREATE POLICY "Chain creators can remove posts from their chains"
  ON public.chain_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chains
      WHERE chains.id = chain_posts.chain_id
      AND chains.creator_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_chain_posts_chain_id ON public.chain_posts(chain_id);
CREATE INDEX IF NOT EXISTS idx_chain_posts_post_id ON public.chain_posts(post_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chain_posts;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_daily_reward'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_daily_reward DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'streak_days'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN streak_days INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;
