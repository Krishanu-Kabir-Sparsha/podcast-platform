-- Podcasts table
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Episodes table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url VARCHAR(500),
  duration_seconds INTEGER,
  episode_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions (users subscribed to podcasts)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- Episode listens (tracking)
CREATE TABLE episode_listens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  listened_at TIMESTAMP DEFAULT NOW(),
  duration_listened INTEGER -- seconds
);

-- Row Level Security
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_listens ENABLE ROW LEVEL SECURITY;

-- Podcasts RLS: Users can view all podcasts, edit/delete only their own
CREATE POLICY "Public can view all podcasts" ON podcasts
  FOR SELECT USING (true);

CREATE POLICY "Users can create podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts" ON podcasts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts" ON podcasts
  FOR DELETE USING (auth.uid() = user_id);

-- Episodes RLS
CREATE POLICY "Public can view episodes" ON episodes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage episodes of their podcasts" ON episodes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM podcasts WHERE id = podcast_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update episodes of their podcasts" ON episodes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM podcasts WHERE id = podcast_id AND user_id = auth.uid())
  );

-- Subscriptions RLS
CREATE POLICY "Users can manage their subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Listens RLS
CREATE POLICY "Users can track their listens" ON episode_listens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own listens" ON episode_listens
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM episodes e JOIN podcasts p ON e.podcast_id = p.id WHERE e.id = episode_id AND p.user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX podcasts_user_id ON podcasts(user_id);
CREATE INDEX episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX subscriptions_podcast_id ON subscriptions(podcast_id);
CREATE INDEX episode_listens_user_id ON episode_listens(user_id);
CREATE INDEX episode_listens_episode_id ON episode_listens(episode_id);
