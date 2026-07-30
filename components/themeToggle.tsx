"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const color =
    variant === "light" ? "text-cream" : "text-foreground";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`${color} p-2 opacity-70 outline-none transition-opacity hover:opacity-100`}
    >
      {/* Evita mismatch de hidratación: hasta montar, un placeholder neutro. */}
      {!mounted ? (
        <Sun size={18} strokeWidth={1.5} className="opacity-0" />
      ) : isDark ? (
        <Sun size={18} strokeWidth={1.5} />
      ) : (
        <Moon size={18} strokeWidth={1.5} />
      )}
    </button>
  );
}
