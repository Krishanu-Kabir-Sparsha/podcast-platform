export interface Podcast {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  episode_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface PodcastSummary {
  id: string;
  title: string;
}
