"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/**
 * Fila "incógnito" del catálogo: un solo cuadro (04–05) que adelanta el
 * Drop 1.5. El cuadro incluye el candado y el texto "Drop 1.5 · Próximamente".
 */
export default function ProductTeaser() {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid items-center gap-6 md:grid-cols-2 md:gap-16"
    >
      {/* Cuadro único incógnito */}
      <div>
        <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-sm bg-surface">
          <span className="pointer-events-none absolute left-4 top-2 text-6xl font-bold leading-none opacity-10 md:text-8xl">
            04–05
          </span>
          <Lock
            size={40}
            strokeWidth={1.25}
            className="text-foreground opacity-25"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground opacity-50">
            Drop 1.5 · {t.home.comingSoon}
          </p>
        </div>
      </div>

      {/* Título */}
      <div className="flex flex-col">
        <h2 className="text-5xl font-bold uppercase leading-none tracking-tighter opacity-25 md:text-7xl">
          IDG — ??
        </h2>
      </div>
    </motion.div>
  );
}
