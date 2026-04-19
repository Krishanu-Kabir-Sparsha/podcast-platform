"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Episode, Podcast } from "@/lib/types";

export default function PodcastDetailPage() {
  const params = useParams<{ id: string }>();
  const podcastId = params.id;
  const router = useRouter();
  const { session, isReady } = useAuth();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const totalDuration = useMemo(() => {
    const seconds = episodes.reduce((acc, ep) => acc + (ep.duration_seconds ?? 0), 0);
    const mins = Math.floor(seconds / 60);
    return `${mins} min total`;
  }, [episodes]);

  useEffect(() => {
    if (!isReady) return;

    if (!session) {
      router.push("/");
      return;
    }

    const load = async () => {
      setLoading(true);
      setMessage("");

      const [{ data: podcastData, error: podcastError }, { data: episodesData, error: episodesError }] =
        await Promise.all([
          supabase
            .from("podcasts")
            .select("*")
            .eq("id", podcastId)
            .eq("user_id", session.user.id)
            .single(),
          supabase
            .from("episodes")
            .select("*")
            .eq("podcast_id", podcastId)
            .order("episode_number", { ascending: true }),
        ]);

      if (podcastError || !podcastData) {
        setMessage("Podcast not found or access denied.");
        setPodcast(null);
        setEpisodes([]);
        setLoading(false);
        return;
      }

      if (episodesError) {
        setMessage("Podcast loaded, but episodes could not be loaded.");
      }

      setPodcast(podcastData as Podcast);
      setTitle(podcastData.title);
      setDescription(podcastData.description ?? "");
      setEpisodes((episodesData ?? []) as Episode[]);
      setLoading(false);
    };

    load();
  }, [isReady, session, podcastId, router]);

  const handleUpdate = async () => {
    if (!podcast || !title.trim()) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("podcasts")
      .update({ title: title.trim(), description: description.trim() || null })
      .eq("id", podcast.id)
      .eq("user_id", session?.user.id ?? "");

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Saved successfully.");
      setPodcast({ ...podcast, title: title.trim(), description: description.trim() || null });
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!podcast) return;
    const ok = window.confirm("Delete this podcast and all episodes? This cannot be undone.");
    if (!ok) return;

    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", podcast.id)
      .eq("user_id", session?.user.id ?? "");

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push("/podcasts");
  };

  if (!isReady || loading) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="page-shell min-h-screen p-6">
        <div className="container-narrow card-elevated p-8 text-center">
          <p className="text-xl font-semibold">Podcast unavailable</p>
          <p className="text-muted mt-2">{message || "This podcast could not be loaded."}</p>
          <Link href="/podcasts" className="btn-primary inline-flex mt-6">Back to podcasts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-wide space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href="/podcasts" className="inline-link">Back to podcasts</Link>
            <h1 className="text-4xl font-semibold tracking-tight mt-2">{podcast.title}</h1>
            <p className="text-muted mt-1">
              {episodes.length} episodes • {totalDuration}
            </p>
          </div>
          <Link href="/episodes/new" className="btn-primary">Add Episode</Link>
        </div>

        {message ? <div className="notice-info">{message}</div> : null}

        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
          <section className="card-elevated p-6 space-y-4">
            <h2 className="text-xl font-semibold">Podcast Settings</h2>
            <div>
              <label className="label">Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-28"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary" disabled={saving} onClick={handleUpdate}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="btn-danger" disabled={saving} onClick={handleDelete}>
                Delete Podcast
              </button>
            </div>
          </section>

          <section className="card-elevated p-6">
            <h2 className="text-xl font-semibold mb-4">Episodes</h2>
            {episodes.length === 0 ? (
              <div className="panel-subtle p-6 text-center">
                <p className="font-medium">No episodes yet</p>
                <p className="text-muted text-sm mt-1">Create your first episode to start publishing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <article key={episode.id} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted">Episode {episode.episode_number ?? "-"}</p>
                        <h3 className="font-semibold text-lg">{episode.title}</h3>
                        <p className="text-sm text-muted mt-1">
                          {episode.description || "No description yet."}
                        </p>
                      </div>
                      <span className="chip">
                        {episode.duration_seconds ? `${Math.floor(episode.duration_seconds / 60)}m` : "n/a"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
