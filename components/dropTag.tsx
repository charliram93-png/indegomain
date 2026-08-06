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
 * VA PEGADA A LA PANTALLA, no a la página: se queda quieta a la derecha,
 * bastante más abajo del navbar, mientras todo lo demás pasa por detrás. Antes
 * iba montada a caballo sobre el borde de la barra; se cambió el 6-ago-2026
 * para que acompañe toda la lectura y no solo el arranque.
 *
 * NO SE DIBUJA DESDE EL NAVBAR, y no es por orden: la barra lleva
 * `backdrop-blur`, y un elemento `fixed` dentro de algo desenfocado se
 * posiciona contra ESE elemento en vez de contra la ventana. Colgando del
 * navbar, sencillamente no se podía fijar a la pantalla.
 *
 * QUIÉN DECIDE DÓNDE SALE: la página que la dibuje. Hoy solo `/about`, que es
 * exactamente donde salía antes (era la única con navbar que no la escondía).
 * Como está posicionada contra la ventana, da igual en qué parte del árbol se
 * ponga — mientras no cuelgue de algo con `backdrop-filter` o `transform`.
 *
 * VA DERECHA, sin inclinar. Se probó ladeada mientras estaba montada en la
 * barra, donde funcionaba —ahí se leía como calcomanía pegada al borde—, pero
 * suelta en medio de la pantalla la inclinación se veía como un descuido.
 *
 * LA IMAGEN sale de `DROP_TAG_IMAGE` (`config/drop.ts`) y es APAISADA (el PNG
 * mide 1681 × 936, con fondo transparente): el tamaño se manda POR ALTURA y el
 * ancho lo saca de la imagen, o sea que ocupa casi el doble de ancho que de
 * alto. Mientras esa variable esté vacía se dibuja la de respaldo en SVG, que
 * toma los colores del tema, para que nunca quede un hueco.
 */
export default function DropTag() {
  const pathname = usePathname();

  /*
    NUNCA DENTRO DEL CATÁLOGO, aunque alguien la ponga ahí por descuido: una
    etiqueta que te lleva a donde ya estás sobra. Cubre `/product` y también
    `/product/idg-01` y demás. El resto de "dónde sale" lo decide quien la
    dibuje (ver el comentario de arriba).
  */
  if (pathname === "/product" || pathname.startsWith("/product/")) return null;

  return (
    <Link
      href="/product"
      aria-label="Drop #1"
      /*
        DÓNDE QUEDA: pegada a la ventana, a la derecha y MUY por debajo del
        navbar — no colgando de él.

        · La barra mide 80 px. `top-40` la deja en 160, o sea a otro navbar
          entero de distancia; en computadora baja a 192 (`md:top-48`), que
          ahí sobra pantalla. La separación es el punto: pegada al borde volvía
          a leerse como parte de la barra, que es justo lo que se quiso quitar.
        · `right-6` / `md:right-12` son los MISMOS márgenes que usa el navbar,
          para que quede a plomo con el botón del carrito.
        · `z-40` la deja debajo de la barra (z-50), del modal (z-50) y del
          carrito (z-60/70): nunca estorba a algo que se abra encima.

        AL PASAR EL CURSOR solo crece. Ya no se endereza, porque ya está
        derecha. Medio segundo, no un tercio: a 300 ms se sentía un tirón seco,
        más un cambio de estado que un movimiento.
      */
      className="fixed right-6 top-40 z-40 select-none drop-shadow-sm transition-transform duration-500 ease-out hover:scale-105 md:right-12 md:top-48"
    >
      {DROP_TAG_IMAGE ? (
        /* 44 px de alto en teléfono y 64 en computadora — o sea unos 79 y 115
           de ANCHO, porque es apaisada.
           `alt` vacío porque el `aria-label` del enlace ya la nombra: si los
           dos hablaran, un lector de pantalla la diría dos veces.
           `priority` porque está a la vista desde el primer momento y en todas
           las páginas. */
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
