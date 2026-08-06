/**
 * NOSOTROS (la página /about)
 * ---------------------------
 * El CONTENIDO de la página vive aquí; `app/about/page.tsx` solo lo dibuja.
 * Es la misma idea que `config/products.ts`: para llenar la página no hace
 * falta tocar código, solo editar esta lista.
 *
 * CÓMO SE LLENA
 * -------------
 * `BLOQUES` se lee de arriba hacia abajo y se pinta en ese orden. Agrega,
 * quita o reordena los bloques a gusto. Hay cinco tipos:
 *
 *   manifiesto — EL manifiesto de la marca, el mismo que abre el catálogo
 *           ("YOU ARE NOT A CONTENT CREATOR / YOU ARE AN ARTIST"), con su misma
 *           tipografía. NO lleva texto aquí: lo lee de `config/brand.ts`, que
 *           es donde vive. Si se cambia allá, cambia en los dos lados solo.
 *   frase — Una cita corta y GRANDE, descolgada en la columna de contenido. Va
 *           en INGLÉS FIJO, no se traduce: es voz de marca, no interfaz. Lo que
 *           va entre *asteriscos* sale en cursiva.
 *   texto — Un párrafo con su título. Este SÍ se traduce (en / es). Se NUMERA
 *           solo (01, 02, 03…) según el orden en que quede en esta lista, así
 *           que reordenar no obliga a renumerar nada a mano.
 *   foto  — Una imagen. `completo: true` la manda de orilla a orilla.
 *   duo   — Dos fotos escalonadas (la segunda va más abajo y más alta).
 *   video — Un video en bucle, sin sonido (igual que el del countdown).
 *
 * DE DÓNDE SALEN LAS FOTOS Y EL VIDEO
 * -----------------------------------
 * De Cloudinary, igual que el catálogo. Súbelos y pega aquí la URL. Ponles
 * `f_auto,q_auto,w_1600` (o `q_auto,vc_h264,w_1280` si es video) para que no
 * pesen de más — ver el helper `foto()` en `config/products.ts`.
 *
 * MIENTRAS NO HAYA ARCHIVO, deja el `src` VACÍO (""). El bloque simplemente no
 * se publica: en el sitio en vivo no aparece nada roto, y en `npm run dev` sí
 * se ve un recuadro punteado marcando el hueco, para que sepas qué falta.
 *
 * LOS TEXTOS ENTRE [CORCHETES] SON RELLENO. Están puestos como guion para que
 * se vea la forma de la página; hay que reemplazarlos por los de verdad antes
 * de enseñársela a nadie (misma convención que los términos).
 */

/** Un texto en los dos idiomas. */
export type Texto = { en: string; es: string };

export type AboutBlock =
  | { tipo: "manifiesto" }
  | { tipo: "frase"; texto: string }
  | { tipo: "texto"; titulo: Texto; cuerpo: Texto }
  | { tipo: "foto"; src: string; alt: Texto; pie?: Texto; completo?: boolean }
  | {
      tipo: "duo";
      a: { src: string; alt: Texto };
      b: { src: string; alt: Texto };
    }
  | { tipo: "video"; src: string; poster?: string; pie?: Texto };

/**
 * LA PORTADA de la página. La foto de arriba y la frase de entrada.
 * La frase va en inglés fijo, como el manifiesto.
 */
export const ABOUT_PORTADA = {
  /** Foto grande de arriba (horizontal se ve mejor). Vacío = no se muestra. */
  imagen: "",
  /** Texto alternativo de esa foto (accesibilidad y buscadores). */
  alt: {
    en: "Indego Studio",
    es: "Indego Studio",
  } as Texto,
  /**
   * Entrada corta, debajo del título. Se traduce.
   * TEXTO REAL (6-ago-2026). Los saltos de línea se respetan.
   */
  entrada: {
    en: "We don't make clothes to follow what's coming.\nWe make them to create what's next.",
    es: "No hacemos ropa para seguir lo que viene.\nLa hacemos para crear lo que sigue.",
  } as Texto,
};

export const BLOQUES: AboutBlock[] = [
  /*
    ABRE CON EL MANIFIESTO DE LA MARCA (6-ago-2026), el mismo que abre el
    catálogo. Antes aquí había una frase ancla aparte, de relleno; se cambió
    porque decir dos cosas distintas en voz de marca, una por página, diluía
    las dos. Ahora es la misma en los dos lados y suena a una sola marca.
    El texto se edita en `config/brand.ts`, no aquí.
  */
  { tipo: "manifiesto" },
  {
    tipo: "texto",
    titulo: { en: "The origin", es: "El origen" },
    /* TEXTO REAL (6-ago-2026). Ver la nota sobre los saltos de línea abajo. */
    cuerpo: {
      en: "There are people looking for somewhere to put what they make — music, film, painting, art — and no idea where to show it. We were looking for that answer too. We were looking for a place that didn't exist.\n\nSo we built it.",
      es: "Hay quienes buscan un lugar de expresión en la música, el cine, la pintura, el arte, pero no saben cómo exponerla. Nosotros buscábamos esa respuesta. Buscábamos un lugar que no existía.\n\nLo creamos nosotros.",
    },
  },
  {
    tipo: "foto",
    src: "",
    alt: {
      en: "[Describe the photo: the studio, the process, the people]",
      es: "[Describe la foto: el estudio, el proceso, la gente]",
    },
    completo: true,
  },
  {
    tipo: "texto",
    titulo: { en: "What we make", es: "Lo que hacemos" },
    /*
      TEXTO REAL (6-ago-2026). Los saltos de línea se respetan tal cual: el
      párrafo se dibuja con `whitespace-pre-line`, así que un renglón en blanco
      aquí sale como renglón en blanco en la página.
    */
    cuerpo: {
      en: "Starting from nothing in a city with no room for contemporary art was never easy: making a name with no community, keeping an idea alive with no budget, building something nobody had asked us for.\n\nWe had no guarantees. But we knew that if we didn't do it, nobody else was going to.",
      es: "Empezar desde cero en una ciudad donde el arte contemporáneo no tenía lugar nunca fue fácil: hacer un nombre sin comunidad, sostener una idea sin presupuesto, construir algo que nadie nos había pedido.\n\nNo teníamos ninguna garantía. Pero sabíamos que si no lo hacíamos nosotros, nadie más lo iba a hacer.",
    },
  },
  {
    tipo: "duo",
    a: {
      src: "",
      alt: { en: "[Detail photo]", es: "[Foto de detalle]" },
    },
    b: {
      src: "",
      alt: { en: "[Detail photo]", es: "[Foto de detalle]" },
    },
  },
  {
    tipo: "video",
    src: "",
    poster: "",
    pie: {
      en: "[Optional caption for the video]",
      es: "[Pie de video, opcional]",
    },
  },
  {
    tipo: "texto",
    titulo: { en: "Where we're going", es: "A dónde vamos" },
    /* TEXTO REAL (6-ago-2026). Ver la nota sobre los saltos de línea abajo. */
    cuerpo: {
      en: "For now we want to make ourselves known. The garments aren't the end.\n\nWe want to keep learning and keep building spaces where people can express themselves. For now, we feel like artists.\n\nEvery collection comes from something we want to tell at that moment: an emotion, present or past, something we lived through, a cultural reference, or the spark of meeting someone who left a mark on us.",
      es: "Por el momento queremos darnos a conocer. Las prendas no son el final.\n\nQueremos seguir aprendiendo y creando espacios para que la gente se exprese. Por ahora, nos sentimos artistas.\n\nCada colección nace de algo que queremos contar en ese momento: una emoción presente o pasada, algo que vivimos, una referencia cultural, o la inspiración de encontrarnos con alguien que nos marcó.",
    },
  },
];

/**
 * LA BANDA QUE MANDA AL CATÁLOGO. Es la única invertida de la página y va
 * pegada a la frase ancla, no al final (ver `app/about/page.tsx`).
 *
 * YA NO ES UNA FRASE DE CIERRE, ES LA INSTRUCCIÓN: la banda ENTERA es el
 * enlace al catálogo, así que lo que dice aquí es lo único que se lee y tiene
 * que decir a dónde lleva. Antes debajo había además un "VER DROP #1" chiquito;
 * sobraba, y se quitó.
 *
 * Inglés fijo, como el manifiesto. Vacío = no se muestra la banda.
 * (El nombre `ABOUT_CIERRE` se quedó de cuando cerraba la página.)
 */
export const ABOUT_CIERRE = "GO TO DROP #1";
