export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function getErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) return "";
  const maybeCode = (error as { code?: unknown }).code;
  return typeof maybeCode === "string" ? maybeCode : "";
}

export function isMissingTableError(error: unknown): boolean {
  const message = getErrorMessage(error, "").toLowerCase();
  const code = getErrorCode(error);

  if (code === "PGRST205") return true;

  return (
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("status of 404")
  );
}

export function getProductErrorMessage(error: unknown, fallback: string): string {
  if (isMissingTableError(error)) {
    return "Database schema is not initialized yet. Run SQL migrations 001_initial_schema.sql and 002_hardening_and_profiles.sql in Supabase SQL Editor.";
  }

  const message = getErrorMessage(error, fallback);
  if (message.toLowerCase().includes("rate limit")) {
    return "Too many requests for now. Please wait briefly and try again.";
  }

  return message;
}
