"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useI18n } from "@/lib/i18n/context";
import { dictionaries, LANGS, type Lang } from "@/lib/i18n/dictionaries";
import { useMontado } from "@/lib/useMontado";

/**
 * CÓMO SE RECORRE ESTA PÁGINA — el letrero del panel de entrada.
 * --------------------------------------------------------------
 * Un renglón chico abajo del panel de entrada, sobre un vidrio esmerilado, que
 * dice con qué se mueve la página. Se desvanece conforme se avanza: ya no hace
 * falta cuando la persona entendió, y la instrucción se va sola sin que nadie
 * la cierre.
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
 * HASTA DÓNDE DURA EL LETRERO, en fracción del ancho del panel de entrada.
 *
 * A media pantalla de recorrido ya está en cero. Se quiso que se fuera ANTES de
 * que el panel termine de salir, no al mismo tiempo: si se apagara justo cuando
 * el panel se va, se leería como que se lo llevó el panel; apagándose antes se
 * lee como que ya cumplió y se retira.
 */
const HASTA = 0.5;

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
 * LOS DOS PRIMEROS NÚMEROS SON LOS QUE PROTEGEN EL CONTRASTE: hasta ahí el
 * vidrio va MACIZO, y ahí es donde vive el texto. Si se bajan, el degradado
 * empieza debajo de las letras y se lleva el tinte que las hace legibles sobre
 * la cascada. Los dos terminan en 100% —o sea, en el borde de la caja— para que
 * no quede ningún escalón: si acabaran antes, el vidrio se cortaría a filo
 * dentro del recuadro, que es exactamente lo que se está quitando.
 */
const DIFUMINADO =
  "linear-gradient(to top, #000 50%, transparent 100%), " +
  "linear-gradient(to right, #000 68%, transparent 100%)";

export default function ComoRecorrer({
  riel,
}: {
  /** El contenedor que se recorre. Vive en `app/about/page.tsx`. */
  riel: RefObject<HTMLElement | null>;
}) {
  const { lang } = useI18n();
  const montado = useMontado();
  const caja = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = riel.current;
    const nodo = caja.current;
    if (!el || !nodo) return;

    let pedido = false;

    const pintar = () => {
      pedido = false;

      /* El ancho del PANEL, no el de la pantalla: el letrero pertenece al panel
         de entrada y tiene que apagarse al ritmo en que ése se va. */
      const panel = nodo.parentElement?.offsetWidth ?? el.clientWidth;
      const avance = panel > 0 ? el.scrollLeft / (panel * HASTA) : 0;
      const queda = Math.min(Math.max(1 - avance, 0), 1);

      nodo.style.opacity = String(queda);
      /*
        APAGARLO DEL TODO CUANDO YA NO SE VE, y no solo dejarlo transparente:
        el vidrio esmerilado es `backdrop-filter`, de lo más caro que hay para
        dibujar, y a opacidad 0 el navegador lo seguiría calculando en cada
        cuadro del recorrido. Con `visibility` deja de existir.
      */
      nodo.style.visibility = queda <= 0.01 ? "hidden" : "visible";
    };

    const alRecorrer = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    pintar();
    el.addEventListener("scroll", alRecorrer, { passive: true });
    window.addEventListener("resize", alRecorrer);

    return () => {
      el.removeEventListener("scroll", alRecorrer);
      window.removeEventListener("resize", alRecorrer);
    };
    /* `montado` está en las dependencias porque antes de montar no se dibuja
       nada y `caja.current` es nulo: hay que volver a enganchar al aparecer. */
  }, [riel, montado]);

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
    */
    <div
      ref={caja}
      className="pointer-events-none absolute bottom-0 left-0 z-10"
      style={{ transition: "opacity 0.25s linear" }}
    >
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
          maskImage: DIFUMINADO,
          WebkitMaskImage: DIFUMINADO,
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
          EL RELLENO ES LO QUE LE DA SITIO AL DIFUMINADO. Por la izquierda va el
          mismo aire que el resto del panel, para que el texto caiga en la
          columna de lectura; por arriba y por la derecha va MUCHO más, y no es
          por gusto: ahí es donde el vidrio tiene que desvanecerse. Sin ese
          aire, el degradado empezaría encima de las letras y se comería el
          tinte justo debajo del texto — que es lo único que lo hace legible
          sobre la cascada.

          EL DE ABAJO ES EL MÁS CHICO DE TODOS, y bajó a propósito: el texto se
          veía trepado dentro del recuadro. La mitad de abajo es la parte del
          vidrio que va MACIZA (ver `DIFUMINADO`), así que centrar el renglón
          ahí —y no en la caja entera, que incluye todo el aire del
          desvanecido— es lo que hace que se vea asentado en lugar de flotando.
        */
        className="relative grid pb-3.5 pl-6 pr-32 pt-12 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground md:pl-12"
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
              className={`col-start-1 row-start-1 flex items-center gap-2 ${
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
