"use client";

import { Lock } from "lucide-react";
import Reveal from "@/components/reveal";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

/**
 * Fila "incógnito" del catálogo: un solo cuadro (04–05) que adelanta el
 * Drop 1.5. El cuadro incluye el candado y el texto "Drop 1.5 · Próximamente".
 */
export default function ProductTeaser() {
  const { t } = useI18n();

  return (
    <Reveal className="grid items-center gap-6 md:grid-cols-2 md:gap-16">
      {/* Cuadro único incógnito (derecha en desktop, abajo del título en móvil) */}
      <div className="order-2 md:order-2">
        <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-sm bg-surface [container-type:inline-size]">
          {/* Mismo tratamiento que el catálogo: número abajo a la derecha. */}
          <span
            className="pointer-events-none absolute bottom-[3%] right-[8%] text-[19cqw] font-bold leading-none opacity-15"
            style={{ fontFamily: HELVETICA }}
          >
            04-05
          </span>
          <Lock
            size={40}
            strokeWidth={1.25}
            className="text-foreground opacity-25"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-foreground opacity-50">
            Drop 1.5 · {t.home.comingSoon}
          </p>
        </div>
      </div>

      {/* Título: en móvil se monta sobre el borde del cuadro, como el catálogo */}
      <div className="relative z-10 order-1 -mb-12 flex flex-col md:order-1 md:mb-0">
        <h2
          className="text-5xl font-bold uppercase leading-none tracking-tighter opacity-25 md:text-7xl"
          style={{ fontFamily: HELVETICA }}
        >
          IDG - ??
        </h2>
      </div>
    </Reveal>
  );
}
