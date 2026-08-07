"use client";

import { useI18n } from "@/lib/i18n/context";
import { dictionaries, LANGS, type Lang } from "@/lib/i18n/dictionaries";
import { useMontado } from "@/lib/useMontado";

/**
 * CÓMO SE RECORRE ESTA PÁGINA — el letrero del panel de entrada.
 * --------------------------------------------------------------
 * Un renglón chico en la esquina de abajo a la izquierda del panel de entrada,
 * sobre un vidrio esmerilado, que dice con qué se mueve la página.
 *
 * SE QUEDA QUIETO. No se atenúa ni se apaga con el scroll: vive DENTRO del panel
 * de entrada, así que se va solo cuando el panel se va, y eso ya es toda la
 * salida que necesita. Llegó a desvanecerse conforme se avanzaba y se quitó el
 * 7-ago-2026 — un aviso que se apaga mientras lo estás leyendo se siente como
 * que el sitio te lo arrebata, y encima obligaba a escuchar el scroll para algo
 * que el propio panel resuelve gratis.
 *
 * DICE UNA COSA DISTINTA SEGÚN EL APARATO, y esa es la razón de que exista un
 * componente en vez de un texto suelto:
 *   · donde se toca con el dedo → "Desliza →";
 *   · donde hay cursor → "Arrastra / Rueda / ←→", que son las tres formas que
 *     de verdad funcionan ahí (ver los efectos del riel en
 *     `app/about/page.tsx`).
 * Mostrar las dos cosas a la vez sería ruido: nadie tiene mousepad y dedo sobre
 * la misma pantalla al mismo tiempo, y leer instrucciones que no aplican hace
 * dudar de las que sí.
 *
 * NO SE PUEDE DECIDIR EN EL SERVIDOR de qué aparato se trata, así que hasta que
 * monta no se dibuja nada (`useMontado`). Es lo mismo que hacen el logo del
 * navbar y el de la portada, y es preferible a que aparezca "Arrastra" un
 * instante en un teléfono.
 */

/**
 * CÓMO SE DESVANECE EL RECUADRO DE VIDRIO.
 *
 * Un recuadro esmerilado con el borde a filo se ve pegado encima del diseño: se
 * lee el rectángulo antes que el texto. Esto lo disuelve hacia ADENTRO de la
 * página por sus dos lados libres —arriba y a la derecha—, así que el vidrio
 * nace macizo en la esquina y se acaba sin que se vea dónde.
 *
 * SON DOS DEGRADADOS RECTOS QUE SE MULTIPLICAN, y no uno radial desde la
 * esquina, que fue el primer intento. El radial se descartó MIDIENDO: este
 * letrero es un renglón ANCHO Y BAJO, y una caída circular desde la esquina
 * llega al final del texto mucho antes que al borde de la caja — la máscara
 * valía 0.61 justo debajo de las últimas letras, o sea que ahí el tinte se
 * quedaba en 0.49 y volvía el problema de contraste que ya se había resuelto.
 * Para taparlo había que agrandar la caja a casi 500 px, más ancha que un
 * teléfono.
 *
 * Con dos degradados cada eje se ajusta por separado, que es justo lo que hacía
 * falta: mucho recorrido para desvanecerse a lo ancho y poco a lo alto.
 *
 * ESTOS NÚMEROS SON LOS QUE PROTEGEN EL CONTRASTE: hasta ahí el vidrio va
 * MACIZO, y ahí es donde vive el texto. Si se bajan, el degradado empieza
 * debajo de las letras y se lleva el tinte que las hace legibles sobre la
 * cascada. Los dos degradados terminan en 100% —o sea, en el borde de la caja—
 * para que no quede ningún escalón: si acabaran antes, el vidrio se cortaría a
 * filo dentro del recuadro, que es exactamente lo que se está quitando.
 *
 * SON DISTINTOS POR VARIANTE, y eso llegó al CENTRAR el texto (7-ago-2026).
 * Mientras el renglón vivía pegado a la esquina, sobraba sitio a la derecha y un
 * solo par de topes servía para las dos. Centrado, el texto se acerca al borde
 * derecho, y cuánto se acerca depende de lo largo que sea: "Desliza →" acaba en
 * el 80% del ancho y "Arrastra | Rueda | ←→" en el 89%. Con un tope único, o se
 * le comía el tinte al largo o el corto se quedaba sin desvanecido.
 *
 * LO QUE SE MANTIENE IGUAL EN LAS DOS no es el porcentaje sino los PÍXELES de
 * desvanecido (unos veinte), que es lo que de verdad se ve. Por eso el de
 * cursor, que tiene una caja mucho más ancha, lleva un porcentaje más alto.
 */
const MACIZO = {
  dedo: { x: 82, y: 70 },
  cursor: { x: 91, y: 70 },
};

const difuminado = ({ x, y }: { x: number; y: number }) =>
  `linear-gradient(to top, #000 ${y}%, transparent 100%), ` +
  `linear-gradient(to right, #000 ${x}%, transparent 100%)`;

export default function ComoRecorrer() {
  const { lang } = useI18n();
  const montado = useMontado();

  /*
    ¿ESTE APARATO SE TOCA? `pointer: coarse` es el dedo: pregunta por la
    PRECISIÓN del apuntador, no por el ancho de la pantalla. Un teléfono en
    horizontal y una laptop chica miden casi lo mismo, así que `md:` habría
    acertado por accidente unas veces y fallado otras. Además una laptop con
    pantalla táctil responde a las dos, y ahí gana el cursor: es lo que la
    persona tiene en la mano.
  */
  const conDedo =
    montado &&
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(pointer: fine)").matches;

  /* Cada variante desvanece a su ritmo: ver `MACIZO`. */
  const mascara = difuminado(conDedo ? MACIZO.dedo : MACIZO.cursor);

  if (!montado) return null;

  /* Una barra tenue entre las formas. Es el mismo recurso que el pie de página
     usa para separar sus enlaces, y aquí además insinúa teclas. */
  const separador = (
    <span aria-hidden className="opacity-30">
      |
    </span>
  );

  /**
   * EL RENGLÓN, EN EL IDIOMA QUE SE LE PIDA.
   *
   * Se saca a una función porque se dibuja UNA VEZ POR IDIOMA (ver abajo), no
   * solo en el que está activo.
   */
  const renglon = (d: (typeof dictionaries)[Lang]["about"]) =>
    conDedo ? (
      <>
        <span>{d.swipe}</span>
        {/* La flechita que pide: dice para qué lado, que es justo lo que no se
            adivinaba. */}
        <span aria-hidden>→</span>
      </>
    ) : (
      <>
        <span>{d.drag}</span>
        {separador}
        <span>{d.scroll}</span>
        {separador}
        {/* Las flechas del teclado. No se traducen: son símbolos. */}
        <span aria-hidden className="tracking-normal">
          ←→
        </span>
      </>
    );

  return (
    /*
      `absolute` DENTRO DEL PANEL, que por eso lleva `relative` (ver el panel de
      entrada en `app/about/page.tsx`). Si el panel no lo llevara, esto se
      mediría contra la página entera y estiraría el ancho del DOCUMENTO hasta
      donde cae el panel dentro del riel — que es exactamente el bug que rompió
      el sitio en Android.

      NACE EN LA ESQUINA, pegado al borde de abajo y al de la izquierda, sin
      márgenes. No es una pastilla flotando en el panel sino un pedazo de la
      esquina que está esmerilado. Por eso tampoco lleva esquinas redondeadas:
      el que se difumina es el propio recuadro.

      EL `env(safe-area-inset-bottom)` VA AQUÍ, EN EL RECUADRO ENTERO, y no en
      el relleno del texto como estaba antes (7-ago-2026). Puesto en el relleno,
      en un iPhone la caja CRECÍA hacia abajo y el renglón se subía dentro de
      ella — o sea que dejaba de estar centrado justo en los aparatos que tienen
      barra de gestos, y encima el techo del texto se metía en la zona del
      desvanecido. Aquí el recuadro conserva siempre las mismas medidas por
      dentro y simplemente se levanta lo que haga falta. En lo que no tiene esa
      barra, `env()` vale cero y queda pegado al filo como siempre.
    */
    <div className="pointer-events-none absolute bottom-[env(safe-area-inset-bottom)] left-0 z-10">
      {/*
        EL VIDRIO VA EN SU PROPIA CAPA, DEBAJO DEL TEXTO, y esto es lo que hace
        que el difuminado funcione: la máscara se come esta capa por las orillas
        —el desenfoque y el tinte juntos— pero NO toca el texto, que es hermano
        suyo y va encima entero. Si el difuminado se aplicara al elemento que
        contiene el texto, se llevaría también las letras y el letrero acabaría
        medio borrado justo donde hay que leerlo.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-surface/80 backdrop-blur-md"
        style={{
          maskImage: mascara,
          WebkitMaskImage: mascara,
          /*
            `intersect` MULTIPLICA las dos máscaras; sin esto se SUMAN, que es
            lo contrario de lo que se quiere (saldría más opaco donde debería
            desvanecerse). Van las dos formas de escribirlo porque los
            navegadores viejos de Apple solo entienden la suya.

            LA CAPA VA EN SU PROPIO NODO, no en el del texto, y eso es lo que
            permite enmascararla sin borrar las letras. Y la máscara va en el
            MISMO elemento que el `backdrop-filter`, no en un padre: un padre
            con máscara crearía una "raíz de fondo" y el desenfoque se quedaría
            sin nada que desenfocar.
          */
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      <p
        /*
          EL RELLENO ES PAREJO POR LOS CUATRO LADOS (7-ago-2026), y eso es lo
          que centra el renglón dentro del recuadro. Antes era muy desigual
          —mínimo abajo y a la izquierda, mucho arriba y a la derecha— porque
          ese aire era el sitio por donde el vidrio se desvanece; el renglón
          acababa arrinconado en su esquina.

          AL EMPAREJARLO, EL DESVANECIDO SE QUEDÓ SIN SITIO y hubo que
          devolvérselo por otro lado: subiendo los topes de `MACIZO`, o sea
          dejando más vidrio entero y desvaneciendo en una franja más angosta.
          Es el mismo aspecto con menos caja. **Los dos ajustes van juntos: si
          se toca este relleno hay que revisar aquellos topes, y al revés.**

          NO SE ALINEA CON LA COLUMNA DE LECTURA del panel (24 y 48 px), a
          propósito: esto no es contenido de la página sino un aviso pegado a la
          orilla, y alinearlo con el texto lo hacía parecer un párrafo más.

          El `env(safe-area-inset-bottom)` ya NO va aquí sino en el recuadro
          entero (ver arriba): metido en el relleno descentraba el texto justo
          en los aparatos con barra de gestos.
        */
        className="relative grid px-6 py-5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground"
      >
        {/*
          SE DIBUJAN TODOS LOS IDIOMAS, UNO ENCIMA DE OTRO, y solo se ve el
          activo.

          POR QUÉ: el recuadro se ajusta a su contenido, así que al cambiar de
          idioma CAMBIABA DE TAMAÑO — en inglés se encogía. Un elemento de la
          página que se estira y se encoge al tocar un botón que no tiene nada
          que ver se lee como un fallo.

          Los tres van en la MISMA celda de la retícula (`col-start-1
          row-start-1`), así que la celda mide lo que mide el MÁS ANCHO —hoy el
          español— y el recuadro ya no se mueve. Los que no tocan van con
          `invisible`, que es `visibility: hidden`: no se ven pero SIGUEN
          ocupando su sitio, que es justo lo que se necesita. Con `hidden` de
          Tailwind (`display: none`) no ocuparían nada y volvería el problema.

          SE SACA DEL DICCIONARIO EN VEZ DE ESCRIBIR UN ANCHO A MANO: si mañana
          se retoca una traducción o se agrega un idioma, el recuadro se ajusta
          solo. Un `min-width` en píxeles habría quedado viejo a la primera
          corrección de texto.

          Los invisibles llevan `aria-hidden` para que un lector de pantalla no
          lea el mismo aviso en todos los idiomas.
        */}
        {LANGS.map((idioma) => {
          const activo = idioma === lang;
          return (
            <span
              key={idioma}
              aria-hidden={!activo}
              lang={idioma}
              /* `justify-center`: los idiomas no miden lo mismo, y la celda de
                 la retícula la fija el más ancho. Sin esto, el más corto
                 quedaría pegado a la izquierda dentro de un recuadro pensado
                 para el otro — o sea, descentrado según el idioma. */
              className={`col-start-1 row-start-1 flex items-center justify-center gap-2 ${
                activo ? "" : "invisible"
              }`}
            >
              {renglon(dictionaries[idioma].about)}
            </span>
          );
        })}
      </p>
    </div>
  );
}
