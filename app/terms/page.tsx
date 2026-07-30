"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

/*
  BASE EDITABLE. Los textos viven en `lib/i18n/dictionaries.ts` (terms).
  Reemplaza lo que está entre [corchetes] con tus datos reales
  (razón social, correo, tiempos de envío, política de cambios, etc.).
  Recomendación: revísalo con un abogado antes del lanzamiento.
*/
export default function TermsPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground md:px-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.3em] opacity-50 transition-opacity hover:opacity-100"
        >
          {t.terms.back}
        </Link>

        <h1 className="mt-8 text-3xl font-bold uppercase tracking-tight md:text-4xl">
          {t.terms.title}
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-widest opacity-50">
          {t.terms.updatedLabel} {t.terms.updated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed opacity-90">
          {t.terms.sections.map((section) => (
            <section key={section.h}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">
                {section.h}
              </h2>
              <p>{section.p}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-[9px] uppercase tracking-widest opacity-30">
          {t.footer.rights}
        </p>
      </div>
    </main>
  );
}
