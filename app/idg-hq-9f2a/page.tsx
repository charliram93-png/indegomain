"use client";

import Link from "next/link";
import { PANEL_GROUPS } from "@/config/panel";
import { PANEL_PATH } from "@/lib/adminAuth";

export default function PanelPage() {
  const handleLogout = async () => {
    await fetch("/api/panel/logout", { method: "POST" });
    window.location.href = `${PANEL_PATH}/login`;
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground md:flex-row">
      {/* MENÚ LATERAL */}
      <aside className="flex w-full flex-col border-b border-foreground/10 bg-surface/30 p-6 md:h-dvh md:w-72 md:border-b-0 md:border-r md:overflow-y-auto md:sticky md:top-0">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-40">
            Indego Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold uppercase tracking-tighter">
            Panel
          </h1>
        </div>

        <nav className="flex-1 space-y-6">
          {PANEL_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.links.map((link) => {
                  const content = (
                    <span className="flex items-center justify-between py-2 text-xs uppercase tracking-tight transition-opacity hover:opacity-100">
                      <span>{link.label}</span>
                      <span className="opacity-40">
                        {link.soon ? "◦" : link.external ? "↗" : "→"}
                      </span>
                    </span>
                  );
                  const cls = `block ${
                    link.soon ? "pointer-events-none opacity-40" : "opacity-80"
                  }`;
                  return (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cls}
                          title={link.note}
                        >
                          {content}
                        </a>
                      ) : (
                        <Link href={link.href} className={cls} title={link.note}>
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 text-left text-[10px] font-bold uppercase tracking-[0.25em] opacity-50 transition-opacity hover:opacity-100"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8 md:p-14">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] opacity-40">
            Centro de operaciones
          </p>
          <h2 className="mt-2 text-4xl font-bold uppercase tracking-tighter md:text-5xl">
            Bienvenido
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-60">
            Usa el menú de la izquierda para acceder a tus herramientas. Aquí
            aparecerán las <strong>ventas y el stock del drop</strong> cuando
            conectemos la base de datos.
          </p>

          {/* Placeholder de métricas (próximamente) */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {["Ventas", "Pedidos", "Stock"].map((label) => (
              <div
                key={label}
                className="border border-foreground/10 bg-surface/30 p-5"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold opacity-30">—</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest opacity-30">
                  Próximamente
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
