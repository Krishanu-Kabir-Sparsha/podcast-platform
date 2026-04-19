"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Podcast {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function PodcastsPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select("*")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (err) {
      console.error("Error fetching podcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">My Podcasts</h1>
          </div>
          <Link
            href="/podcasts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            + Create Podcast
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {podcasts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">📻</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No podcasts yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first podcast to get started!
            </p>
            <Link
              href="/podcasts/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Create First Podcast
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/podcasts/${podcast.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
              >
                {podcast.image_url && (
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={podcast.image_url}
                      alt={podcast.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {podcast.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {podcast.description || "No description"}
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Created{" "}
                  {new Date(podcast.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
