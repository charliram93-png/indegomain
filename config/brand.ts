/**
 * MARCA
 * -----
 * Lo que dice el sitio de sí mismo: contacto, redes y el manifiesto.
 * Está aparte del catálogo a propósito: esto casi no cambia entre drops.
 */

/**
 * Correo de contacto. Mientras esté VACÍO, el footer no muestra el enlace
 * (mejor nada que un correo inventado). Ponlo y aparece solo.
 */
export const CONTACT_EMAIL = "";

/**
 * Instagram. Igual que el correo: vacío = no se muestra.
 * Formato: "https://instagram.com/tu_usuario".
 */
export const INSTAGRAM_URL = "";

/** Linktree (ya en uso en el footer). */
export const LINKTREE_URL = "https://linktr.ee/INDEGOSTUDIO";

/**
 * EL LOGO ALTERNO: la palabra INDEGO, en su versión de letra gorda.
 *
 * VIVE AQUÍ Y NO EN UNA PÁGINA porque lo usa la cascada de la entrada del
 * Nosotros (`config/about.ts` lo toma de aquí). Si algún día cambia el archivo,
 * se cambia en un solo lugar.
 *
 * OJO: el patrón de fondo del catálogo NO usa esto, usa `LOGOS_DE_MARCA` (aquí
 * abajo), que pide el color al vuelo. Estas dos URLs se quedan porque la
 * cascada del Nosotros necesita el archivo TAL CUAL, en su color original.
 *
 * SON DOS VERSIONES porque el logo es de UN SOLO COLOR: el negro se pierde
 * sobre el olivo del tema oscuro y el blanco sobre el crema del claro. Quien lo
 * dibuje tiene que elegir según el tema.
 *
 * `e_trim` le recorta el enorme margen transparente que trae el archivo (la
 * palabra ocupa 345 × 89 de un lienzo de 500 × 500), para que llene el ancho en
 * vez de quedar chiquita en medio.
 */
export const LOGO_PALABRA = {
  /** Para fondos claros (tema claro). */
  claro:
    "https://res.cloudinary.com/dij60ghdf/image/upload/e_trim/f_auto,q_auto,w_800/v1772753925/LogoLttrBold_Black_kkkxtv.png",
  /** Para fondos oscuros (tema oscuro). */
  oscuro:
    "https://res.cloudinary.com/dij60ghdf/image/upload/e_trim/f_auto,q_auto,w_800/v1772753915/LogoLttrBold_White_e1hbu0.webp",
};

/**
 * LOS CUATRO LOGOS DE LA MARCA, para quien los quiera todos.
 * ----------------------------------------------------------
 * Hoy los usa el patrón de fondo del catálogo. Cada uno viene del archivo que
 * hay subido, y el COLOR se pide al vuelo.
 *
 * EL TRUCO: `e_colorize` de Cloudinary pinta la imagen entera del color que se
 * le diga RESPETANDO la transparencia. Como los cuatro son de un solo color,
 * con eso salen en negro o en blanco desde el mismo archivo — no hace falta
 * tener las dos versiones subidas, ni que coincidan los nombres. El día que
 * lleguen los oficiales en los dos colores, esto sigue funcionando igual.
 *
 * LA PROPORCIÓN va anotada porque cada logo tiene la suya y quien los dibuje
 * necesita saberla para no deformarlos. Está medida sobre el archivo YA
 * recortado (`e_trim`), que es como se van a usar.
 *
 * EL `ancho` es cuánto espacio pide cada uno para verse del mismo "peso" que
 * los demás: la palabra es larga y bajita, así que necesita más ancho que la
 * estrella para no verse chiquita al lado de ella.
 */
const CLOUDINARY = "https://res.cloudinary.com/dij60ghdf/image/upload";

export type LogoDeMarca = {
  nombre: string;
  /** Proporción ancho/alto del archivo ya recortado. */
  proporcion: number;
  /** Ancho relativo, para que los cuatro se vean del mismo peso. */
  ancho: number;
  /** Pide el logo del color que se necesite. */
  url: (color: "black" | "white") => string;
};

const arma = (
  nombre: string,
  archivo: string,
  proporcion: number,
  ancho: number,
): LogoDeMarca => ({
  nombre,
  proporcion,
  ancho,
  url: (color) =>
    `${CLOUDINARY}/e_trim/e_colorize,co_${color}/f_auto,q_auto,w_400/${archivo}`,
});

export const LOGOS_DE_MARCA: LogoDeMarca[] = [
  arma("palabra", "v1772753925/LogoLttrBold_Black_kkkxtv.png", 3.85, 1),
  arma("niños", "v1772763867/LogoWhatsMetaData_jmp0lg.png", 1.24, 0.42),
  arma("estrella", "v1772753917/Logo_White_xhx1kd.webp", 1.16, 0.4),
  arma("countdown", "v1772755261/Indg_Cd_White_zqimyq.png", 1.79, 0.55),
];

/**
 * LA ESTRELLA: el logo principal, el que va en el navbar.
 *
 * OJO: LAS DOS VERSIONES NO SON EL MISMO LOGO EN DOS COLORES, Y ES A PROPÓSITO.
 * La "clara" (negra) son LOS NIÑOS y la "oscura" (blanca) es LA ESTRELLA, así
 * que el navbar enseña una marca distinta según el tema. Gustó desde el
 * principio y se queda: es un guiño, no un descuido. NO "emparejarlas".
 *
 * Misma idea que `LOGO_PALABRA` — dos versiones porque es de un solo color— y
 * vive aquí por lo mismo: ya lo usan el navbar y el patrón de fondo del
 * catálogo. Antes estaban escritos a mano dentro de `components/navbar.tsx`.
 *
 * OJO CON LAS TRANSFORMACIONES: aquí NO llevan `e_trim`. El navbar dibuja la
 * estrella dentro de un cuadro y necesita el margen transparente del archivo
 * para que quede centrada y del tamaño de siempre; recortándola cambiaría de
 * tamaño. Quien la quiera recortada (el patrón de fondo) que se lo pida a
 * Cloudinary por su cuenta.
 *
 * TODO: siguen siendo archivos viejos. Cuando lleguen los logos oficiales en
 * negro y blanco, se reemplazan estas dos líneas y cambian en todos lados.
 */
export const LOGO_ESTRELLA = {
  /** Negra, para fondos claros. */
  claro:
    "https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto,w_200/v1772763867/LogoWhatsMetaData_jmp0lg.png",
  /** Blanca, para fondos oscuros. */
  oscuro:
    "https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto,w_200/v1772753917/Logo_White_xhx1kd.webp",
};

/**
 * EL MANIFIESTO
 * Es la frase del video del countdown, ahora también como sección del catálogo.
 * Va en inglés fijo (no se traduce): es parte de la identidad, no interfaz.
 *
 * Lo que va entre *asteriscos* se dibuja en CURSIVA, igual que en el video.
 */
export const MANIFESTO = {
  /** Línea de arriba, chica y tenue. */
  top: "*YOU* ARE NOT A *CONTENT CREATOR*",
  /** El remate, en grande. Cada renglón es un elemento del arreglo. */
  bottom: ["*YOU* ARE AN", "ARTIST"],
};
