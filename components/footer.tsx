"use client";

import Link from "next/link";
import { CONTACT_EMAIL, INSTAGRAM_URL, LINKTREE_URL } from "@/config/brand";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

const linkClass = "transition-opacity hover:opacity-40";

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    /* Toda la tipografía del pie va en la Helvetica del sitio (se hereda). */
    <footer
      className="mt-auto w-full bg-background px-6 py-12"
      style={{ fontFamily: HELVETICA }}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {/*
          ENLACES. El orden es a propósito: primero lo que resuelve un problema
          (dónde va mi pedido, qué dicen los términos) y después lo de la marca.
          Quien llega al pie buscando algo, casi siempre busca lo primero.

          Contacto e Instagram solo salen si están puestos en `config/brand.ts`
          — así nunca se publica un dato inventado.
        */}
        {/* Sin negritas (prueba de ago-2026): los enlaces del pie son de
            servicio, no tienen que competir con el resto de la página. */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.08em] text-foreground md:text-[11px]">
          {/* Seguimiento del pedido. Va SIEMPRE (no depende de config): es
              soporte, no un dato de contacto que pueda faltar. */}
          <Link href="/order" className={linkClass}>
            {t.footer.order}
          </Link>

          <Link href="/terms" className={linkClass}>
            {t.footer.terms}
          </Link>

          <Link href={LINKTREE_URL} target="_blank" className={linkClass}>
            {t.footer.linktree}
          </Link>

          {INSTAGRAM_URL && (
            <Link href={INSTAGRAM_URL} target="_blank" className={linkClass}>
              {t.footer.instagram}
            </Link>
          )}

          {CONTACT_EMAIL && (
            <Link href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {t.footer.contact}
            </Link>
          )}
        </div>

        {/* COPYRIGHT O MARCA. En cursiva, para que no compita con los enlaces. */}
        <p className="text-[9px] italic uppercase tracking-[0.06em] text-foreground opacity-40">
          {t.footer.rights}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
