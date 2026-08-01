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
