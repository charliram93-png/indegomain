/**
 * SECUENCIA DE TEXTO DEL COUNTDOWN
 * --------------------------------
 * El video de fondo va SIN letras (solo los caballos). Todo el texto se dibuja
 * aquí, en el navegador, para que escale nítido en cualquier pantalla.
 *
 * Los tiempos, tamaños y posiciones salieron de medir cuadro por cuadro el
 * video original (el que traía las letras quemadas), así que la secuencia
 * queda igual pero ahora se adapta a cualquier dispositivo.
 *
 * OJO con los tiempos: el video limpio es el viejo con los primeros 0.8 s
 * recortados, así que toda la secuencia ya viene corrida 0.8 s hacia atrás.
 *
 * Cómo leerlo:
 * - `start` / `end` son SEGUNDOS del video. La secuencia va pegada al
 *   `currentTime` del video, así que al repetirse el bucle el texto reinicia solo.
 * - `x` / `y` son PORCENTAJES de la caja del video (y = centro vertical del texto).
 * - `size` está en `cqw`: 1 = 1% del ANCHO del video. Así el texto crece y
 *   encoge junto con el video en cualquier pantalla.
 * - Los cortes son SECOS (sin fundido), igual que en el video original.
 *
 * Para cambiar textos o tiempos, edita solo este archivo.
 */

/** Duración del video en segundos (el bucle completo). */
export const INTRO_LOOP = 24.65;

/** Pon en `false` para apagar el texto (p. ej. si vuelves a un video con letras). */
export const INTRO_ENABLED = true;

/**
 * Color del texto. Para volver a compararlo contra el video viejo (el que traía
 * las letras quemadas), pon aquí un verde como "#00E676" y se distingue solo.
 */
export const INTRO_COLOR = "#fff";

/** Dónde se ancla el bloque de texto respecto a `x`. */
export type IntroAnchor = "left" | "center" | "right";

/** Una palabra dentro de una línea. `at` = segundos DESPUÉS del `start` de la línea. */
export type IntroWord = {
  text: string;
  at?: number;
  weight?: 400 | 500 | 700;
  italic?: boolean;
};

/**
 * La lluvia de palabras: la palabra se repite muchas veces hasta hacer una
 * mancha. Todas las copias van RELLENAS (no en contorno) — lo que parece
 * contorno en el video es el encimado de las copias.
 */
export type IntroTrail = {
  text: string;
  x: number;
  y: number;
  size: number;
  weight?: 400 | 500 | 700;
  italic?: boolean;
  /** Cuántas copias se dibujan en total. */
  copies: number;
  /**
   * Índice de la primera copia. 0 = la mancha crece solo hacia adelante;
   * en negativo, se abre hacia los DOS lados de la palabra.
   */
  from?: number;
  /** Hacia dónde avanza cada copia, en `em` (relativo al tamaño de letra). */
  dx: number;
  dy: number;
  /**
   * Si se define, las copias dejan de ir en una sola fila y se reparten en una
   * RETÍCULA de `cols` columnas (separadas `gapX`/`gapY` em), centrada en
   * `x`/`y`. Es lo que hace que "AN" cubra toda una zona en vez de una línea.
   */
  cols?: number;
  gapX?: number;
  gapY?: number;
  /**
   * Desorden de cada copia, en `em`. Es lo que hace que la mancha se vea
   * aventada y no como una fila pareja. Siempre da el mismo resultado (no es
   * azar de verdad), para que no cambie entre el servidor y el navegador.
   */
  jx?: number;
  jy?: number;
  /** Si es `true`, las copias no salen en fila sino salteadas. */
  shuffle?: boolean;
  /** Segundos después del `start` en que arranca, y cada cuánto sale una copia. */
  at?: number;
  step?: number;
};

export type IntroCue =
  | {
      kind: "line";
      start: number;
      end: number;
      x: number;
      y: number;
      anchor: IntroAnchor;
      size: number;
      tracking?: number;
      words: IntroWord[];
    }
  | {
      kind: "trail";
      start: number;
      end: number;
      tracking?: number;
      trails: IntroTrail[];
    }
  | { kind: "star"; start: number; end: number; x: number; y: number; size: number }
  | {
      kind: "signoff";
      start: number;
      end: number;
      y: number;
      size: number;
      tracking?: number;
      /** Margen lateral, en % del ancho. */
      inset: number;
      left: string;
      right: string;
      /** Ancho del logo, en % del ancho del video. */
      logoWidth: number;
    };

/**
 * La secuencia, en orden. Replica el video original:
 * INDEGOSTUDIO · DROP 1. · "YOU ARE NOT A" · "CONTENT CREATOR" ·
 * "YOU ARE AN" (con estelas) · ARTIST · ✳ · COMING · SOON
 */
export const INTRO_CUES: IntroCue[] = [
  {
    kind: "line",
    start: 1.2,
    end: 5.6,
    x: 50,
    y: 49,
    anchor: "center",
    size: 7.18,
    tracking: 0.011,
    words: [{ text: "INDEGOSTUDIO", weight: 700 }],
  },
  {
    kind: "line",
    start: 7.3,
    end: 10.7,
    x: 3.9,
    y: 49.5,
    anchor: "left",
    size: 3.23,
    tracking: 0.038,
    words: [{ text: "DROP 1.", weight: 700 }],
  },
  {
    kind: "line",
    start: 10.7,
    end: 12.1,
    x: 9.6,
    y: 49,
    anchor: "left",
    size: 10.62,
    tracking: -0.016,
    words: [
      // "YOU" va en itálica y más delgada; el resto derecho y en negritas.
      { text: "YOU", weight: 400, italic: true },
      { text: "ARE", at: 0.4, weight: 700 },
      { text: "NOT", at: 0.8, weight: 700 },
      { text: "A", at: 1.0, weight: 700 },
    ],
  },
  {
    kind: "line",
    start: 12.15,
    end: 14.15,
    x: 8.75,
    y: 49,
    anchor: "left",
    size: 8.44,
    tracking: 0.023,
    words: [
      { text: "CONTENT", italic: true, weight: 400 },
      { text: "CREATOR", at: 0.2, italic: true, weight: 400 },
    ],
  },
  {
    kind: "trail",
    start: 14.5,
    end: 16.9,
    tracking: -0.016,
    trails: [
      // "YOU": columna apretada que cae por el borde izquierdo.
      {
        text: "YOU",
        x: 9.1,
        y: 49,
        size: 10.62,
        weight: 400,
        italic: true,
        copies: 13,
        dx: -0.02,
        dy: 0.23,
        jx: 0.06,
        jy: 0.04,
        at: 0,
        step: 0.045,
      },
      // "ARE": columna que sube por el centro, abriéndose un poco a la derecha.
      {
        text: "ARE",
        x: 34.9,
        y: 49,
        size: 10.62,
        weight: 400,
        italic: true,
        copies: 8,
        dx: 0.067,
        dy: -0.37,
        jx: 0.1,
        jy: 0.06,
        at: 0.6,
        step: 0.06,
      },
      // "AN": no es una fila, es una MANCHA que cubre toda la derecha.
      // Va en retícula de 4 columnas × 5 renglones, encimada y desordenada.
      {
        text: "AN",
        x: 75.5,
        y: 49,
        size: 10.62,
        weight: 400,
        italic: true,
        copies: 18,
        cols: 4,
        gapX: 0.7,
        gapY: 0.5,
        dx: 0,
        dy: 0,
        jx: 0.34,
        jy: 0.22,
        shuffle: true,
        at: 1.15,
        step: 0.045,
      },
    ],
  },
  {
    kind: "line",
    start: 16.95,
    end: 21.1,
    x: 50,
    y: 49,
    anchor: "center",
    size: 7.08,
    tracking: 0.014,
    words: [{ text: "ARTIST", weight: 700 }],
  },
  // `size` es el ancho de la IMAGEN; la estrella ocupa ~0.63 de ese ancho,
  // por eso 21.7 deja los picos justo del tamaño que tienen en el video.
  { kind: "star", start: 21.15, end: 23.1, x: 50, y: 49.5, size: 21.7 },
  {
    kind: "signoff",
    start: 23.15,
    end: INTRO_LOOP,
    y: 49.5,
    size: 2.9,
    tracking: 0.05,
    inset: 3.5,
    left: "COMING",
    right: "SOON",
    logoWidth: 13.6,
  },
];

/**
 * La estrella. Es el MISMO logo blanco que usa el navbar en tema oscuro: se
 * comprobó que en el video aparece ese archivo, sin rotar (los seis picos caen
 * en los mismos ángulos).
 */
export const INTRO_STAR =
  "https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp";

/** Logo ovalado "INDEGO" del cierre (COMING · logo · SOON). */
export const INTRO_BADGE =
  "https://res.cloudinary.com/dij60ghdf/image/upload/v1772755261/Indg_Cd_White_zqimyq.png";
