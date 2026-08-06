/**
 * CONFIGURACIÓN DEL DROP
 * ----------------------
 * Todo lo relacionado al lanzamiento vive aquí. Cambia estos valores
 * en un solo lugar y se reflejan en el countdown, el candado de la tienda
 * y los metadatos.
 */

// Fecha y hora del lanzamiento (hora local de México, formato ISO).
// TODO: confirmar fecha definitiva. Por ahora: 1 de septiembre 2026, 6:00 PM (centro de MX).
export const DROP_DATE = new Date("2026-09-01T18:00:00-06:00");

// Nombre del drop. Es el TÍTULO del catálogo (antes decía "The Collection").
export const DROP_NAME = "DROP 1";

// Video de fondo del countdown (bucle), servido por Cloudinary con q_auto
// (optimiza peso y hace streaming, ideal para móvil).
// Va SIN letras: solo los caballos. El texto lo pone `components/dropIntro.tsx`.
// Dura 24.65 s (es el video viejo con los primeros 0.8 s recortados).
export const DROP_VIDEO =
  "https://res.cloudinary.com/dij60ghdf/video/upload/q_auto,vc_h264,w_1280/v1785541329/caballos_etxysz.mp4";

// Imagen de respaldo (primer frame del video vía Cloudinary) que se muestra
// mientras el video carga o si un dispositivo no lo reproduce.
export const DROP_POSTER =
  "https://res.cloudinary.com/dij60ghdf/video/upload/so_1,w_1280,q_auto/v1785541329/caballos_etxysz.jpg";

/**
 * LA ETIQUETA DEL DROP (ver `components/dropTag.tsx`).
 *
 * Es el sticker "SPECIAL DROP #1", montado en el borde del navbar. Sale en un
 * solo lugar del sitio a propósito (ver el componente).
 *
 * ES APAISADA (1681 × 936, casi 16:9) y con FONDO TRANSPARENTE, así que se
 * apoya sola sobre cualquier fondo. El componente la mide POR ALTURA y el ancho
 * lo saca de la imagen, así que cambiarla por otra de otra proporción no la
 * deforma — pero sí cambia cuánto espacio ocupa a lo ancho. Si algún día vuelve
 * a ser cuadrada, hay que revisar el `left-*` de la del navbar, que está
 * calculado para que no le caiga encima al logo.
 *
 * Se sirve con `f_auto,q_auto,w_800` igual que las playeras. Sin eso es un PNG
 * de más de 1 MB en el navbar de TODAS las páginas; con eso son unas decenas de
 * KB en webp.
 *
 * MIENTRAS ESTÉ VACÍA se dibuja una etiqueta de respaldo en SVG, hecha con los
 * colores del tema. Así el navbar nunca se queda con un hueco.
 */
export const DROP_TAG_IMAGE =
  "https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto,w_800/v1786033395/indego-drop1-banner-solo-etiqueta_xpslul.png";

/**
 * CLAVE DE ACCESO para probar la tienda ANTES del lanzamiento.
 * Se comparte así:  https://indegostudio.com/product?access=LA_CLAVE
 * (queda en una cookie, así solo hace falta abrirlo una vez por dispositivo).
 *
 * LA CLAVE NO SE ESCRIBE AQUÍ. Sale ÚNICAMENTE de la variable de entorno
 * `DROP_ACCESS_KEY`, y no hay valor de respaldo a propósito.
 *
 * Por qué: **este repositorio es público**. Antes la clave estaba escrita en
 * esta línea (`"indego-preview"`), o sea que cualquiera que abriera el código
 * en GitHub podía entrar a la tienda antes del drop. Poner una clave nueva
 * aquí tendría exactamente el mismo problema el día que se suba.
 *
 * Si la variable no está puesta, el acceso anticipado queda APAGADO y todos
 * ven el countdown. Es la falla segura: preferimos que no entre nadie a que
 * entre cualquiera.
 *
 * Dónde ponerla:
 *   · producción -> Vercel > Settings > Environment Variables
 *   · local      -> archivo `.env.local` (nunca se sube, está en .gitignore)
 */
export const DROP_ACCESS_KEY = process.env.DROP_ACCESS_KEY ?? "";

// Helper: ¿ya abrió el drop al público?
export const isDropOpen = (now: Date = new Date()) => now >= DROP_DATE;
