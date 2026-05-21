"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push(params.get("from") ?? "/");
    } else {
      setErr(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07060f]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-white text-xl font-bold tracking-tight">Ops Dashboard</h1>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-violet-500"
        />
        {err && <p className="text-red-400 text-sm">Wrong password</p>}
        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 font-medium transition-colors">
          Enter
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
