"use client";

import { MANIFESTO } from "@/config/brand";
import { HELVETICA } from "@/lib/fonts";

/**
 * Parte el texto en trozos, marcando como cursiva lo que venía entre
 * *asteriscos*. Así el manifiesto se edita como texto plano en `config/brand.ts`
 * sin tener que tocar este archivo.
 */
const parse = (line: string) =>
  line.split("*").map((chunk, i) => ({ text: chunk, italic: i % 2 === 1 }));

/** Se exporta porque la página de "Nosotros" usa la misma convención de
 *  *asteriscos* para sus frases de marca (ver `components/aboutBlock.tsx`). */
export const Line = ({ line }: { line: string }) => (
  <>
    {parse(line).map((chunk, i) => (
      <span key={i} style={{ fontStyle: chunk.italic ? "italic" : "normal" }}>
        {chunk.text}
      </span>
    ))}
  </>
);

/**
 * EL MANIFIESTO
 * Abre el catálogo, de lado a lado y con los colores invertidos. Empieza
 * DEBAJO del navbar (el hueco lo pone `app/product/page.tsx`), para que el
 * fondo contrastante no se vea a través del cristal de la barra. Usa la misma
 * Helvetica del countdown, para que se lea como continuación del video.
 *
 * NO lleva alto fijo a propósito: el bloque mide lo que mide su texto. Con un
 * `min-h` en pantallas, en celular quedaba altísimo y el texto perdido en medio.
 *
 * Tampoco lleva animación de entrada: al ser lo PRIMERO que se ve, no debe
 * depender de que el JS ya haya corrido para ser visible.
 */
export default function Manifesto() {
  return (
    <section
      className="manifesto bg-foreground px-6 py-16 text-background md:px-12 md:py-24"
      style={{ fontFamily: HELVETICA }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <p
          className="font-bold uppercase opacity-45"
          style={{
            fontSize: "clamp(0.8rem, 2vw, 1.4rem)",
            letterSpacing: "0.04em",
          }}
        >
          <Line line={MANIFESTO.top} />
        </p>

        <p
          className="mt-6 font-bold uppercase md:mt-10"
          style={{
            fontSize: "clamp(2.6rem, 11vw, 9rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
          }}
        >
          {MANIFESTO.bottom.map((line, i) => (
            <span key={i} className="block">
              <Line line={line} />
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
