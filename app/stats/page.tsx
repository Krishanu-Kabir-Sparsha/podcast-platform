"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  totalPodcasts: number;
  totalEpisodes: number;
  totalSubscribers: number;
  totalListens: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPodcasts: 0,
    totalEpisodes: 0,
    totalSubscribers: 0,
    totalListens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
      return;
    }

    if (session) {
      fetchStats();
    }
  }, [session, authLoading, router]);

  const fetchStats = async () => {
    try {
      // Fetch podcasts count
      const { data: podcastsData, error: podcastsError } = await supabase
        .from("podcasts")
        .select("id", { count: "exact" })
        .eq("user_id", session?.user.id);

      // Fetch episodes count
      const { data: episodesData, error: episodesError } = await supabase
        .from("episodes")
        .select(
          `
          id,
          podcast_id
        `,
          { count: "exact" }
        )
        .in(
          "podcast_id",
          (podcastsData || []).map((p: any) => p.id)
        );

      // Fetch subscribers (users subscribed to user's podcasts)
      const { data: subscribersData, error: subscribersError } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact" })
        .in("podcast_id", (podcastsData || []).map((p: any) => p.id));

      // Fetch listens
      const { data: listensData, error: listensError } = await supabase
        .from("episode_listens")
        .select("id", { count: "exact" })
        .in(
          "episode_id",
          (episodesData || []).map((e: any) => e.id)
        );

      if (podcastsError) throw podcastsError;

      setStats({
        totalPodcasts: podcastsData?.length || 0,
        totalEpisodes: episodesData?.length || 0,
        totalSubscribers: subscribersData?.length || 0,
        totalListens: listensData?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📻</div>
              <div>
                <p className="text-gray-600 text-sm">Total Podcasts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPodcasts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎙️</div>
              <div>
                <p className="text-gray-600 text-sm">Total Episodes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEpisodes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-gray-600 text-sm">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSubscribers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👂</div>
              <div>
                <p className="text-gray-600 text-sm">Total Listens</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalListens}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/podcasts"
              className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition text-center"
            >
              <p className="font-semibold text-gray-900">View Podcasts</p>
              <p className="text-sm text-gray-600">Manage your podcasts</p>
            </Link>
            <Link
              href="/episodes"
              className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition text-center"
            >
              <p className="font-semibold text-gray-900">View Episodes</p>
              <p className="text-sm text-gray-600">Manage your episodes</p>
            </Link>
            <Link
              href="/podcasts/new"
              className="border border-blue-300 bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition text-center"
            >
              <p className="font-semibold text-blue-900">Create New</p>
              <p className="text-sm text-blue-700">Start a new podcast</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
