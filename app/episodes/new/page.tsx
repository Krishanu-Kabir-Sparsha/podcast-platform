"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function NewEpisodePage() {
  const router = useRouter();
  const { session } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState("");
  const [podcastsLoading, setPodcastsLoading] = useState(true);

  // Fetch podcasts on mount
  useState(() => {
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
        }
      } catch (err) {
        console.error("Error fetching podcasts:", err);
      } finally {
        setPodcastsLoading(false);
      }
    };

    if (session?.user.id) {
      fetchPodcasts();
    }
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedPodcast) {
      setError("Title and podcast are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("episodes")
        .insert({
          podcast_id: selectedPodcast,
          title,
          description,
          episode_number: episodeNumber,
        });

      if (err) throw err;

      router.push("/episodes");
    } catch (err: any) {
      setError(err.message || "Error creating episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/episodes"
            className="text-blue-600 hover:text-blue-800 mb-4 block"
          >
            ← Back to Episodes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload New Episode</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow p-8">
          {podcastsLoading ? (
            <p className="text-gray-600">Loading podcasts...</p>
          ) : podcasts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No podcasts found.</p>
              <Link
                href="/podcasts/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Create Podcast First
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast *
                </label>
                <select
                  value={selectedPodcast}
                  onChange={(e) => setSelectedPodcast(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Number
                </label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Episode title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this episode about?"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {loading ? "Creating..." : "Create Episode"}
                </button>
                <Link
                  href="/episodes"
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-semibold"
                >
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
