"use client";

import { useI18n } from "@/lib/i18n/context";
import { useMontado } from "@/lib/useMontado";

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
  /* Vacío hasta montar: el idioma sale de lo guardado en el navegador, que el
     servidor no puede saber. Ver `lib/useMontado.ts`. */
  const montado = useMontado();

  const color = variant === "light" ? "text-cream" : "text-foreground";
  const label = montado ? lang.toUpperCase() : "";

  return (
    <button
      onClick={toggleLang}
      aria-label="Cambiar idioma / Change language"
      className={`${color} min-w-8 p-2 text-[11px] font-bold tracking-[0.02em] opacity-70 outline-none transition-opacity hover:opacity-100`}
    >
      {label || " "}
    </button>
  );
}
