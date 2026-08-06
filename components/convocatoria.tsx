"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Reveal from "@/components/reveal";
import { CONVOCATORIA, ACEPTA } from "@/config/convocatoria";
import { LINKTREE_URL } from "@/config/brand";
import { useI18n } from "@/lib/i18n/context";

/**
 * "NUESTROS MUSEOS ESTÁN VACÍOS" — la convocatoria que CIERRA el Nosotros.
 *
 * QUÉ ES: una puerta abierta. Quien haga algo lo manda por aquí y se puede
 * colaborar. Va DESPUÉS de la banda que lleva al catálogo, a propósito: la
 * página termina pidiendo algo en vez de vendiendo algo.
 *
 * POR QUÉ NO ES UN "CONTÁCTANOS": un formulario de contacto se lee como
 * soporte al cliente. Este pide una obra y lo dice con el título; el
 * formulario es lo de menos, el gesto es la invitación.
 *
 * QUÉ PASA AL ENVIAR: se va a `app/api/convocatoria/route.ts`, que lo guarda
 * en Cloudinary (ver el porqué en `config/convocatoria.ts`). Si algo falla
 * —incluso que falten las llaves de Cloudinary— se dice claro y se ofrece el
 * Linktree, para que nadie se quede sin por dónde escribir.
 *
 * SE VALIDA DE LOS DOS LADOS: aquí para avisar rápido (peso y formato del
 * archivo) y en el servidor de verdad, porque esto se puede saltar.
 */

/** Mismo estilo de etiqueta que la página de pedido y el carrito. */
const etiqueta = "block text-[10px] font-bold uppercase tracking-[0.08em] opacity-50";
/** Campos sin recuadro: una línea abajo, como en todo el sitio. */
const campo =
  "mt-2 w-full border-b border-foreground/20 bg-transparent pb-2 text-base outline-none transition-colors placeholder:opacity-25 focus:border-foreground";

export default function Convocatoria() {
  const { t, lang } = useI18n();
  const inputArchivo = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Solo se enseña el Linktree cuando la falla NO es culpa de lo que escribió
     la persona: si el archivo pesa de más, mandarla a otro lado no ayuda. */
  const [ofrecerSalida, setOfrecerSalida] = useState(false);

  if (!CONVOCATORIA.activa) return null;

  const limiteBytes = CONVOCATORIA.maxMB * 1024 * 1024;
  const permitidos: readonly string[] = CONVOCATORIA.formatos;

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    setOfrecerSalida(false);

    if (!f) return setArchivo(null);

    if (!permitidos.includes(f.type)) {
      setArchivo(null);
      e.target.value = "";
      return setError(t.convocatoria.errorType);
    }
    if (f.size > limiteBytes) {
      setArchivo(null);
      e.target.value = "";
      return setError(t.convocatoria.errorTooBig);
    }
    setArchivo(f);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    if (inputArchivo.current) inputArchivo.current.value = "";
  };

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    // Se toma AQUÍ, antes de cualquier `await`: pasado el turno del evento,
    // `currentTarget` ya viene vacío y el envío saldría sin campos.
    const datos = new FormData(e.currentTarget);

    setEnviando(true);
    setError(null);
    setOfrecerSalida(false);

    try {
      // Se manda el formulario tal cual (multipart), que es lo único que sabe
      // llevar un archivo. El campo trampa `sitio` viaja incluido.
      const res = await fetch("/api/convocatoria", {
        method: "POST",
        body: datos,
      });

      if (res.ok) {
        setListo(true);
        return;
      }

      const { error: motivo } = (await res
        .json()
        .catch(() => ({ error: "fallo" }))) as { error?: string };

      if (motivo === "faltan_campos" || motivo === "muy_largo") {
        setError(t.convocatoria.errorFields);
      } else if (motivo === "formato") {
        setError(t.convocatoria.errorType);
      } else if (motivo === "muy_pesado") {
        setError(t.convocatoria.errorTooBig);
      } else if (res.status === 429) {
        setError(t.convocatoria.errorTooMany);
      } else {
        setError(t.convocatoria.error);
        setOfrecerSalida(true);
      }
    } catch {
      setError(t.convocatoria.error);
      setOfrecerSalida(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    /* La línea de arriba es lo que la separa de la banda invertida que tiene
       encima; sin ella las dos se leían como una sola cosa. */
    <section className="border-t border-foreground/10 px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          {/*
            SIN ANTETÍTULO. Antes tenía un "CONVOCATORIA ABIERTA" chiquito
            encima; se quitó (6-ago-2026) porque le explicaba a la frase lo que
            la frase ya dice, y la volvía un apartado más de la página en vez de
            un golpe. La sección arranca en seco con el titular.

            Del tamaño del título de la página: es el segundo golpe de la
            lectura, no un subtítulo.
          */}
          <h2
            className="font-bold uppercase"
            style={{
              fontSize: "clamp(2.2rem, 8vw, 6rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            {CONVOCATORIA.titulo[lang]}
          </h2>
        </Reveal>

        {/* Misma rejilla asimétrica del resto del Nosotros: la invitación a la
            izquierda, el formulario descolgado a la derecha. */}
        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <p className="max-w-sm text-base leading-[1.75] opacity-70 md:text-lg">
              {CONVOCATORIA.entrada[lang]}
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            {listo ? (
              /* ACUSE. Reemplaza al formulario en lugar de ponerse encima:
                 quien ya mandó no necesita volver a ver los campos. */
              <div>
                <p className="text-2xl font-bold uppercase tracking-tight">
                  {t.convocatoria.doneTitle}
                </p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-60">
                  {t.convocatoria.doneBody}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setListo(false);
                    quitarArchivo();
                  }}
                  className="mt-8 cursor-pointer py-2 text-xs font-bold uppercase tracking-[0.08em] opacity-50 transition-opacity hover:opacity-100"
                >
                  {t.convocatoria.again}
                </button>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-8">
                {/* TRAMPA PARA ROBOTS. Escondida de la vista Y del teclado y de
                    los lectores de pantalla (`aria-hidden` + `tabIndex`), para
                    que ninguna persona la llene por accidente. La revisa el
                    servidor. */}
                <input
                  type="text"
                  name="sitio"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <div>
                  <label htmlFor="conv-nombre" className={etiqueta}>
                    {t.convocatoria.nameLabel}
                  </label>
                  <input
                    id="conv-nombre"
                    name="nombre"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={t.convocatoria.namePlaceholder}
                    className={campo}
                  />
                </div>

                <div>
                  <label htmlFor="conv-contacto" className={etiqueta}>
                    {t.convocatoria.contactLabel}
                  </label>
                  {/* A propósito NO es `type="email"`: mucha gente vive en
                      Instagram y no quiere dar correo. Cabe cualquiera de los
                      dos, y por eso tampoco se valida el formato. */}
                  <input
                    id="conv-contacto"
                    name="contacto"
                    required
                    maxLength={200}
                    autoComplete="email"
                    placeholder={t.convocatoria.contactPlaceholder}
                    className={campo}
                  />
                </div>

                <div>
                  <label htmlFor="conv-mensaje" className={etiqueta}>
                    {t.convocatoria.messageLabel}
                  </label>
                  <textarea
                    id="conv-mensaje"
                    name="mensaje"
                    required
                    maxLength={4000}
                    rows={4}
                    placeholder={t.convocatoria.messagePlaceholder}
                    className={`${campo} resize-y leading-relaxed`}
                  />
                </div>

                <div>
                  <span className={etiqueta}>{t.convocatoria.fileLabel}</span>

                  {/* El input de archivo del navegador no se puede estilizar y
                      se veía como de otro sitio. Va escondido y lo dispara el
                      botón de texto, que sí es del sitio. */}
                  <input
                    ref={inputArchivo}
                    id="conv-archivo"
                    type="file"
                    name="archivo"
                    accept={ACEPTA}
                    onChange={elegirArchivo}
                    className="sr-only"
                  />

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <label
                      htmlFor="conv-archivo"
                      className="cursor-pointer text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-4 transition-opacity hover:opacity-50"
                    >
                      {archivo
                        ? t.convocatoria.fileChange
                        : t.convocatoria.filePick}
                    </label>

                    {archivo && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs opacity-60">
                          {archivo.name}
                        </span>
                        <button
                          type="button"
                          onClick={quitarArchivo}
                          className="cursor-pointer text-xs uppercase tracking-[0.08em] opacity-40 transition-opacity hover:opacity-100"
                        >
                          {t.convocatoria.fileRemove}
                        </button>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.06em] opacity-30">
                    {t.convocatoria.fileHint}
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-fit cursor-pointer py-2 text-xs font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {enviando
                      ? t.convocatoria.sending
                      : t.convocatoria.submit}
                  </button>

                  <p className="mt-4 max-w-sm text-[10px] leading-relaxed opacity-30">
                    {t.convocatoria.privacy}
                  </p>
                </div>
              </form>
            )}

            {error && (
              <p
                role="alert"
                className="mt-6 max-w-sm text-xs leading-relaxed text-accent"
              >
                {error}
                {ofrecerSalida && (
                  <>
                    {" "}
                    <Link
                      href={LINKTREE_URL}
                      target="_blank"
                      className="underline underline-offset-4"
                    >
                      {t.convocatoria.fallback}
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
