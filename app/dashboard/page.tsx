"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, session, loading, isReady, signOut } = useAuth();

  useEffect(() => {
    if (isReady && !session) {
      router.push("/");
    }
  }, [session, isReady, router]);

  if (!isReady || loading) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4" />
          <p className="text-muted">Initializing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-wide space-y-6">
        <header className="card-elevated p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="chip mb-3">Control Room</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Podcast Platform</h1>
            <p className="text-muted mt-1">Build, publish, and track your shows in one place.</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="btn-danger"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">
                Your Profile
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase">
                    Email
                  </p>
                  <p className="font-medium break-all">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase">
                    User ID
                  </p>
                  <p className="text-xs font-mono text-muted">
                    {user?.id?.substring(0, 12)}...
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">Authenticated</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-8">
            <div className="card-elevated p-8">
              <h2 className="text-3xl font-semibold mb-2">
                Welcome, {user?.email?.split("@")[0]}! 👋
              </h2>
              <p className="text-muted mb-6">
                Everything is connected. Start publishing episodes, tune metadata, and track growth.
              </p>

              <div className="notice-success mb-6">
                <p className="text-sm">
                  <strong>Ready to ship:</strong> your account is active and all core pages are actionable.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/podcasts"
                  className="card-elevated p-6 card-hover"
                >
                  <div className="text-3xl mb-2">📻</div>
                  <h3 className="font-semibold">My Podcasts</h3>
                  <p className="text-sm text-muted mt-2">
                    View and manage your podcasts
                  </p>
                </Link>

                <Link
                  href="/podcasts/new"
                  className="card-elevated p-6 card-hover"
                >
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="font-semibold">
                    Create Podcast
                  </h3>
                  <p className="text-sm text-muted mt-2">
                    Start a new podcast
                  </p>
                </Link>

                <Link
                  href="/episodes"
                  className="card-elevated p-6 card-hover"
                >
                  <div className="text-3xl mb-2">🎙️</div>
                  <h3 className="font-semibold">Episodes</h3>
                  <p className="text-sm text-muted mt-2">
                    Upload and manage episodes
                  </p>
                </Link>

                <Link
                  href="/stats"
                  className="card-elevated p-6 card-hover"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold">Statistics</h3>
                  <p className="text-sm text-muted mt-2">
                    View your platform metrics
                  </p>
                </Link>

                <Link
                  href="/setup-status"
                  className="card-elevated p-6 card-hover"
                >
                  <div className="text-3xl mb-2">🧪</div>
                  <h3 className="font-semibold">Setup Status</h3>
                  <p className="text-sm text-muted mt-2">
                    Verify database schema and environment health
                  </p>
                </Link>
              </div>
            </div>

            <div className="panel-subtle rounded-lg p-6">
              <h3 className="font-semibold mb-3">Getting Started</h3>
              <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
                <li>Click &quot;Create Podcast&quot; to add your first podcast</li>
                <li>Fill in the podcast title and description</li>
                <li>Add episodes and metadata from the episode flow</li>
                <li>Check &quot;Statistics&quot; to see your platform activity</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
