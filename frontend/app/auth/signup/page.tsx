"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const err = await signUp(email, password, name);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-gray-500 text-sm group-hover:text-gray-900 transition-colors">
            LearnBridge
          </span>
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Free forever. No credit card needed.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-1.5 block font-medium">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Asha Patel"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1.5 block font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-sm transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-all text-sm mt-2"
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up you agree to our{" "}
          <span className="text-gray-700 font-medium">Terms of Service</span>.
        </p>
        <p className="text-center text-gray-500 text-sm mt-3">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
