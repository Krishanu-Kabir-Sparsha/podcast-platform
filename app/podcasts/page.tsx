"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getProductErrorMessage } from "@/lib/errors";
import Link from "next/link";
import Image from "next/image";
import type { Podcast } from "@/lib/types";

export default function PodcastsPage() {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.push("/");
      return;
    }

    const fetchPodcasts = async () => {
      try {
        setError("");
        const { data, error } = await supabase
          .from("podcasts")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPodcasts((data || []) as Podcast[]);
      } catch (err: unknown) {
        setError(getProductErrorMessage(err, "Could not load podcasts."));
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [session, isReady, router]);

  if (!isReady || loading) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4" />
          <p className="text-muted">Loading podcasts...</p>
        </div>
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
            <h1 className="text-4xl font-semibold tracking-tight mt-2">My Podcasts</h1>
          </div>
          <Link href="/podcasts/new" className="btn-primary">
            + Create Podcast
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
            <div className="text-4xl mb-4">📻</div>
            <h2 className="text-xl font-semibold mb-2">No podcasts yet</h2>
            <p className="text-muted mb-6">Create your first podcast to get started.</p>
            <Link href="/podcasts/new" className="btn-primary inline-flex">
              Create First Podcast
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/podcasts/${podcast.id}`}
                className="card-elevated p-6 card-hover"
              >
                {podcast.image_url && (
                  <div className="w-full h-40 bg-panel-2 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={podcast.image_url}
                      alt={podcast.title}
                      width={640}
                      height={280}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{podcast.title}</h3>
                <p className="text-muted text-sm line-clamp-2">
                  {podcast.description || "No description"}
                </p>
                <div className="mt-4 text-xs text-muted">Created {new Date(podcast.created_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
