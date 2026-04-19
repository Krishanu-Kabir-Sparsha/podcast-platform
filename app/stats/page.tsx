"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getProductErrorMessage } from "@/lib/errors";
import Link from "next/link";

interface Stats {
  totalPodcasts: number;
  totalEpisodes: number;
  totalSubscribers: number;
  totalListens: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPodcasts: 0,
    totalEpisodes: 0,
    totalSubscribers: 0,
    totalListens: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.push("/");
      return;
    }

    fetchStats(session.user.id);
  }, [session, isReady, router]);

  const fetchStats = async (userId: string) => {
    try {
      setError("");
      const { data: podcastsData, error: podcastsError } = await supabase
        .from("podcasts")
        .select("id")
        .eq("user_id", userId);

      if (podcastsError) throw podcastsError;

      const podcastIds = (podcastsData || []).map((p: { id: string }) => p.id);

      if (podcastIds.length === 0) {
        setStats({
          totalPodcasts: 0,
          totalEpisodes: 0,
          totalSubscribers: 0,
          totalListens: 0,
        });
        return;
      }

      const { data: episodesData, error: episodesError } = await supabase
        .from("episodes")
        .select("id")
        .in("podcast_id", podcastIds);

      if (episodesError) throw episodesError;

      const episodeIds = (episodesData || []).map((e: { id: string }) => e.id);

      const { data: subscribersData, error: subscribersError } = await supabase
        .from("subscriptions")
        .select("id")
        .in("podcast_id", podcastIds);

      if (subscribersError) throw subscribersError;

      let listensData: { id: string }[] = [];
      if (episodeIds.length > 0) {
        const listensResult = await supabase
          .from("episode_listens")
          .select("id")
          .in("episode_id", episodeIds);
        if (listensResult.error) throw listensResult.error;
        listensData = (listensResult.data || []) as { id: string }[];
      }

      setStats({
        totalPodcasts: podcastsData?.length || 0,
        totalEpisodes: episodesData?.length || 0,
        totalSubscribers: subscribersData?.length || 0,
        totalListens: listensData?.length || 0,
      });
    } catch (err: unknown) {
      setError(getProductErrorMessage(err, "Could not load stats."));
    } finally {
      setLoading(false);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4" />
          <p className="text-muted">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-wide space-y-6">
        <div>
          <Link href="/dashboard" className="inline-link mb-4 block">
            ← Dashboard
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Statistics</h1>
        </div>

        {error ? (
          <div className="notice-error">
            <p>{error}</p>
            <Link href="/setup-status" className="inline-link mt-2 inline-block">
              Open Setup Status →
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-elevated p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📻</div>
              <div>
                <p className="text-muted text-sm">Total Podcasts</p>
                <p className="text-3xl font-bold">{stats.totalPodcasts}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎙️</div>
              <div>
                <p className="text-muted text-sm">Total Episodes</p>
                <p className="text-3xl font-bold">{stats.totalEpisodes}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-muted text-sm">Total Subscribers</p>
                <p className="text-3xl font-bold">{stats.totalSubscribers}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👂</div>
              <div>
                <p className="text-muted text-sm">Total Listens</p>
                <p className="text-3xl font-bold">{stats.totalListens}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 card-elevated p-8">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/podcasts"
              className="panel-subtle rounded-lg p-4 hover:brightness-105 transition text-center"
            >
              <p className="font-semibold">View Podcasts</p>
              <p className="text-sm text-muted">Manage your podcasts</p>
            </Link>
            <Link
              href="/episodes"
              className="panel-subtle rounded-lg p-4 hover:brightness-105 transition text-center"
            >
              <p className="font-semibold">View Episodes</p>
              <p className="text-sm text-muted">Manage your episodes</p>
            </Link>
            <Link
              href="/podcasts/new"
              className="panel-subtle rounded-lg p-4 hover:brightness-105 transition text-center"
            >
              <p className="font-semibold">Create New</p>
              <p className="text-sm text-muted">Start a new podcast</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
