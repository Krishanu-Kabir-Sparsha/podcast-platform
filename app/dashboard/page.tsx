"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { user, session, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Podcast Platform</h1>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-gray-700 text-sm font-mono">
                    {user?.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user?.email?.split("@")[0]}! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                You're all set to start creating podcasts. Use the menu below to
                get started.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/podcasts"
                  className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition"
                >
                  <div className="text-2xl mb-2">📻</div>
                  <h3 className="font-semibold text-gray-900">My Podcasts</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    View and manage your podcasts
                  </p>
                </a>

                <a
                  href="/podcasts/new"
                  className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <h3 className="font-semibold text-gray-900">
                    Create Podcast
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Start a new podcast
                  </p>
                </a>

                <a
                  href="/episodes"
                  className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition"
                >
                  <div className="text-2xl mb-2">🎙️</div>
                  <h3 className="font-semibold text-gray-900">Episodes</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Upload new episodes
                  </p>
                </a>

                <a
                  href="/stats"
                  className="bg-orange-50 border border-orange-200 rounded-lg p-6 hover:bg-orange-100 transition"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-900">Statistics</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    View your podcast stats
                  </p>
                </a>
              </div>
            </div>

            {/* Auth Status */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Authentication working!</strong> Your session is
                active and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
