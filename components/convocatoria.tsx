"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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

/**
 * EL LLAMADO: el titular y la invitación. Es el PRIMERO de los dos paneles de
 * la convocatoria; el segundo es el formulario (el `export default` de abajo).
 *
 * SIN ANTETÍTULO. Antes tenía un "CONVOCATORIA ABIERTA" chiquito encima; se
 * quitó (6-ago-2026) porque le explicaba a la frase lo que la frase ya dice, y
 * la volvía un apartado más de la página en vez de un golpe. Arranca en seco
 * con el titular, del tamaño del título de la página.
 */
export function ConvocatoriaLlamado() {
  const { lang } = useI18n();
  if (!CONVOCATORIA.activa) return null;

  return (
    /*
      SIN `overflow-y-auto` AQUÍ, a propósito: el que se recorre es el PANEL de
      afuera. Si esta sección lo llevara, se quedaría con el desbordamiento y
      el panel nunca sabría que hay más contenido — que es lo que decide la
      rueda del ratón en `app/about/page.tsx`. Dejándolo suelto, lo que se sale
      llega al panel y todo se recorre igual que en los demás.

      `justify-center-safe`: centra mientras quepa y, cuando no cabe (celular
      acostado), se pega arriba en vez de comerse el titular por arriba.
    */
    <section className="flex h-full flex-col justify-center-safe px-6 py-6 md:px-12">
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

      <p className="mt-8 max-w-md text-base leading-[1.75] opacity-70 md:mt-12 md:text-lg">
        {CONVOCATORIA.entrada[lang]}
      </p>
    </section>
  );
}

/** Mismo estilo de etiqueta que la página de pedido y el carrito. */
const etiqueta =
  "block text-[10px] font-bold uppercase tracking-[0.08em] opacity-50";
/** Campos sin recuadro: una línea abajo, como en todo el sitio. */
const campo =
  "mt-2 w-full border-b border-foreground/20 bg-transparent pb-2 text-base outline-none transition-colors placeholder:opacity-25 focus:border-foreground";

export default function Convocatoria() {
  const { t } = useI18n();
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
    /*
      SOLO EL FORMULARIO. El titular y la invitación viven en el panel de al
      lado (`ConvocatoriaLlamado`, aquí abajo).

      POR QUÉ SE PARTIÓ EN DOS (6-ago-2026): en computadora todo junto cabía,
      pero en teléfono no — y ahí el panel se tenía que recorrer hacia abajo por
      dentro, o sea que en una página que se recorre de lado aparecía un scroll
      vertical justo al final. Partido en dos, cada mitad cabe en su pantalla y
      el recorrido sigue siendo de una sola dirección, que era el punto.

      `h-full` + `items-center` lo centran a media altura, como los demás
      paneles del riel.

      EL AIRE ES MÁS APRETADO EN TELÉFONO (`py-6` y `space-y-6` en vez de 8) y
      no es capricho: medido, el formulario mide 529 px, y en un iPhone SE el
      panel solo tiene 587. Con el aire de computadora se pasaba por seis
      píxeles — o sea, volvía a aparecer el scroll vertical justo en el aparato
      más chico. Apretándolo queda con margen de sobra en cualquier teléfono.
    */
    <section className="flex h-full items-center-safe px-6 py-6 md:px-12 md:py-0">
      <div className="w-full max-w-xl">
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
          <form onSubmit={enviar} className="space-y-6 md:space-y-8">
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

            {/*
              `relative` NO ES DECORATIVO, y esto rompió el sitio entero en
              Android — ver el apartado del manual.

              El input de abajo va `sr-only`, y `sr-only` es `position:
              absolute`. Sin un ancestro posicionado, su bloque contenedor
              termina siendo el de la página, así que NO lo recorta el
              `overflow` del riel del Nosotros: quedaba dibujado en su posición
              natural —cerca de 8300 px a la derecha, que es donde cae este panel
              dentro del riel— y estiraba el ancho del DOCUMENTO hasta allá.
              Chrome de Android, al ver una página de 8300 px, encoge todo para
              que quepa y la deja de tamaño de hormiga en la esquina.
            */}
            <div className="relative">
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
                {enviando ? t.convocatoria.sending : t.convocatoria.submit}
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
    </section>
  );
}
