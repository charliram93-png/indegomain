"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

/**
 * Alterna el idioma EN <-> ES. Muestra el idioma ACTUAL.
 * `variant="light"` para fondos oscuros fijos (ej. la home).
 */
export default function LangToggle({
  variant = "auto",
}: {
  variant?: "auto" | "light";
}) {
  const { lang, toggleLang } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const color = variant === "light" ? "text-cream" : "text-foreground";
  const label = mounted ? lang.toUpperCase() : "";

  return (
    <button
      onClick={toggleLang}
      aria-label="Cambiar idioma / Change language"
      className={`${color} min-w-8 p-2 text-[11px] font-bold tracking-widest opacity-70 outline-none transition-opacity hover:opacity-100`}
    >
      {label || " "}
    </button>
  );
}
