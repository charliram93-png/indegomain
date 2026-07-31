"use client";

import { useState } from "react";
import { PANEL_PATH } from "@/lib/adminAuth";

export default function PanelLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = PANEL_PATH;
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo iniciar sesión");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <p className="mb-8 text-center text-[11px] font-bold uppercase tracking-[0.08em] opacity-50">
          Indego · Panel
        </p>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.03em] opacity-50">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full border border-foreground/20 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
        />
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full bg-foreground py-4 text-[10px] font-bold uppercase tracking-[0.06em] text-background transition-all hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
