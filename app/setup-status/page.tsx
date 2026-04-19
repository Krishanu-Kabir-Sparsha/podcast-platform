"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { checkDatabaseHealth, type DatabaseHealthResult } from "@/lib/database-health";

const FALLBACK: DatabaseHealthResult = {
  ready: false,
  message: "Checking database...",
  missingTables: [],
};

export default function SetupStatusPage() {
  const { isReady, session } = useAuth();
  const [status, setStatus] = useState<DatabaseHealthResult>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !session) return;

    const runCheck = async () => {
      setLoading(true);
      const result = await checkDatabaseHealth();
      setStatus(result);
      setLoading(false);
    };

    runCheck();
  }, [isReady, session]);

  return (
    <div className="page-shell min-h-screen p-6 md:p-10">
      <div className="container-narrow space-y-6">
        <div>
          <Link href="/dashboard" className="inline-link mb-4 block">
            ← Dashboard
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Setup Status</h1>
          <p className="text-muted mt-2">Live check of your Supabase schema and readiness.</p>
        </div>

        <div className="card-elevated p-6">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="loader" />
              <p className="text-muted">Checking database setup...</p>
            </div>
          ) : status.ready ? (
            <div className="notice-success">
              <p className="font-semibold">Database ready</p>
              <p className="mt-1">All required tables are available. You can create podcasts and episodes now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="notice-error">
                <p className="font-semibold">Database not ready</p>
                <p className="mt-1">{status.message}</p>
              </div>

              {status.missingTables.length > 0 ? (
                <div className="panel-subtle rounded-lg p-4">
                  <p className="font-semibold">Missing tables</p>
                  <p className="text-sm text-muted mt-1">{status.missingTables.join(", ")}</p>
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="panel-subtle rounded-lg p-4 space-y-3">
                  <p className="font-semibold">Recommended fix</p>
                  <p className="text-sm text-muted">
                    Apply the migrations from your project to Supabase. That is the reliable path for production and keeps the schema under version control.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>1. Open the Supabase Dashboard for this project.</p>
                    <p>2. Go to <span className="font-semibold">SQL Editor</span>.</p>
                    <p>3. Run <span className="font-semibold">supabase/migrations/001_initial_schema.sql</span>.</p>
                    <p>4. Run <span className="font-semibold">supabase/migrations/002_hardening_and_profiles.sql</span>.</p>
                    <p>5. Open <span className="font-semibold">Table Editor</span> and confirm the missing tables are present.</p>
                    <p>6. Come back here and refresh this page.</p>
                  </div>
                </div>

                <div className="panel-subtle rounded-lg p-4 space-y-3">
                  <p className="font-semibold">Local CLI alternative</p>
                  <p className="text-sm text-muted">
                    If you have the Supabase CLI installed, push the migrations from this project folder instead of opening the dashboard manually.
                  </p>
                  <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs leading-6">
                    <code>{`supabase login
supabase link --project-ref <your-project-ref>
supabase db push`}</code>
                  </pre>
                  <p className="text-xs text-muted">
                    In this repo, the same workflow is also available as a single command: <span className="font-semibold">npm run supabase:setup</span>. It prompts for login only when needed.
                  </p>
                </div>

                <div className="panel-subtle rounded-lg p-4 space-y-3">
                  <p className="font-semibold">Quick verification query</p>
                  <p className="text-sm text-muted">
                    Use this in SQL Editor to confirm the required tables exist:
                  </p>
                  <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs leading-6">
                    <code>{`select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('podcasts', 'episodes', 'subscriptions', 'episode_listens', 'profiles')
order by table_name;`}</code>
                  </pre>
                </div>

                <div className="panel-subtle rounded-lg p-4 space-y-3">
                  <p className="font-semibold">Production troubleshooting</p>
                  <div className="space-y-2 text-sm">
                    <p>1. Confirm the production project ref matches the deployed environment variables.</p>
                    <p>2. Push the migrations to the production project with the CLI.</p>
                    <p>3. Verify the missing tables in Table Editor.</p>
                    <p>4. Refresh this page until it reports database ready.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
