"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/errors";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { session, isReady } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isReady && session) {
      router.push("/dashboard");
    }
  }, [session, isReady, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user) {
        setSuccessMessage("Signed in successfully. Redirecting...");

        setTimeout(() => {
          router.push("/dashboard");
        }, 700);
      }
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Unexpected sign-in failure."));
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen page-shell flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-shell flex items-center justify-center p-4">
      <div className="w-full max-w-md card-elevated p-8">
        <div className="mb-8">
          <p className="chip mb-3">Creator Access</p>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted">Sign in to continue building your show</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {successMessage ? (
            <div className="notice-success">{successMessage}</div>
          ) : null}

          {errorMessage ? (
            <div className="notice-error">{errorMessage}</div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-sm text-muted text-center">
            New here?{" "}
            <Link href="/" className="inline-link font-semibold">
              Create account
            </Link>
          </p>
        </div>

        <div className="mt-4 panel-subtle text-xs space-y-1">
          <p className="font-semibold">Tip</p>
          <p>If signup is rate-limited, wait for cooldown and use this login page for repeat testing.</p>
        </div>
      </div>
    </div>
  );
}
