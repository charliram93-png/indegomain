"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DROP_NAME } from "@/config/drop";

/**
 * LA ENTRADA AL DROP, en la barra.
 * --------------------------------
 * Un "DROP #1" chico en mayúsculas, del mismo peso que EN y el tema. Lleva al
 * catálogo.
 *
 * PARA QUÉ: desde que la puerta de entrada es la página de Nosotros, hace falta
 * una forma de llegar a las playeras que no sea recorrer el Nosotros hasta
 * toparse con la banda de "GO TO DROP #1", que va a media página.
 *
 * ANTES ERA UNA CALCOMANÍA ROJA ladeada ("SPECIAL DROP #1"), pegada al logo y
 * montada sobre el borde de la barra, y se cambió por esto el 7-ago-2026:
 * **resaltaba demasiado**. En un sitio que es crema, olivo y Helvetica, un
 * sticker naranja era lo primero —y a veces lo único— que se veía al entrar, y
 * le ganaba la mirada al propio logo.
 *
 * Lo que quedó tiene el mismo trabajo pero sin gritar: está siempre visible,
 * pesa lo mismo que los otros controles y se lee como parte de la barra.
 *
 * COSAS QUE YA SE PROBARON Y NO HAY QUE REPETIR:
 *   · la calcomanía SUELTA, fija a la pantalla abajo a la derecha (6-ago): se
 *     encimaba con lo que pasaba por detrás del riel del Nosotros. Y ojo, NO se
 *     puede fijar a la pantalla desde dentro de la barra: el `backdrop-blur`
 *     del navbar hace que un `position: fixed` se mida contra LA BARRA y no
 *     contra la ventana;
 *   · repetir el llamado al CERRAR el Nosotros, además de la banda de en medio
 *     (6-ago): repetido a los pocos segundos se leía como relleno y le quitaba
 *     fuerza al primero.
 *
 * EL NOMBRE SALE DE `DROP_NAME` (`config/drop.ts`), que hasta hoy no se usaba en
 * ningún lado. NO se traduce: es el nombre propio del lanzamiento, igual que
 * "Drop 1.5" o "IDG - 01".
 */
export default function DropTag() {
  const pathname = usePathname();

  /*
    NUNCA DENTRO DEL CATÁLOGO: un enlace que te lleva a donde ya estás sobra.
    Cubre `/product` y también `/product/idg-01` y demás.

    Como lo dibuja el navbar, y el navbar solo existe en el Nosotros y en el
    catálogo, en la práctica esto lo deja saliendo SOLO en el Nosotros.
  */
  if (pathname === "/product" || pathname.startsWith("/product/")) return null;

  return (
    /*
      EL RELLENO Y EL TAMAÑO son los de `LangToggle` y `ThemeToggle`, a
      propósito: los tres viven en la misma fila y cualquier diferencia de aire
      se lee como un descuadre, no como jerarquía.

      Va PRIMERO de los cuatro controles —antes del idioma— porque es el único
      que lleva a algún lado; los otros tres cambian cómo se ve la página.

      `whitespace-nowrap` porque en teléfono la fila va apretada y "DROP #1"
      partido en dos renglones desbarataría la altura de la barra.
    */
    <Link
      href="/product"
      className="select-none whitespace-nowrap px-2 py-2 text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-50"
    >
      {DROP_NAME}
    </Link>
  );
}
