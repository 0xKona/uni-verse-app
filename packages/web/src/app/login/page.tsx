"use client";
import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-transparent text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-transparent text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-zinc-800 dark:bg-white text-white dark:text-zinc-800 rounded-lg py-2 font-medium hover:opacity-90 transition-opacity">
          Sign In
        </button>
        <a href="/signup" className="text-sm text-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
          No account? Sign up
        </a>
      </form>
    </div>
  );
}
