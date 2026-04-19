-- Ensure helper extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profile table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep existing tables safe if this migration runs on existing projects
ALTER TABLE podcasts ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE podcasts ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE episodes ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE episodes ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE subscriptions ALTER COLUMN subscribed_at TYPE TIMESTAMPTZ;
ALTER TABLE episode_listens ALTER COLUMN listened_at TYPE TIMESTAMPTZ;

-- Data quality constraints
ALTER TABLE podcasts
  ADD CONSTRAINT podcasts_title_not_empty CHECK (length(trim(title)) > 0);

ALTER TABLE episodes
  ADD CONSTRAINT episodes_title_not_empty CHECK (length(trim(title)) > 0);

ALTER TABLE episodes
  ADD CONSTRAINT episodes_number_positive CHECK (episode_number IS NULL OR episode_number > 0);

ALTER TABLE episodes
  ADD CONSTRAINT episodes_duration_non_negative CHECK (duration_seconds IS NULL OR duration_seconds >= 0);

ALTER TABLE episode_listens
  ADD CONSTRAINT listens_duration_non_negative CHECK (duration_listened IS NULL OR duration_listened >= 0);

-- One episode number per podcast
CREATE UNIQUE INDEX IF NOT EXISTS episodes_unique_number_per_podcast
ON episodes (podcast_id, episode_number)
WHERE episode_number IS NOT NULL;

-- Keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS podcasts_set_updated_at ON podcasts;
CREATE TRIGGER podcasts_set_updated_at
BEFORE UPDATE ON podcasts
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS episodes_set_updated_at ON episodes;
CREATE TRIGGER episodes_set_updated_at
BEFORE UPDATE ON episodes
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Create profiles automatically on new user signup
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE create_profile_for_new_user();

-- Backfill profiles for existing users
INSERT INTO profiles (id, email, display_name)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their profile" ON profiles;
CREATE POLICY "Users can read their profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their profile" ON profiles;
CREATE POLICY "Users can update their profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;
CREATE POLICY "Users can insert their profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
