"use client"

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="w-full mt-auto py-12 px-6 bg-background">
      <div className="flex flex-col items-center justify-center gap-4">

        {/* ENLACES CENTRALES */}
        <div className="flex items-center gap-8 text-foreground font-medium text-[10px] md:text-[11px] tracking-[0.03em] uppercase">
          <Link
            href="/terms"
            className="hover:opacity-40 transition-opacity"
          >
            {t.footer.terms}
          </Link>

          <Link
            href="https://linktr.ee/INDEGOSTUDIO"
            target="_blank"
            className="hover:opacity-40 transition-opacity"
          >
            {t.footer.linktree}
          </Link>
        </div>

        {/* COPYRIGHT O MARCA */}
        <p className="text-foreground opacity-30 text-[9px] uppercase">
          {t.footer.rights}
        </p>
      </div>
    </footer>
  );
};

export default Footer;