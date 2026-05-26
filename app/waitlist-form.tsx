"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await joinWaitlist(email);
      setResult(res);
      if (res.success) setEmail("");
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return (
      <div className="flex items-center justify-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-6 py-4 max-w-md mx-auto">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{result.message}</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 h-12 px-4 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="h-12 px-6 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center shrink-0 transition-colors"
        >
          {loading ? "Joining..." : "Request Access"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      {result && !result.success && (
        <p className="text-sm text-red-500 mt-2 text-center">{result.message}</p>
      )}
    </div>
  );
}
