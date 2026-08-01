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
        {/* ENLACES. Contacto e Instagram solo salen si están puestos en
            `config/brand.ts` — así nunca se publica un dato inventado. */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground md:text-[11px]">
          {INSTAGRAM_URL && (
            <Link href={INSTAGRAM_URL} target="_blank" className={linkClass}>
              {t.footer.instagram}
            </Link>
          )}

          <Link href={LINKTREE_URL} target="_blank" className={linkClass}>
            {t.footer.linktree}
          </Link>

          {CONTACT_EMAIL && (
            <Link href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {t.footer.contact}
            </Link>
          )}

          <Link href="/terms" className={linkClass}>
            {t.footer.terms}
          </Link>
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
