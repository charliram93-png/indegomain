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
  | { tipo: "frase"; texto: string }
  | { tipo: "texto"; titulo: Texto; cuerpo: Texto }
  | { tipo: "foto"; src: string; alt: Texto; pie?: Texto; completo?: boolean }
  | { tipo: "duo"; a: { src: string; alt: Texto }; b: { src: string; alt: Texto } }
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
  /** Entrada corta, debajo del título. Se traduce. */
  entrada: {
    en: "[One or two lines: who Indego is and why it exists. Keep it short — the rest of the page explains it.]",
    es: "[Una o dos líneas: quién es Indego y por qué existe. Corto — el resto de la página lo explica.]",
  } as Texto,
};

export const BLOQUES: AboutBlock[] = [
  {
    tipo: "frase",
    texto: "[ANCHOR LINE — *english*, manifesto voice]",
  },
  {
    tipo: "texto",
    titulo: { en: "The origin", es: "El origen" },
    cuerpo: {
      en: "[Where Indego started: when, where, and what pushed you to start it. Write it the way you'd tell it out loud, not like a company profile.]",
      es: "[Dónde empezó Indego: cuándo, en dónde y qué los empujó a arrancar. Escríbelo como lo contarías en voz alta, no como perfil de empresa.]",
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
    cuerpo: {
      en: "[The pieces: how they're made, what fabric, printed where, how many per drop. This is the part that convinces someone to buy — the concrete details.]",
      es: "[Las prendas: cómo se hacen, en qué tela, dónde se estampan, cuántas por drop. Esta es la parte que convence a alguien de comprar — los datos concretos.]",
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
    cuerpo: {
      en: "[What's next: more drops, other pieces, the community you want to build. Close on something that makes people want to come back.]",
      es: "[Qué sigue: más drops, otras prendas, la comunidad que quieren construir. Cierra con algo que dé ganas de volver.]",
    },
  },
];

/**
 * EL CIERRE. Última frase de la página, antes del botón al catálogo.
 * Inglés fijo, como el manifiesto. Vacío = no se muestra el bloque.
 */
export const ABOUT_CIERRE = "[CLOSING LINE — *english*]";
