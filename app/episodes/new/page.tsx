"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getProductErrorMessage } from "@/lib/errors";
import Link from "next/link";
import type { PodcastSummary } from "@/lib/types";

export default function NewEpisodePage() {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [podcasts, setPodcasts] = useState<PodcastSummary[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState("");
  const [podcastsLoading, setPodcastsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!session?.user.id) {
      router.push("/");
      return;
    }

    const fetchPodcasts = async () => {
      try {
        const { data, error } = await supabase
          .from("podcasts")
          .select("id, title")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const list = (data || []) as PodcastSummary[];
        setPodcasts(list);
        if (data && data.length > 0) {
          setSelectedPodcast(data[0].id);
        }
      } catch {
        setError("Could not load your podcasts.");
      } finally {
        setPodcastsLoading(false);
      }
    };

    fetchPodcasts();
  }, [session, isReady, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      setError("You must be signed in to create episodes.");
      return;
    }

    if (!title || !selectedPodcast) {
      setError("Title and podcast are required");
      return;
    }

    if (episodeNumber <= 0) {
      setError("Episode number must be greater than zero.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("episodes")
        .insert({
          podcast_id: selectedPodcast,
          title: title.trim(),
          description: description.trim() || null,
          episode_number: episodeNumber,
          duration_seconds: duration > 0 ? duration : null,
        });

      if (err) throw err;

      router.push("/episodes");
    } catch (err: unknown) {
      setError(getProductErrorMessage(err, "Error creating episode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-narrow space-y-6">
        <div>
          <Link href="/episodes" className="inline-link mb-4 inline-block">
            ← Back to Episodes
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Create Episode</h1>
        </div>

        <div className="card-elevated p-8">
          {podcastsLoading ? (
            <div className="flex items-center gap-3 text-muted">
              <div className="loader" />
              <p>Loading podcasts...</p>
            </div>
          ) : podcasts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">No podcasts found.</p>
              <Link href="/podcasts/new" className="btn-primary inline-flex">
                Create Podcast First
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="label">Podcast</label>
                <select
                  value={selectedPodcast}
                  onChange={(e) => setSelectedPodcast(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  {podcasts.map((podcast) => (
                    <option key={podcast.id} value={podcast.id}>
                      {podcast.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Episode Number</label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Duration (seconds)</label>
                <input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Episode Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Episode title"
                  className="input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this episode about?"
                  rows={5}
                  className="input min-h-28"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="notice-error">
                  <p>{error}</p>
                  <Link href="/setup-status" className="inline-link mt-2 inline-block">
                    Open Setup Status →
                  </Link>
                </div>
              )}

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Creating..." : "Create Episode"}
                </button>
                <Link href="/episodes" className="btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

