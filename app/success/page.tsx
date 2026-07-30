"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useI18n } from "@/lib/i18n/context";

export default function SuccessPage() {
  const clear = useCart((s) => s.clear);
  const { t } = useI18n();

  // El pago se completó: vaciamos el carrito.
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="flex h-dvh w-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-[10px] uppercase tracking-[0.35em] opacity-60">
        {t.success.tag}
      </p>
      <h1 className="text-3xl font-bold uppercase tracking-tight md:text-5xl">
        {t.success.title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
        {t.success.body}
      </p>
      <Link
        href="/product"
        className="mt-10 border border-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
      >
        {t.success.cta}
      </Link>
    </main>
  );
}
