"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cartDrawer";
import AboutBlock from "@/components/aboutBlock";
import Reveal from "@/components/reveal";
import Convocatoria from "@/components/convocatoria";
import { Line } from "@/components/manifesto";
import { ABOUT_PORTADA, ABOUT_CIERRE, BLOQUES } from "@/config/about";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

/**
 * NOSOTROS — la página de marca.
 *
 * ESTA PÁGINA NO TIENE CONTENIDO PROPIO: todo lo que se ve sale de
 * `config/about.ts`. Para llenarla o reordenarla, ese es el único archivo que
 * hay que abrir. Aquí solo está el armazón (portada, la lista de bloques y el
 * cierre) y el orden en que se apilan.
 *
 * NO ES LA TIENDA CON OTRO TEXTO. Comparte la piel —Helvetica, los colores del
 * tema, el grano— pero su composición es otra: rejilla asimétrica, secciones
 * numeradas separadas por líneas y etiquetas que se quedan fijas mientras el
 * texto pasa. El razonamiento completo está en `components/aboutBlock.tsx`.
 *
 * ES PÚBLICA, incluso antes del drop: el candado de `proxy.ts` solo cubre
 * `/product`, así que esta página se puede compartir desde Instagram mientras
 * el countdown sigue corriendo. Si algún día se quiere esconder hasta el
 * lanzamiento, se agrega "/about" al `matcher` de ese archivo.
 */
export default function AboutPage() {
  const { t, lang } = useI18n();

  /*
    Numeración de las secciones de texto (01, 02, 03…). Se calcula aquí y no en
    `config/about.ts` para que reordenar los bloques no obligue a renumerarlos a
    mano: el número sale del orden real, siempre.
  */
  let cuenta = 0;
  const numeros = BLOQUES.map((b) =>
    b.tipo === "texto" ? String(++cuenta).padStart(2, "0") : undefined
  );

  return (
    <div className="entrada flex min-h-dvh flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1" style={{ fontFamily: HELVETICA }}>
        {/* Hueco del navbar (la barra es fija y mide 80px). */}
        <div className="h-20" />

        {/*
          PORTADA. El catálogo arranca de golpe con el manifiesto pegado al
          navbar; aquí se hace lo contrario: mucho aire, el título colgado de la
          izquierda y la entrada descolgada a la derecha, sobre la misma rejilla
          que después usan todas las secciones.
        */}
        <section className="px-6 pb-16 pt-16 md:px-12 md:pb-24 md:pt-28">
          <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
                {t.about.tag}
              </p>
              <h1
                className="mt-4 font-bold uppercase"
                style={{
                  fontSize: "clamp(2.6rem, 10vw, 7.5rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.03em",
                }}
              >
                {t.about.title}
              </h1>
            </div>

            {/* La entrada NO va debajo del título, va al lado y abajo: es lo que
                rompe la simetría de entrada y avisa que esto es otra página. */}
            <div className="flex items-end md:col-span-5 md:pb-3">
              <p className="max-w-sm text-base leading-[1.75] opacity-70 md:text-lg">
                {ABOUT_PORTADA.entrada[lang]}
              </p>
            </div>
          </div>
        </section>

        {/*
          Foto de portada, de orilla a orilla. Mientras no exista, no se publica
          nada (en `npm run dev` sí sale el hueco punteado, ver `aboutBlock.tsx`).
        */}
        {ABOUT_PORTADA.imagen && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[21/9]">
            <Image
              src={ABOUT_PORTADA.imagen}
              alt={ABOUT_PORTADA.alt[lang]}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* LOS BLOQUES, en el orden de `config/about.ts`. */}
        {BLOQUES.map((block, i) => (
          <AboutBlock key={i} block={block} numero={numeros[i]} />
        ))}

        {/*
          CIERRE. La ÚNICA banda invertida de la página, y va al final: el
          manifiesto abre la tienda, esta cierra el Nosotros. Es el guiño que
          amarra las dos páginas sin repetir el truco a media lectura.
        */}
        {ABOUT_CIERRE && (
          <section className="bg-foreground px-6 py-20 text-background md:px-12 md:py-32">
            <div className="mx-auto w-full max-w-6xl">
              <p
                className="font-bold uppercase"
                style={{
                  fontSize: "clamp(1.8rem, 7vw, 5.5rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                }}
              >
                <Line line={ABOUT_CIERRE} />
              </p>

              {/*
                OJO: antes del drop, /product manda al countdown a quien no
                tenga la clave de acceso. Es a propósito (misma decisión que en
                las páginas por producto): está bien que vean el countdown.
              */}
              {/* Sin recuadro ni relleno al pasar el cursor: en todo el sitio
                  los enlaces son texto pelón que se atenúa (el nombre de cada
                  playera en el catálogo, los del pie). Un botón con contorno
                  aquí era el único de su especie.

                  SE PROBÓ PONER AQUÍ EL STICKER DEL DROP (6-ago-2026, el mismo
                  del navbar, en grande) y se revirtió: repetido a los pocos
                  segundos de scroll se leía como relleno, y le quitaba fuerza
                  al de arriba, que es el que tiene que llamar. La etiqueta
                  ahora sale en UN solo lugar del sitio, y por eso pesa. */}
              <Reveal>
                <Link
                  href="/product"
                  /* MÁS GRANDE que los demás enlaces del sitio (6-ago-2026):
                     los de 11 px funcionan en el pie y en el catálogo, donde
                     hay poco alrededor, pero aquí cuelga de una frase enorme y
                     se perdía. La separación entre letras BAJA al crecer
                     (0.06em en vez de 0.1em): el aire que hace legible un
                     renglón chiquito, a este tamaño lo desarma. */
                  className="mt-12 inline-block text-base font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-50 md:text-xl"
                >
                  {t.about.cta}
                </Link>
              </Reveal>
            </div>
          </section>
        )}

        {/*
          LA CONVOCATORIA, hasta abajo. Va DESPUÉS de la banda que manda al
          catálogo a propósito: la página termina pidiendo algo (manda tu arte)
          en vez de vendiendo algo. Se apaga desde `config/convocatoria.ts`.
        */}
        <Convocatoria />
      </main>

      {/* El navbar lleva el botón del carrito, así que el cajón va montado. */}
      <CartDrawer />
      <Footer />
    </div>
  );
}
