"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getProductErrorMessage } from "@/lib/errors";
import Link from "next/link";
import type { Episode, PodcastSummary } from "@/lib/types";

export default function EpisodesPage() {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastSummary[]>([]);
  const [error, setError] = useState("");

  const fetchEpisodes = useCallback(async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("podcast_id", podcastId)
        .order("episode_number", { ascending: false });

      if (error) throw error;
      setEpisodes((data || []) as Episode[]);
    } catch (err: unknown) {
      setError(getProductErrorMessage(err, "Could not load episodes."));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPodcasts = useCallback(async (userId: string) => {
    try {
      setError("");
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = (data || []) as PodcastSummary[];
      setPodcasts(list);
      if (list.length > 0) {
        setSelectedPodcast(list[0].id);
        fetchEpisodes(list[0].id);
      } else {
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(getProductErrorMessage(err, "Could not load podcasts."));
      setLoading(false);
    }
  }, [fetchEpisodes]);

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.push("/");
      return;
    }

    fetchPodcasts(session.user.id);
  }, [session, isReady, router, fetchPodcasts]);

  const handlePodcastChange = (podcastId: string) => {
    setLoading(true);
    setSelectedPodcast(podcastId);
    fetchEpisodes(podcastId);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-wide space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <Link href="/dashboard" className="inline-link">
              ← Dashboard
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight mt-2">Episodes</h1>
          </div>
          <Link href="/episodes/new" className="btn-primary">
            + Upload Episode
          </Link>
        </div>

        {error ? (
          <div className="notice-error">
            <p>{error}</p>
            <Link href="/setup-status" className="inline-link mt-2 inline-block">
              Open Setup Status →
            </Link>
          </div>
        ) : null}

        {podcasts.length === 0 ? (
          <div className="card-elevated text-center py-12 px-6">
            <p className="text-muted mb-4">No podcasts found. Create one first.</p>
            <Link href="/podcasts/new" className="btn-primary inline-flex">
              Create Podcast
            </Link>
          </div>
        ) : (
          <>
            <div className="card-elevated p-5 mb-8">
              <label className="label">Select Podcast</label>
              <select
                value={selectedPodcast || ""}
                onChange={(e) => handlePodcastChange(e.target.value)}
                className="input max-w-md"
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
                <div className="loader mx-auto mb-4" />
                <p className="text-muted">Loading episodes...</p>
              </div>
            ) : episodes.length === 0 ? (
              <div className="card-elevated text-center py-12 px-6">
                <div className="text-4xl mb-4">🎙️</div>
                <h2 className="text-xl font-semibold mb-2">No episodes yet</h2>
                <p className="text-muted mb-6">Upload your first episode to get started.</p>
                <Link href="/episodes/new" className="btn-primary inline-flex">
                  Upload Episode
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <div key={episode.id} className="card-elevated p-6 card-hover">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">Episode {episode.episode_number}: {episode.title}</h3>
                        <p className="text-muted mt-2">{episode.description || "No description"}</p>
                        <div className="mt-2 flex gap-4 text-sm text-muted">
                          <span>
                            {episode.duration_seconds
                              ? `${Math.floor(
                                  episode.duration_seconds / 60
                                )}:${String(
                                  episode.duration_seconds % 60
                                ).padStart(2, "0")}`
                              : "Duration unknown"}
                          </span>
                          <span>{new Date(episode.created_at).toLocaleDateString()}</span>
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
