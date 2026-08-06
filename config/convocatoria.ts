/**
 * LA CONVOCATORIA — "NUESTROS MUSEOS ESTÁN VACÍOS"
 * ------------------------------------------------
 * La sección que CIERRA la página de Nosotros: una puerta abierta para que
 * quien haga algo lo mande y se pueda colaborar. El contenido vive aquí;
 * `components/convocatoria.tsx` solo lo dibuja y `app/api/convocatoria/route.ts`
 * recibe lo que llega.
 *
 * A DÓNDE VAN LOS ENVÍOS
 * ----------------------
 * A CLOUDINARY, a la carpeta de abajo. Hoy el sitio NO tiene base de datos
 * (Supabase es la etapa siguiente) ni servicio de correo, y Cloudinary es lo
 * único que ya está pagado y en uso — así que hace de buzón: cada envío deja
 * un archivo de texto con lo que escribieron y, si adjuntaron algo, el archivo
 * al lado. Se revisan entrando a la Media Library de Cloudinary.
 *
 * NO ES LA SOLUCIÓN DEFINITIVA y no pretende serlo: cuando entre Supabase,
 * esto se vuelve una tabla y lo único que cambia es el interior de la ruta.
 * La forma de la sección y del formulario se quedan igual.
 *
 * HACE FALTA CONFIGURAR DOS VARIABLES DE ENTORNO (`CLOUDINARY_API_KEY` y
 * `CLOUDINARY_API_SECRET`, las de tu cuenta de Cloudinary). Sin ellas el
 * formulario se dibuja pero avisa que no se pudo enviar y ofrece el Linktree.
 * Ver MANUAL.md, sección 4.
 */

/** Un texto en los dos idiomas (mismo tipo que `config/about.ts`). */
export type Texto = { en: string; es: string };

export const CONVOCATORIA = {
  /**
   * Apagador. En `false` la sección no se dibuja y la ruta rechaza todo.
   * Sirve para cerrar la convocatoria sin borrar código.
   */
  activa: true,

  /**
   * EL TÍTULO. Va traducido, no en inglés fijo como el manifiesto: esto es una
   * invitación a que alguien ESCRIBA, y se pide en el idioma en el que está
   * leyendo. Si algún día se quiere fijo en inglés, se pone el mismo texto en
   * las dos líneas.
   */
  titulo: {
    en: "OUR MUSEUMS ARE EMPTY",
    es: "NUESTROS MUSEOS ESTÁN VACÍOS",
  } as Texto,

  /** La explicación corta, debajo del título. */
  entrada: {
    en: "The walls belong to whoever paints them. If you make something — drawing, photography, music, whatever it is — send it over. This isn't a contest and it isn't a job listing: it's an open door to work together.",
    es: "Las paredes son de quien las pinta. Si haces algo —dibujo, fotografía, música, lo que sea— mándalo. No es un concurso ni una vacante: es una puerta abierta para colaborar.",
  } as Texto,

  /** Carpeta de Cloudinary donde aterrizan los envíos. */
  carpeta: "indego-convocatoria",

  /**
   * PESO MÁXIMO DEL ADJUNTO, en MB. No subirlo de 4: el archivo pasa por el
   * servidor de Vercel, que corta las peticiones de más de 4.5 MB. Si algún
   * día hacen falta archivos grandes, hay que subirlos del navegador
   * DIRECTO a Cloudinary y ya no por aquí.
   */
  maxMB: 4,

  /** Tipos de archivo que se aceptan. */
  formatos: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
} as const;

/** Lo que se le pone al `accept` del campo de archivo. */
export const ACEPTA = CONVOCATORIA.formatos.join(",");
