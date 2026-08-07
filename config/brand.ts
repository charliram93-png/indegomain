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
 * VIVE AQUÍ Y NO EN UNA PÁGINA porque ya lo usan dos: la cascada de la entrada
 * del Nosotros (`config/about.ts` lo toma de aquí) y la lluvia de fondo del
 * catálogo (`components/lluviaDeLogos.tsx`). Si algún día cambia el archivo, se
 * cambia en un solo lugar.
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
