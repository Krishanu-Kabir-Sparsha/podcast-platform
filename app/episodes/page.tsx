"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  episode_number: number;
  created_at: string;
  podcast_id: string;
}

export default function EpisodesPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
      return;
    }

    if (session) {
      fetchPodcasts();
    }
  }, [session, authLoading, router]);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title")
        .eq("user_id", session?.user.id);

      if (error) throw error;
      setPodcasts(data || []);
      if (data && data.length > 0) {
        setSelectedPodcast(data[0].id);
        fetchEpisodes(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching podcasts:", err);
      setLoading(false);
    }
  };

  const fetchEpisodes = async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("podcast_id", podcastId)
        .order("episode_number", { ascending: false });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (err) {
      console.error("Error fetching episodes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePodcastChange = (podcastId: string) => {
    setSelectedPodcast(podcastId);
    fetchEpisodes(podcastId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Episodes</h1>
          </div>
          <Link
            href="/episodes/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            + Upload Episode
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {podcasts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No podcasts found. Create one first!</p>
            <Link
              href="/podcasts/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Create Podcast
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Podcast
              </label>
              <select
                value={selectedPodcast || ""}
                onChange={(e) => handlePodcastChange(e.target.value)}
                className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {podcasts.map((podcast) => (
                  <option key={podcast.id} value={podcast.id}>
                    {podcast.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading episodes...</p>
              </div>
            ) : episodes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-4xl mb-4">🎙️</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No episodes yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload your first episode to get started!
                </p>
                <Link
                  href="/episodes/new"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Upload Episode
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Episode {episode.episode_number}: {episode.title}
                        </h3>
                        <p className="text-gray-600 mt-2">
                          {episode.description}
                        </p>
                        <div className="mt-2 flex gap-4 text-sm text-gray-500">
                          <span>
                            {episode.duration_seconds
                              ? `${Math.floor(
                                  episode.duration_seconds / 60
                                )}:${String(
                                  episode.duration_seconds % 60
                                ).padStart(2, "0")}`
                              : "Duration unknown"}
                          </span>
                          <span>
                            {new Date(episode.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
