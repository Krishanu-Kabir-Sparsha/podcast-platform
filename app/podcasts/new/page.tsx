"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getProductErrorMessage } from "@/lib/errors";
import Link from "next/link";

export default function NewPodcastPage() {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!session) router.push("/");
  }, [isReady, session, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      setError("You must be signed in to create podcasts.");
      return;
    }

    if (!title) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: err } = await supabase
        .from("podcasts")
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim() || null,
        })
        .select()
        .single();

      if (err) throw err;

      router.push(`/podcasts/${data.id}`);
    } catch (err: unknown) {
      setError(getProductErrorMessage(err, "Error creating podcast"));
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-narrow space-y-6">
        <div>
          <Link href="/podcasts" className="inline-link mb-4 block">
            ← Back to Podcasts
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Create New Podcast</h1>
        </div>

        <div className="card-elevated p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="label">Podcast Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Podcast"
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell listeners what your podcast is about..."
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
                {loading ? "Creating..." : "Create Podcast"}
              </button>
              <Link href="/podcasts" className="btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
