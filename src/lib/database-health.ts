import { supabase } from "@/lib/supabase";
import { getProductErrorMessage, isMissingTableError } from "@/lib/errors";

export interface DatabaseHealthResult {
  ready: boolean;
  message: string;
  missingTables: string[];
}

async function tableExists(table: string): Promise<{ exists: boolean; error: unknown }> {
  const { error } = await supabase.from(table).select("id").limit(1);
  return { exists: !error, error };
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const requiredTables = [
    "podcasts",
    "episodes",
    "subscriptions",
    "episode_listens",
    "profiles",
  ];

  const checks = await Promise.all(requiredTables.map((table) => tableExists(table)));

  const missingTables = requiredTables.filter((_, idx) => !checks[idx].exists);

  if (missingTables.length === 0) {
    return {
      ready: true,
      message: "Database schema is ready.",
      missingTables: [],
    };
  }

  const firstError = checks.find((c) => !c.exists)?.error;
  const isMissingSchema = isMissingTableError(firstError);

  return {
    ready: false,
    message: isMissingSchema
      ? "Database schema is missing. Please run both migration SQL files in Supabase SQL Editor."
      : getProductErrorMessage(firstError, "Database check failed."),
    missingTables,
  };
}
