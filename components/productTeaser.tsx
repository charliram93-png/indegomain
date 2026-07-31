"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

/**
 * Fila "incógnito" del catálogo: producto misterioso para un futuro Drop 1.5.
 * Mismo layout editorial que ProductCard, pero bloqueado (no clickable).
 */
export default function ProductTeaser({ index }: { index: number }) {
  const reversed = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid items-center gap-6 md:grid-cols-2 md:gap-16"
    >
      {/* Cuadro incógnito */}
      <div className={reversed ? "md:order-2" : ""}>
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm bg-surface">
          <span className="pointer-events-none absolute left-4 top-2 text-7xl font-bold leading-none opacity-10 md:text-9xl">
            {number}
          </span>
          <Lock
            size={40}
            strokeWidth={1.25}
            className="text-foreground opacity-20"
          />
        </div>
      </div>

      {/* Info bloqueada */}
      <div className={`flex flex-col ${reversed ? "md:order-1" : ""}`}>
        <h2 className="text-5xl font-bold uppercase leading-none tracking-tighter opacity-25 md:text-7xl">
          IDG — ??
        </h2>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.3em] opacity-40">
          Drop 1.5 · Próximamente
        </p>
      </div>
    </motion.div>
  );
}
