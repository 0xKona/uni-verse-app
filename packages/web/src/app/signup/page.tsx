"use client";
import { useState } from "react";
import { register, confirm } from "@/lib/auth";
import { useRouter } from "next/navigation";

const inputClass = "border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 bg-transparent text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400";
const btnClass = "bg-zinc-800 dark:bg-white text-white dark:text-zinc-800 rounded-lg py-2 font-medium hover:opacity-90 transition-opacity";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"register" | "confirm">("register");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password);
      setStep("confirm");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await confirm(email, code);
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    }
  };

  if (step === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <form onSubmit={handleConfirm} className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white">Confirm Email</h1>
          <p className="text-sm text-zinc-500">A verification code was sent to <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span></p>
          <input type="text" placeholder="Confirmation code" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClass} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className={btnClass}>Confirm</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <form onSubmit={handleRegister} className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white">Sign Up</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className={btnClass}>Create Account</button>
        <a href="/login" className="text-sm text-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
          Already have an account? Login
        </a>
      </form>
    </div>
  );
}
