"use client";

import Image from "next/image";
import Reveal from "@/components/reveal";
import { Line } from "@/components/manifesto";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";
import type { AboutBlock } from "@/config/about";

/**
 * UN BLOQUE DE LA PÁGINA "NOSOTROS".
 *
 * Dibuja lo que venga en `config/about.ts`. Toda la decisión de QUÉ se muestra
 * está allá; aquí solo está el CÓMO se ve.
 *
 * POR QUÉ NO SE PARECE AL CATÁLOGO (ago-2026)
 * -------------------------------------------
 * La primera versión de esta página era la tienda con otro texto: mismas bandas
 * invertidas, mismo ancho centrado, mismos títulos gigantes. Se leía como copia.
 * Ahora comparte la piel (Helvetica, colores del tema, grano) pero tiene su
 * propia composición, la de un dossier y no la de una vitrina:
 *
 *  1. REJILLA ASIMÉTRICA de 12 columnas. A la izquierda una franja angosta con
 *     el número y el título; a la derecha el contenido. Nunca centrado: todo
 *     cuelga de las mismas dos líneas verticales.
 *  2. LA ETIQUETA SE QUEDA FIJA mientras su texto pasa de largo (`sticky`). Es
 *     el gesto propio de esta página; el catálogo no tiene nada parecido.
 *  3. JERARQUÍA AL REVÉS. En el catálogo mandan los nombres enormes y apretados
 *     y el texto es un pie chiquito. Aquí los títulos son CHICOS y espaciados,
 *     y el que crece es el párrafo: esta página se viene a leer.
 *  4. LÍNEAS FINAS separando secciones numeradas, en vez de bloques sueltos.
 *  5. UNA SOLA BANDA INVERTIDA, y va al final (ver `app/about/page.tsx`). El
 *     manifiesto ABRE la tienda; esta CIERRA el Nosotros. Usarla dos veces aquí
 *     era justo lo que la hacía sentir prestada.
 *
 * LOS HUECOS
 * ----------
 * Un bloque de foto o video sin archivo (`src: ""`) no se publica: en el sitio
 * en vivo no aparece nada. Pero en `npm run dev` sí se pinta un recuadro
 * punteado, para poder ver la estructura de la página mientras se llena. Así
 * nunca se escapa un hueco a producción, pero tampoco hay que trabajar a
 * ciegas.
 */

/** Next reemplaza esto por `true`/`false` al compilar, no queda en el bundle. */
const EN_DESARROLLO = process.env.NODE_ENV === "development";

/** La rejilla de la página. Todo cuelga de aquí. */
const SECCION = "border-t border-foreground/10 px-6 md:px-12";
const REJILLA =
  "mx-auto grid w-full max-w-6xl gap-6 py-14 md:grid-cols-12 md:gap-10 md:py-24";
/** Columna del contenido: arranca en la 5 y llega al final. */
const CONTENIDO = "md:col-span-8 md:col-start-5";

function Hueco({
  etiqueta,
  proporcion = "aspect-[4/5] md:aspect-[16/9]",
}: {
  etiqueta: string;
  proporcion?: string;
}) {
  if (!EN_DESARROLLO) return null;
  return (
    <div
      className={`flex w-full items-center justify-center border border-dashed border-foreground/25 bg-surface/30 ${proporcion}`}
    >
      <p className="px-6 text-center text-[10px] uppercase tracking-[0.06em] opacity-40">
        {etiqueta}
      </p>
    </div>
  );
}

/**
 * LA ETIQUETA de la izquierda: el número y el título de la sección.
 * Va FUERA del `Reveal` a propósito — `sticky` no se lleva bien con un padre
 * que se está moviendo con `transform`.
 */
function Etiqueta({ numero, titulo }: { numero?: string; titulo?: string }) {
  return (
    <div className="md:col-span-3">
      <div className="md:sticky md:top-28">
        {numero && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
            {numero}
          </p>
        )}
        {titulo && (
          <h2 className="mt-2 text-xs font-bold uppercase tracking-[0.14em] md:text-sm">
            {titulo}
          </h2>
        )}
      </div>
    </div>
  );
}

/** Pie de foto / de video. */
function Pie({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[10px] uppercase tracking-[0.08em] opacity-40">
      {children}
    </p>
  );
}

export default function AboutBlock({
  block,
  numero,
}: {
  block: AboutBlock;
  /** "01", "02"… Lo calcula la página y solo lo llevan los bloques de texto. */
  numero?: string;
}) {
  const { lang } = useI18n();

  switch (block.tipo) {
    /*
      FRASE. Cita descolgada: grande, pero DENTRO de la columna de contenido y
      sobre el fondo del tema. Antes era una banda invertida de lado a lado —
      o sea, el manifiesto del catálogo otra vez. Indentada dice lo mismo con
      voz propia, y le deja todo el peso a la banda del cierre.
    */
    case "frase":
      return (
        <section className={SECCION} style={{ fontFamily: HELVETICA }}>
          <div className={REJILLA}>
            {/* Marca de cita: un guion largo, alineado con las etiquetas. */}
            <div className="md:col-span-3">
              <p className="text-2xl leading-none opacity-25">—</p>
            </div>
            <Reveal className={CONTENIDO}>
              <p
                className="font-bold uppercase"
                style={{
                  fontSize: "clamp(1.6rem, 4.5vw, 3.4rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                }}
              >
                <Line line={block.texto} />
              </p>
            </Reveal>
          </div>
        </section>
      );

    /*
      TEXTO. El corazón de la página: etiqueta fija a la izquierda, párrafo
      grande a la derecha. Se lee más suelto que cualquier texto del catálogo,
      que es exactamente la idea.
    */
    case "texto":
      return (
        <section className={SECCION}>
          <div className={REJILLA}>
            <Etiqueta numero={numero} titulo={block.titulo[lang]} />
            <Reveal className={CONTENIDO}>
              <p className="max-w-2xl whitespace-pre-line text-base leading-[1.75] opacity-80 md:text-lg">
                {block.cuerpo[lang]}
              </p>
            </Reveal>
          </div>
        </section>
      );

    /*
      FOTO. Con `completo` va de ORILLA A ORILLA, sin margen ni rejilla: el
      catálogo nunca hace eso (sus fotos siempre viven dentro de un cuadro), así
      que es otra cosa que solo pasa aquí. Sin `completo`, se alinea con la
      columna del texto y deja la franja de la izquierda vacía — el aire
      descentrado es parte del tono.
    */
    case "foto": {
      const alt = block.alt[lang];

      if (block.completo) {
        return (
          <section className="border-t border-foreground/10">
            {block.src ? (
              <Reveal>
                <figure>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[21/9]">
                    <Image
                      src={block.src}
                      alt={alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  {block.pie && (
                    <figcaption className="px-6 pb-6 md:px-12">
                      <Pie>{block.pie[lang]}</Pie>
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ) : (
              <Hueco
                etiqueta={`Foto de orilla a orilla — ${alt}`}
                proporcion="aspect-[4/5] md:aspect-[21/9]"
              />
            )}
          </section>
        );
      }

      return (
        <section className={SECCION}>
          <div className={REJILLA}>
            <Etiqueta />
            {block.src ? (
              <Reveal className={CONTENIDO}>
                <figure>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[3/2]">
                    <Image
                      src={block.src}
                      alt={alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 780px"
                      className="object-cover"
                    />
                  </div>
                  {block.pie && (
                    <figcaption>
                      <Pie>{block.pie[lang]}</Pie>
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ) : (
              <div className={CONTENIDO}>
                <Hueco etiqueta={`Foto — ${alt}`} proporcion="aspect-[3/2]" />
              </div>
            )}
          </div>
        </section>
      );
    }

    /*
      DUO. Dos fotos ESCALONADAS, no al parejo: la segunda va más abajo y más
      alta. Puestas iguales parecían las filas del catálogo; desfasadas se leen
      como una hoja de contactos.
    */
    case "duo": {
      const fotos = [block.a, block.b];
      return (
        <section className={SECCION}>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 py-14 md:gap-10 md:py-24">
            {fotos.map((foto, i) => {
              // La segunda baja y se estira: ese desnivel es todo el efecto.
              const baja = i === 1;
              const proporcion = baja ? "aspect-[3/4]" : "aspect-square";
              const desnivel = baja ? "md:mt-24" : undefined;

              return foto.src ? (
                <Reveal key={i} className={desnivel}>
                  <div
                    className={`relative w-full overflow-hidden bg-surface ${proporcion}`}
                  >
                    <Image
                      src={foto.src}
                      alt={foto.alt[lang]}
                      fill
                      sizes="(max-width: 768px) 50vw, 550px"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ) : (
                <div key={i} className={desnivel}>
                  <Hueco
                    etiqueta={`Foto — ${foto.alt[lang]}`}
                    proporcion={proporcion}
                  />
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    /*
      VIDEO. En bucle y sin sonido, como el del countdown: es ambiente, no algo
      que el visitante tenga que ponerse a ver. `playsInline` es lo que evita
      que iPhone lo abra en pantalla completa él solo.
    */
    case "video":
      return (
        <section className={SECCION}>
          <div className={REJILLA}>
            <Etiqueta />
            {block.src ? (
              <Reveal className={CONTENIDO}>
                <figure>
                  <video
                    className="w-full bg-surface"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={block.poster || undefined}
                  >
                    <source src={block.src} type="video/mp4" />
                  </video>
                  {block.pie && (
                    <figcaption>
                      <Pie>{block.pie[lang]}</Pie>
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ) : (
              <div className={CONTENIDO}>
                <Hueco etiqueta="Video" proporcion="aspect-video" />
              </div>
            )}
          </div>
        </section>
      );
  }
}
