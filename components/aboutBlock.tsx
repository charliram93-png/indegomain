"use client";

import Image from "next/image";
import Reveal from "@/components/reveal";
import { Line } from "@/components/manifesto";
import { MANIFESTO } from "@/config/brand";
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

/*
  LA REJILLA DE LA PÁGINA. Todo cuelga de aquí.

  OJO, CAMBIÓ CON EL RECORRIDO HORIZONTAL (6-ago-2026): cada bloque ya no es
  una franja apilada sino UN PANEL del riel, del alto de la ventana.

  · `h-full` + `flex items-center` — el contenido se centra a media altura del
    panel. Antes lo que ordenaba era el aire de arriba y abajo (`py-24`); ahora
    los paneles miden todos lo mismo y lo que ordena es el centro.
  · La separación pasó de LÍNEA DE ARRIBA a LÍNEA DE LA IZQUIERDA. Es la misma
    idea girada 90°, junto con la página. La pone el panel, no el bloque, para
    que las que ya trae el riel (portada, banda, pie) queden parejas: por eso
    aquí ya no hay `border-*`.
  · La rejilla de 12 columnas se queda, pero SIN `max-w-6xl`: el ancho ya lo
    manda el panel, y un tope de más lo dejaba corto en los anchos.
*/
const SECCION = "flex h-full items-center px-6 md:px-12";
const REJILLA = "grid w-full gap-6 md:grid-cols-12 md:gap-10";
/** Columna del contenido: arranca en la 5 y llega al final. */
const CONTENIDO = "md:col-span-8 md:col-start-5";

/**
 * EL HUECO de un bloque sin archivo. Solo en `npm run dev`.
 *
 * `caja` entra tal cual como clases: es el MISMO tamaño que tendría la foto de
 * verdad. Importa que sean idénticos porque desde que la página se recorre de
 * lado, un hueco más alto que su panel le saca una barra de desplazamiento —y
 * entonces estarías corrigiendo un problema que en producción no existe.
 */
function Hueco({ etiqueta, caja }: { etiqueta: string; caja: string }) {
  if (!EN_DESARROLLO) return null;
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-foreground/25 bg-surface/30 ${caja}`}
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
      EL MANIFIESTO DE LA MARCA, el mismo que abre el catálogo. El texto vive en
      `config/brand.ts` y se lee de ahí: no se copia, para que no se puedan
      separar nunca.

      MISMA TIPOGRAFÍA QUE EN EL CATÁLOGO —línea de arriba chica y atenuada,
      remate enorme, la misma Helvetica— pero SOBRE EL FONDO DEL TEMA, no
      invertido. En el catálogo el manifiesto ES la banda invertida; aquí esa
      carta ya la juega la banda de "GO TO DROP #1", y dos bandas invertidas en
      un mismo recorrido se anulan entre ellas.

      Va un poco más chico que en el catálogo (9rem -> 7rem de tope) porque
      aquí vive dentro de un panel del riel, no a lo ancho de la pantalla.
    */
    case "manifiesto":
      return (
        <section className={SECCION} style={{ fontFamily: HELVETICA }}>
          <div className="w-full">
            <p
              className="font-bold uppercase opacity-45"
              style={{
                fontSize: "clamp(0.8rem, 1.6vw, 1.2rem)",
                letterSpacing: "0.04em",
              }}
            >
              <Line line={MANIFESTO.top} />
            </p>

            <p
              className="mt-6 font-bold uppercase md:mt-8"
              style={{
                fontSize: "clamp(2.4rem, 7vw, 7rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
              }}
            >
              {MANIFESTO.bottom.map((linea, i) => (
                <span key={i} className="block">
                  <Line line={linea} />
                </span>
              ))}
            </p>
          </div>
        </section>
      );

    /*
      FRASE. Cita descolgada: grande, pero DENTRO de la columna de contenido y
      sobre el fondo del tema. Ya no se usa en la página (el arranque lo tomó el
      manifiesto), pero el tipo se queda: es la forma de meter una cita suelta
      entre bloques cuando haga falta.
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

      /* Con `completo` llena el panel de orilla a orilla y de arriba abajo. */
      if (block.completo) {
        return (
          <section className="flex h-full flex-col justify-center">
            {block.src ? (
              <figure className="flex h-[86%] w-full flex-col">
                <div className="relative flex-1 overflow-hidden bg-surface">
                  <Image
                    src={block.src}
                    alt={alt}
                    fill
                    sizes="1000px"
                    className="object-cover"
                  />
                </div>
                {block.pie && (
                  <figcaption className="shrink-0 px-6 pt-3 md:px-12">
                    <Pie>{block.pie[lang]}</Pie>
                  </figcaption>
                )}
              </figure>
            ) : (
              <Hueco
                etiqueta={`Foto de orilla a orilla — ${alt}`}
                caja="h-[86%] w-full"
              />
            )}
          </section>
        );
      }

      return (
        <section className={SECCION}>
          <div className="flex w-full items-center gap-6 md:gap-10">
            <div className="hidden shrink-0 md:block md:w-1/4">
              <Etiqueta />
            </div>
            {block.src ? (
              <figure className="flex-1">
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface">
                  <Image
                    src={block.src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                </div>
                {block.pie && (
                  <figcaption>
                    <Pie>{block.pie[lang]}</Pie>
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="flex-1">
                <Hueco etiqueta={`Foto — ${alt}`} caja="aspect-[3/2] w-full" />
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
        /*
          LAS DOS FOTOS SE MIDEN POR ALTURA, no por proporción sobre el ancho.

          Antes eran `aspect-square` y `aspect-[3/4]` a todo el ancho de su
          columna, más un `mt-24` para escalonarlas: en una página que bajaba
          eso daba igual, crecía el alto y ya. En el riel el panel mide lo que
          mide la pantalla, así que ese alto se salía y le sacaba una barra de
          desplazamiento al panel — que es justo lo que se está quitando.

          Ahora el alto es un PORCENTAJE del panel (siempre cabe) y el ancho lo
          saca la proporción. El desnivel se hace corriendo cada una para su
          lado con `translate-y`, que no ocupa espacio: es solo dibujo.
        */
        <section className={SECCION}>
          {/* `h-full` NO es de adorno: los `h-[52%]` de abajo se miden contra
              ESTE alto. Si el padre midiera "lo que ocupe su contenido", el
              porcentaje no tendría contra qué resolverse y las fotos volverían
              a crecer por el ancho — que es el problema que se está quitando. */}
          <div className="flex h-full w-full items-center justify-center gap-4 md:gap-10">
            {fotos.map((foto, i) => {
              // La segunda es más alta y va más abajo: ese desnivel es el efecto.
              const baja = i === 1;
              const caja = baja
                ? "aspect-[3/4] h-[52%] translate-y-[6%]"
                : "aspect-square h-[42%] -translate-y-[6%]";

              return foto.src ? (
                <div
                  key={i}
                  className={`relative overflow-hidden bg-surface ${caja}`}
                >
                  <Image
                    src={foto.src}
                    alt={foto.alt[lang]}
                    fill
                    sizes="(max-width: 768px) 50vw, 420px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <Hueco
                  key={i}
                  etiqueta={`Foto — ${foto.alt[lang]}`}
                  caja={caja}
                />
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
          {/* `h-full` por lo mismo que en el dúo: es contra lo que se mide el
              alto del hueco. */}
          <div className="flex h-full w-full items-center justify-center">
            {block.src ? (
              <figure className="w-full">
                <video
                  className="max-h-[70dvh] w-full bg-surface object-cover"
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
            ) : (
              <Hueco etiqueta="Video" caja="aspect-video h-[52%]" />
            )}
          </div>
        </section>
      );
  }
}
