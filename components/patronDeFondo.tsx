import { LOGOS_DE_MARCA } from "@/config/brand";

/**
 * PATRÓN DE FONDO DEL CATÁLOGO — el "papel de envoltura".
 *
 * Los logos de la marca repartidos por toda la página, ladeados a distintos
 * ángulos y en distintos tamaños, casi imperceptibles. La referencia es el papel
 * en el que envuelven la comida rápida: uno no lo mira, pero el lugar se siente
 * de la marca.
 *
 * SALEN LOS CUATRO LOGOS y en la MISMA PROPORCIÓN: la palabra INDEGO, los
 * niños, la estrella y el del countdown (ver `LOGOS_DE_MARCA` en
 * `config/brand.ts`). Cuatro formas distintas es lo que evita que se lea como
 * una cuadrícula; con una sola, por más que se gire, el ojo encuentra el patrón
 * enseguida. Se reparten por turnos, no al azar, justamente para que ninguno
 * salga de más.
 *
 * LOS CUATRO EN LOS DOS TEMAS. Antes cada tema enseñaba un logo distinto, y era
 * por accidente: los dos archivos que se usaban resultaron ser marcas distintas
 * y no el mismo logo en dos colores. Ahora el color se pide al vuelo con
 * `e_colorize` de Cloudinary, así que los cuatro existen en negro y en blanco.
 *
 * CUBRE TODA LA PÁGINA, PIE INCLUIDO, y se corta donde termina: es `absolute`
 * sobre el contenedor de la página, no `fixed` sobre la ventana. Para que se vea
 * a través del pie, `components/footer.tsx` ya no lleva fondo propio.
 *
 * NO ES UN COMPONENTE DE CLIENTE, a propósito: no tiene estado ni escucha nada.
 * El cambio de tema se resuelve poniendo LAS DOS versiones y escondiendo una con
 * CSS (`dark:hidden` / `hidden dark:block`) en vez de preguntarle el tema a
 * JavaScript — así no hay parpadeo al hidratar. Y como el navegador NO descarga
 * el fondo de un elemento escondido, la mitad que no se usa tampoco se baja.
 */

/**
 * DOS FORMAS DE USARLO, y no son la misma cosa:
 *
 *  · "catalogo" — el papel de envoltura de verdad: cubre TODA la página, de
 *    arriba abajo, y es lo más tenue que se puede.
 *
 *  · "panel" — un CINTILLO en la parte de arriba del panel, no un fondo
 *    completo. Salió de un accidente (se pidieron 14 piezas de las 60 y, como el
 *    reparto va por franjas de arriba abajo, las primeras 14 cayeron todas
 *    juntas arriba) y gustó, así que se dejó a propósito. Abajo queda aire, que
 *    es donde va el texto del bloque.
 *
 * Cada variante trae SUS PROPIOS NÚMEROS —cuántas piezas, hasta dónde llegan y
 * qué tan tenues— porque son dos usos distintos y ajustar uno no debe mover el
 * otro.
 *
 * LA OPACIDAD ES DISTINTA EN CADA TEMA, y no es capricho: sobre el crema del
 * tema claro un logo negro al 3.5% apenas se adivina; sobre el olivo del oscuro,
 * el mismo logo en blanco al mismo 3.5% se ve BASTANTE más. El blanco contra
 * fondo oscuro pesa más que el negro contra fondo claro, así que en oscuro
 * siempre va más bajo.
 */
const VARIANTES = {
  catalogo: {
    /**
     * UNA COLUMNA por 60 renglones: a lo largo la página es larguísima, así que
     * lo que hay que repartir parejo es lo vertical; a lo ancho las piezas van
     * sueltas. 60 es múltiplo de 4, para que los cuatro logos salgan el mismo
     * número de veces.
     */
    columnas: 1,
    renglones: 60,
    /** Hasta qué % del alto llegan las piezas. Toda la página. */
    hasta: 100,
    /** Medido contra la VENTANA: la página ocupa la ventana entera. */
    ancho: "clamp(90px, 12vw, 200px)",
    escala: [0.7, 1.5] as [number, number],
    emparejarPesos: false,
    opacidadClaro: 0.028,
    opacidadOscuro: 0.015,
  },
  panel: {
    /**
     * UNA REJA DE 5 × 4 dentro del cintillo. Antes era una sola hilera de 16
     * piezas con la altura al azar, y por eso quedaban huecos: en cada columna
     * caía UNA pieza a una altura cualquiera, así que la parte de hasta arriba
     * salía casi vacía en unos paneles y el 03 quedaba con claros. Con la reja,
     * cada celda tiene la suya y no hay zona sin logo.
     *
     * Las celdas son MÁS CHICAS que las piezas —a propósito—: por eso se
     * encaraman unas sobre otras y se ve apachurrado.
     */
    columnas: 8,
    renglones: 4,
    /**
     * EMPAREJA EL TAMAÑO DE LOS CUATRO LOGOS (le saca raíz al peso de cada uno).
     *
     * Los pesos de `LOGOS_DE_MARCA` están puestos para que los cuatro se vean
     * del mismo "peso visual" sueltos, y ahí la palabra INDEGO sale más del
     * doble de ancha que la estrella. En un fondo suelto da igual, pero en un
     * cintillo apretado hace las dos cosas que se veían mal a la vez: la palabra
     * se convierte en una plasta de tinta y los otros tres quedan tan chicos que
     * dejan huecos alrededor. La raíz acerca los cuatro sin igualarlos.
     */
    emparejarPesos: true,
    /**
     * Solo el cintillo de arriba, y BIEN arriba: tiene que terminar ANTES de
     * donde empieza el texto del bloque.
     *
     * OJO, ES EL CENTRO DE LA PIEZA Y NO SU ORILLA: las piezas van centradas en
     * su punto, así que la de más abajo se pasa unos puntos de este número. El
     * texto del bloque más apretado (el 03) empieza pasando el 26%.
     */
    hasta: 15,
    /**
     * Medido contra el PANEL (`cqw`) y no contra la ventana, y esto era el bug
     * del teléfono: con `vw`, en un celular el `clamp` se iba a su mínimo (90px)
     * y las piezas quedaban chiquitas y perdidas dentro del panel, mientras que
     * en computadora salían al doble. Ahora una pieza mide siempre lo mismo EN
     * PROPORCIÓN AL PANEL, se vea donde se vea. El mínimo en píxeles se queda de
     * red: un logo de 60px de ancho al 3% de opacidad ya no se ve.
     */
    ancho: "clamp(80px, 18cqw, 190px)",
    /**
     * Más chicas que en el catálogo, y con menos diferencia entre la más chica y
     * la más grande. La palabra INDEGO es el logo más ancho y más macizo de los
     * cuatro: pasado cierto tamaño deja de leerse como logo y se ve como una
     * plasta de tinta. Este techo es el que lo evita.
     */
    escala: [0.6, 1.05] as [number, number],
    opacidadClaro: 0.035,
    opacidadOscuro: 0.022,
  },
};

export type VariantePatron = keyof typeof VARIANTES;

/**
 * LAS POSICIONES SE CALCULAN UNA VEZ, CON UN AZAR CONTROLADO.
 *
 * `Math.random()` a secas NO sirve: el servidor y el navegador sacarían
 * posiciones distintas y React se quejaría de que el HTML no coincide. Este
 * generador arranca siempre de la misma semilla, así que da la misma secuencia
 * en los dos lados — se ve revuelto, pero es idéntico cada vez.
 *
 * EL REPARTO NO ES DEL TODO AL AZAR, y en dos cosas:
 *   · va POR CELDAS: se parte el espacio en una reja de `columnas` × `renglones`
 *     y cae una pieza en cada celda, empujada al azar DENTRO de la suya. Al puro
 *     azar salen montones y huecos, y los huecos es justo lo que no queremos.
 *     La forma de la reja es la del hueco que hay que llenar: el catálogo es una
 *     sola columna larguísima; el cintillo de un panel es ancho y bajito;
 *   · el logo se elige POR TURNOS y no al azar, para que los cuatro salgan el
 *     mismo número de veces. Al azar, con 60 piezas, uno podía salir 20 y otro
 *     9 — y se notaba.
 */
function reparte({
  columnas,
  renglones,
  hasta,
  escala: [escalaMin, escalaMax],
}: {
  columnas: number;
  renglones: number;
  hasta: number;
  escala: [number, number];
}) {
  let semilla = 20260806;
  const azar = () => {
    // Congruencial lineal, el generador de bolsillo de toda la vida.
    semilla = (semilla * 1103515245 + 12345) % 2147483648;
    return semilla / 2147483648;
  };

  const anchoCelda = 100 / columnas;
  const altoCelda = hasta / renglones;

  return Array.from({ length: columnas * renglones }, (_, i) => {
    const columna = i % columnas;
    const renglon = Math.floor(i / columnas);
    return {
      izquierda: columna * anchoCelda + azar() * anchoCelda,
      arriba: renglon * altoCelda + azar() * altoCelda,
      giro: (azar() - 0.5) * 50,
      escala: escalaMin + azar() * (escalaMax - escalaMin),
      logo: LOGOS_DE_MARCA[i % LOGOS_DE_MARCA.length],
    };
  });
}

const PIEZAS: Record<VariantePatron, ReturnType<typeof reparte>> = {
  catalogo: reparte(VARIANTES.catalogo),
  panel: reparte(VARIANTES.panel),
};

/**
 * EL ANCHO BASE va en `clamp` y no en píxeles fijos: con un tamaño fijo, lo que
 * en computadora era un detallito de fondo, en teléfono ocupaba casi medio ancho
 * de pantalla y las piezas se encimaban unas con otras. Cada variante trae el
 * suyo (ver `VARIANTES`) y NO se miden contra lo mismo: el catálogo contra la
 * ventana (`vw`), el cintillo contra su panel (`cqw`).
 *
 * EL ALTO NO SE CALCULA: lo saca la PROPORCIÓN de cada logo (`aspect-ratio`).
 * Es lo único que funciona con un ancho en `clamp`, porque ese número no existe
 * hasta que el navegador lo resuelve.
 */
function Capa({
  color,
  variante,
}: {
  color: "black" | "white";
  variante: VariantePatron;
}) {
  const { ancho: anchoBase, emparejarPesos } = VARIANTES[variante];
  const peso = (logo: (typeof LOGOS_DE_MARCA)[number]) =>
    emparejarPesos ? Math.sqrt(logo.ancho) : logo.ancho;
  return (
    <>
      {PIEZAS[variante].map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.izquierda}%`,
            top: `${p.arriba}%`,
            width: `calc(${anchoBase} * ${(peso(p.logo) * p.escala).toFixed(2)})`,
            aspectRatio: String(p.logo.proporcion),
            /* `-50%` centra la pieza en su punto, para que las de las orillas
               se salgan a medias y el patrón no tenga marco. */
            transform: `translate(-50%, -50%) rotate(${p.giro}deg)`,
            backgroundImage: `url(${p.logo.url(color)})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
      ))}
    </>
  );
}

/**
 * @param variante "catalogo" (fondo de toda la página) o "panel" (cintillo
 *   arriba). Ver `VARIANTES`. NO son intercambiables: el catálogo mide varias
 *   pantallas y un panel mide una, así que con las cuentas del catálogo los
 *   logos de un panel salen encimados.
 */
export default function PatronDeFondo({
  variante = "catalogo",
}: {
  variante?: VariantePatron;
}) {
  const v = VARIANTES[variante];
  return (
    /* `container-type: inline-size` deja medir las piezas contra el ANCHO DE
       ESTE CAJÓN (unidad `cqw`), que es lo que usa la variante de panel. */
    <div
      className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden [container-type:inline-size]"
      aria-hidden
    >
      {/* Tema CLARO: logos en negro sobre el crema. */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{ opacity: v.opacidadClaro }}
      >
        <Capa color="black" variante={variante} />
      </div>
      {/* Tema OSCURO: los mismos cuatro, en blanco sobre el olivo, y más tenues
          (el blanco sobre oscuro pesa más — ver arriba). */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ opacity: v.opacidadOscuro }}
      >
        <Capa color="white" variante={variante} />
      </div>
    </div>
  );
}
