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

// Clave de acceso para probar la tienda ANTES del lanzamiento.
// Comparte el link: https://indegostudio.com/product?access=TU_CLAVE
// (se guarda en una cookie, así solo hace falta una vez por dispositivo).
// En producción conviene moverla a una variable de entorno (DROP_ACCESS_KEY).
export const DROP_ACCESS_KEY = process.env.DROP_ACCESS_KEY || "indego-preview";

// Helper: ¿ya abrió el drop al público?
export const isDropOpen = (now: Date = new Date()) => now >= DROP_DATE;
