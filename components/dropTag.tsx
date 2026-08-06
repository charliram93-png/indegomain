"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DROP_TAG_IMAGE } from "@/config/drop";
import { HELVETICA } from "@/lib/fonts";

/**
 * LA ETIQUETA DEL DROP (prueba, ago-2026)
 * ---------------------------------------
 * El sticker "SPECIAL DROP #1", pegado junto al logo. Lleva al catálogo.
 *
 * PARA QUÉ: desde que la puerta de entrada es la página de Nosotros, hacía
 * falta una forma de llegar a las playeras que no fuera bajar hasta el final.
 *
 * SALE EN UN SOLO LUGAR DEL SITIO, y por eso pesa. Se probó ponerla TAMBIÉN al
 * cerrar el Nosotros, en lugar del "VER DROP #1" de texto, y se revirtió
 * (6-ago-2026): repetida a los pocos segundos de scroll se leía como relleno y
 * le quitaba fuerza a esta, que es la que tiene que llamar.
 *
 * VA MONTADA SOBRE EL BORDE DE LA BARRA, a caballo: la mayor parte dentro del
 * navbar y el resto colgando sobre la página. Por eso está posicionada
 * `absolute` contra la barra (`top-full` la baja hasta el borde y el
 * `-translate-y-*` la vuelve a subir) y NO va en la fila del logo: en la fila
 * quedaría contenida y no podría asomarse. Se ve como una etiqueta pegada
 * encima, no como un botón más de la barra.
 *
 * VA LADEADA a propósito: derecha se leería como un botón más de la barra, que
 * es justo lo que no es.
 *
 * NO SE MUESTRA EN `/product`: ahí ya estás en el catálogo, y una etiqueta que
 * te lleva a donde ya estás sobra. Cubre también `/product/idg-01` y demás.
 *
 * LA IMAGEN sale de `DROP_TAG_IMAGE` (`config/drop.ts`) y es APAISADA (el PNG
 * mide 1681 × 936, con fondo transparente): el tamaño se manda POR ALTURA y el
 * ancho lo saca de la imagen, o sea que ocupa casi el doble de ancho que de
 * alto. Mientras esa variable esté vacía se dibuja la de respaldo en SVG, que
 * toma los colores del tema, para que el navbar no quede con un hueco.
 */
export default function DropTag() {
  const pathname = usePathname();

  // Fuera del catálogo y de las páginas por producto.
  if (pathname === "/product" || pathname.startsWith("/product/")) return null;

  return (
    <Link
      href="/product"
      aria-label="Drop #1"
      /*
        DÓNDE QUEDA, que es distinto en cada tamaño (ajustado 6-ago-2026):

        · TELÉFONO — `left-[70px]`. El logo mide 56 px y arranca en el margen de
          24, o sea que termina en 80: la etiqueta le monta los últimos 10 px a
          propósito, para que se lea PEGADA ENCIMA del logo y no acomodada a un
          lado. La parte del logo que tapa es aire, no dibujo.
          Y sube un poco más de lo normal (`-translate-y-[64%]` en vez de la
          mitad): en pantalla chica, colgando media etiqueta se comía demasiado
          de lo que hay debajo.

        · COMPUTADORA — `left-[146px]` y centrada en el borde. Ahí sí hay lugar
          de sobra (el logo mide 80 y el margen es 48), así que la etiqueta va
          después del logo, sin encimarse.

        EL MOVIMIENTO al pasar el cursor: se endereza un poco y crece. Es el
        único que tiene, y basta para que se lea como algo con lo que se puede
        jugar. MEDIO SEGUNDO, no un tercio: a 300 ms se sentía un tirón seco,
        más un cambio de estado que un movimiento.
      */
      className="group absolute left-[70px] top-full z-10 -translate-y-[64%] -rotate-[7deg] select-none drop-shadow-sm transition-transform duration-500 ease-out hover:-rotate-[3deg] hover:scale-105 md:left-[146px] md:-translate-y-1/2"
    >
      {DROP_TAG_IMAGE ? (
        /* 44 px de alto en teléfono y 64 en computadora — o sea unos 79 y 115
           de ANCHO, porque es apaisada. Cabe montada en la barra de 80 px sin
           alcanzar los controles de la derecha.
           `alt` vacío porque el `aria-label` del enlace ya la nombra: si los
           dos hablaran, un lector de pantalla la diría dos veces.
           `priority` porque está arriba de todo y en todas las páginas. */
        <Image
          src={DROP_TAG_IMAGE}
          alt=""
          width={800}
          height={446}
          priority
          className="h-11 w-auto select-none md:h-16"
        />
      ) : (
        /* RESPALDO en SVG mientras no esté la etiqueta de verdad. Es la etiqueta
           de precio de siempre; el relleno es el color de la barra, si no se le
           transparentaría la página debajo. */
        <svg
          width="86"
          height="30"
          viewBox="0 0 86 30"
          className="h-11 w-auto text-foreground md:h-16"
          aria-hidden
        >
          <path
            d="M13 1.5 L82.5 1.5 A2.5 2.5 0 0 1 85 4 L85 26 A2.5 2.5 0 0 1 82.5 28.5 L13 28.5 L1.5 15 Z"
            fill="var(--color-surface)"
            stroke="currentColor"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            opacity="0.85"
          />
          {/* El agujero por donde iría el hilo. */}
          <circle
            cx="11"
            cy="15"
            r="2.4"
            stroke="currentColor"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            fill="none"
            opacity="0.85"
          />
          <text
            x="49"
            y="15"
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            style={{
              fontFamily: HELVETICA,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            DROP #1
          </text>
        </svg>
      )}
    </Link>
  );
}
