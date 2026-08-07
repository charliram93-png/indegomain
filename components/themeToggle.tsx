"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/context";
import { useMontado } from "@/lib/useMontado";

/**
 * Botón para alternar claro/oscuro. Muestra el ícono del tema actual.
 * `variant="light"` para colocarlo sobre fondos oscuros fijos (ej. la home).
 */
export default function ThemeToggle({
  variant = "auto",
}: {
  variant?: "auto" | "light";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  /* El tema sale de lo guardado en el navegador, que el servidor no puede
     saber; hasta montar se asume claro. Ver `lib/useMontado.ts`. */
  const montado = useMontado();

  const isDark = montado ? resolvedTheme === "dark" : false;

  const color =
    variant === "light" ? "text-cream" : "text-foreground";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.nav.toLight : t.nav.toDark}
      className={`${color} p-2 opacity-70 outline-none transition-opacity hover:opacity-100`}
    >
      {/* Evita mismatch de hidratación: hasta montar, un placeholder neutro. */}
      {!montado ? (
        <Sun size={18} strokeWidth={1.5} className="opacity-0" />
      ) : isDark ? (
        <Sun size={18} strokeWidth={1.5} />
      ) : (
        <Moon size={18} strokeWidth={1.5} />
      )}
    </button>
  );
}
