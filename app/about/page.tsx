"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Navbar from "@/components/navbar";
import CartDrawer from "@/components/cartDrawer";
import AboutBlock from "@/components/aboutBlock";
import Convocatoria, { ConvocatoriaLlamado } from "@/components/convocatoria";
import PatronDeFondo from "@/components/patronDeFondo";
import PistaDelRiel from "@/components/pistaDelRiel";
import ComoRecorrer from "@/components/comoRecorrer";
import { Line } from "@/components/manifesto";
import {
  ABOUT_PORTADA,
  ABOUT_CIERRE,
  BLOQUES,
  MOSTRAR_HUECOS,
} from "@/config/about";
import { PRODUCTS } from "@/config/products";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

/**
 * LAS FOTOS DEL CARRUSEL: FRENTES Y ESPALDAS, REVUELTOS.
 *
 * Se toman TODAS las fotos de todas las playeras (cada una tiene frente y
 * espalda) y se acomodan alternando producto, para que no salgan las dos caras
 * de la misma prenda pegadas ni las tres espaldas seguidas.
 *
 * EL ORDEN ES FIJO, NO ALEATORIO, y esto importa: si se revolviera con
 * `Math.random()` el servidor y el navegador armarían órdenes distintos y React
 * se quejaría de que el HTML no coincide. Esta cuenta da un orden que PARECE
 * revuelto y es siempre el mismo.
 *
 * Cómo funciona: se recorren las fotos por POSICIÓN (primero todos los frentes,
 * luego todas las espaldas) pero desfasando el producto en cada vuelta. Con tres
 * playeras sale: frente 1, frente 2, frente 3, espalda 2, espalda 3, espalda 1.
 */
const FOTOS_DEL_CARRUSEL = (() => {
  const cuantasCaras = Math.max(...PRODUCTS.map((p) => p.images.length));
  const fotos: string[] = [];

  for (let cara = 0; cara < cuantasCaras; cara++) {
    for (let i = 0; i < PRODUCTS.length; i++) {
      // El desfase por vuelta es lo que rompe el patrón "1,2,3 / 1,2,3".
      const producto = PRODUCTS[(i + cara) % PRODUCTS.length];
      const foto = producto.images[cara];
      if (foto) fotos.push(foto);
    }
  }

  return fotos;
})();

/**
 * UNA TIRA del carrusel de fondo.
 *
 * CÓMO NO SE NOTA EL CORTE: la lista va DOS VECES y la animación recorre
 * exactamente media tira (`translateX(-50%)`, en `globals.css`). Cuando salta
 * de vuelta al inicio, lo que se ve es idéntico a lo que se veía, así que
 * parece infinita. Sin JavaScript ni temporizadores, y funciona igual de ida
 * que de vuelta (ver `alReves`).
 *
 * La opacidad y el aclarado NO están aquí sino en la clase `.carrusel` de
 * `globals.css`, porque CAMBIAN SEGÚN EL TEMA: en claro la banda es olivo
 * oscuro y las playeras hay que aclararlas o desaparecen; en oscuro la banda es
 * crema y resaltan solas. El porqué largo está allá.
 */
function TiraDeFondo({ alReves = false }: { alReves?: boolean }) {
  const tira = [...FOTOS_DEL_CARRUSEL, ...FOTOS_DEL_CARRUSEL];

  return (
    <div
      className={`carrusel flex h-1/3 w-max items-center ${
        alReves ? "carrusel-al-reves" : ""
      }`}
    >
      {tira.map((foto, i) => (
        /*
          LA SEPARACIÓN VA COMO `pr-*` EN CADA PIEZA, NO COMO `gap` EN LA TIRA,
          y esto NO es cuestión de gusto: con `gap`, N piezas dejan N−1 huecos,
          así que la mitad exacta de la tira cae medio hueco antes de donde
          empieza la copia — y el bucle daría un brinquito cada vuelta. Con el
          espacio metido en cada pieza, todas miden exactamente lo mismo, la
          mitad cae justo en la copia y el salto es invisible.
        */
        <div key={i} className="h-[88%] shrink-0 select-none pr-10 md:pr-20">
          <div className="relative h-full w-36 md:w-60">
            <Image
              src={foto}
              alt=""
              fill
              sizes="(max-width: 768px) 40vw, 240px"
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * EL CARRUSEL DE FONDO de la banda del cierre.
 *
 * TRES TIRAS de playeras pasando despacio por detrás del texto, sin parar. No
 * es decoración cualquiera: la banda dice "ve el drop", y de fondo está justo
 * lo que hay en el drop.
 *
 * LA DE EN MEDIO VA PARA UN LADO Y LAS DE AFUERA PARA EL OTRO. Tres tiras al
 * mismo ritmo y en la misma dirección se leen como una sola cosa moviéndose, y
 * el fondo se aplana; cruzadas se nota que son capas y la banda gana fondo sin
 * que nada le robe la atención a la frase.
 *
 * Son las MISMAS fotos del catálogo (`config/products.ts`), con las mismas
 * transformaciones de Cloudinary, así que el navegador ya las tiene en caché si
 * viene de ahí y no descarga nada nuevo — ni siquiera repitiéndolas tres veces.
 */
function CarruselDeFondo() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col overflow-hidden"
      aria-hidden
    >
      <TiraDeFondo alReves />
      <TiraDeFondo />
      <TiraDeFondo alReves />
    </div>
  );
}

/**
 * ¿ESTE BLOQUE OCUPA UN PANEL?
 *
 * Un bloque de foto o video sin archivo no dibuja nada. Cuando la página iba
 * hacia abajo eso no se notaba —simplemente no ocupaba alto—, pero en el riel
 * cada bloque reserva un panel ANCHO, así que uno vacío dejaba mil píxeles de
 * nada en medio del recorrido. Por eso se filtran.
 *
 * SALVO cuando se están dibujando los recuadros punteados: ahí sí ocupan su
 * panel, que es justamente lo que se quiere ver. La condición es la MISMA que
 * usa `components/aboutBlock.tsx` para decidir si pinta el recuadro — si se
 * separan, quedarían paneles vacíos o recuadros sin panel.
 */
const HAY_QUE_DIBUJAR_HUECOS =
  process.env.NODE_ENV === "development" || MOSTRAR_HUECOS;

function tieneContenido(block: (typeof BLOQUES)[number]): boolean {
  if (HAY_QUE_DIBUJAR_HUECOS) return true;
  if (block.tipo === "foto" || block.tipo === "video") return !!block.src;
  if (block.tipo === "duo") return !!(block.a.src || block.b.src);
  return true;
}

/**
 * CUÁNTAS REPETICIONES DEL LOGO SE DIBUJAN DE CADA LADO DEL TÍTULO.
 *
 * DE SOBRA A PROPÓSITO: la idea es que la cascada se SALGA del panel por arriba
 * y por abajo, para que se sienta que sigue más allá de lo que se ve. Las que
 * no caben las corta el panel (`overflow-hidden`) y no estorban. Si algún día
 * la pantalla es mucho más alta que ancha y se alcanza a ver dónde termina la
 * cascada, este es el número que hay que subir.
 */
const REPETICIONES_DEL_LOGO = 8;

/**
 * ALTO DE CADA REPETICIÓN.
 *
 * VA EN PÍXELES, NO EN PORCENTAJE, y esto costó un rato: un porcentaje se mide
 * contra el contenedor de la cascada, que es el que se lleva "lo que sobre"
 * del panel — así que las repeticiones salían de 32 px en vez de 90, o sea
 * diminutas, y encima cambiaban de tamaño según el largo del texto de al lado.
 * Con un alto fijo, la palabra mide siempre lo mismo y lo único que cambia con
 * la pantalla es CUÁNTAS se alcanzan a ver, que es justo el efecto que se
 * busca.
 *
 * El ancho lo saca la propia imagen: como es apaisada (casi 4 a 1), a 112 px de
 * alto la palabra mide unos 430 de ancho.
 *
 * EN TELÉFONO CASI NO BAJA (96 contra 112), aunque eso signifique ver menos
 * repeticiones: el punto de la cascada es que la palabra se lea grande y
 * cortada, y achicándola para que cupieran más se veía como un patrón de fondo
 * cualquiera. Caben menos y está bien — igual se salen de la pantalla.
 */
const ALTO_LOGO = "h-24 md:h-28";

/**
 * QUÉ TAN OPACA VA LA CASCADA.
 *
 * Al 100% competía con el título "Nosotros", que es lo que tiene que mandar en
 * ese panel. Este número la deja un pelín atrás sin que llegue a leerse como
 * fondo: sigue siendo un elemento de la composición, no textura. Se probó al 85%
 * y se quedaba corta —ahí sí empezaba a parecer fondo—, de ahí el 93%.
 */
const OPACIDAD_CASCADA = 0.93;

/**
 * CUÁNTO SE SALE EL LOGO POR LA IZQUIERDA.
 *
 * La palabra arranca FUERA del panel, así que lo primero que se ve es una "I"
 * partida a la mitad. Es lo que hace que se lea como un fragmento de algo más
 * grande y no como un logo acomodado.
 *
 * MEDIDO, no a ojo: a 112 px de alto la palabra mide unos 430 de ancho y la "I"
 * unos 52 de esos. Con 2.5% del panel se come ~18 px, o sea poco más de un
 * tercio de la letra.
 *
 * SE HA IDO AJUSTANDO A LA BAJA: con 4% dejaba un hilito de "I" y arrancaba
 * casi en la "N"; con 3% quedaba media letra. Ahora arranca un pelín más a la
 * derecha todavía.
 */
const CORTE_IZQUIERDA = "-2.5%";

/**
 * LA CASCADA: la palabra INDEGO repetida, apilada y cortada por los cuatro
 * lados.
 *
 * Va una arriba del título y otra abajo del párrafo. Lo que la vuelve cascada
 * —y no cuatro logos acomodados— son tres cosas:
 *
 *  1. REPETIDAS Y PEGADAS, sin aire entre ellas: se leen como una sola mancha
 *     que cae.
 *  2. SE SALEN POR ARRIBA Y POR ABAJO. Se dibujan de más y el panel las corta,
 *     así que no se ve dónde empieza ni dónde termina: la de arriba se pierde
 *     bajo el navbar y la de abajo se va por el borde de la pantalla.
 *  3. SE SALEN POR LA IZQUIERDA, media letra. Ver `CORTE_IZQUIERDA`.
 *
 * `justify-end` en la de arriba y `justify-start` en la de abajo: cada una se
 * ancla al texto y crece hacia AFUERA, para que la repetición pegada al título
 * siempre se vea completa y las que se cortan sean las de las orillas.
 *
 * SOLO LA PRIMERA LLEVA TEXTO ALTERNATIVO. Las demás van con `alt=""`: es la
 * misma palabra repetida, y un lector de pantalla diciéndola dieciséis veces
 * seguidas sería ruido, no información.
 */
function CascadaDeLogos({
  src,
  alt,
  haciaArriba = false,
}: {
  src: string;
  alt: string;
  /** La de encima del título: se ancla abajo y se corta por arriba. */
  haciaArriba?: boolean;
}) {
  if (!src) return null;

  return (
    /* `min-h-0` es lo que le permite a un hijo de flex ser MÁS CHICO que su
       contenido; sin eso el contenedor se estiraría para que quepan las ocho
       repeticiones y empujaría el texto fuera del panel. */
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
        haciaArriba ? "justify-end" : "justify-start"
      }`}
    >
      {Array.from({ length: REPETICIONES_DEL_LOGO }).map((_, i) => (
        /* `select-none` + `pointer-events-none`: la cascada es TEXTURA, no
           contenido. Sin esto, al arrastrar para seleccionar el texto de la
           entrada se marcaban también las imágenes del logo, y al soltar
           quedaban resaltadas en azul. */
        <div
          key={i}
          className={`pointer-events-none relative w-full shrink-0 select-none ${ALTO_LOGO}`}
          style={{ left: CORTE_IZQUIERDA, opacity: OPACIDAD_CASCADA }}
        >
          <Image
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            priority={i < 2}
            sizes="(max-width: 768px) 92vw, 720px"
            className="object-contain object-left"
          />
        </div>
      ))}
    </div>
  );
}

/*
  AQUÍ VIVÍA UN COMPONENTE `Panel` GENÉRICO. Se quitó (6-ago-2026) porque acabó
  sin usuarios: cada panel del riel terminó necesitando algo distinto —el de
  entrada no puede llevar relleno lateral (la cascada tiene que llegar al borde
  para cortarse), los de bloque los envuelve la lista, la banda del cierre es un
  enlace y los de la convocatoria llevan sus propias medidas—, así que un molde
  común solo escondía las diferencias.

  LO QUE SÍ COMPARTEN TODOS, y hay que respetar al agregar uno nuevo:
    relative h-full shrink-0 border-l border-foreground/10
  `shrink-0` es lo importante: sin eso, flex apachurra los paneles para que
  quepan y ya no hay nada que recorrer.

  `relative` PARECE DE ADORNO Y NO LO ES: es lo que hace que los hijos
  posicionados de un panel se midan CONTRA EL PANEL. Sin él, un hijo `absolute`
  se mide contra la página entera y entonces el `overflow` del riel ya no lo
  recorta: se queda dibujado a miles de píxeles a la derecha —donde cae ese
  panel dentro del riel— y estira el ancho del DOCUMENTO hasta allá. Eso es
  exactamente lo que rompió el sitio en Android (ver el manual). Un panel del
  riel SIEMPRE va `relative`, aunque hoy no tenga nada posicionado adentro.
*/

/**
 * NOSOTROS — la página de marca.
 *
 * SE RECORRE HACIA LA DERECHA (6-ago-2026), no hacia abajo: los bloques van en
 * fila y la página mide exactamente una pantalla de alto. En teléfono el dedo
 * ya sabe hacer eso solo; en computadora hay que traducir la rueda del ratón,
 * que gira en vertical (ver el `useEffect` de abajo).
 *
 * ESTA PÁGINA NO TIENE CONTENIDO PROPIO: todo lo que se ve sale de
 * `config/about.ts`. Para llenarla o reordenarla, ese es el único archivo que
 * hay que abrir. Aquí solo está el armazón (portada, la lista de bloques, la
 * banda del cierre y la convocatoria) y el orden en que se apilan.
 *
 * NO ES LA TIENDA CON OTRO TEXTO. Comparte la piel —Helvetica, los colores del
 * tema, el grano— pero su composición es otra: rejilla asimétrica, secciones
 * numeradas separadas por líneas y etiquetas que se quedan fijas mientras el
 * texto pasa. El razonamiento completo está en `components/aboutBlock.tsx`.
 *
 * ES PÚBLICA, incluso antes del drop: el candado de `proxy.ts` solo cubre
 * `/product`, así que esta página se puede compartir desde Instagram mientras
 * el countdown sigue corriendo. Si algún día se quiere esconder hasta el
 * lanzamiento, se agrega "/about" al `matcher` de ese archivo.
 */
export default function AboutPage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const riel = useRef<HTMLElement>(null);

  /* Evita el parpadeo de hidratación: el servidor no sabe qué tema tiene quien
     visita, así que la imagen que cambia con el tema (ver la portada) espera a
     que esto sea `true`. Mismo truco que `components/navbar.tsx`. */
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  /*
    CUÁL DE LAS DOS VERSIONES DEL LOGO. El archivo es de un solo color, así que
    el negro se pierde sobre el olivo del tema oscuro igual que el blanco sobre
    el crema del claro.

    Hasta que `montado` sea `true` se usa el negro: en el servidor no se sabe qué
    tema tiene quien visita, y elegir ahí provocaría un parpadeo al hidratar.
    Mismo truco que el logo del navbar.
  */
  const logoDeEntrada =
    montado && resolvedTheme === "dark" && ABOUT_PORTADA.imagenOscuro
      ? ABOUT_PORTADA.imagenOscuro
      : ABOUT_PORTADA.imagen;

  /*
    ARRANCAR ARRIBA DEL TODO, SIEMPRE.

    Esta página no se recorre hacia abajo, así que cualquier posición vertical
    heredada es basura — y heredarla se veía FEO EN ANDROID: llegando aquí
    después de un "atrás" del navegador, la página aparecía desplazada hasta el
    fondo y en blanco, y había que subir a mano para ver algo.

    Pasaba porque el navegador RESTAURA el scroll de la página anterior al
    volver, y el cambio de página del lado del cliente no siempre lo pisa a
    tiempo. Aquí se pone en cero y listo.

    ANTES AQUÍ SE APAGABA EL SCROLL DEL DOCUMENTO (`documentElement.style
    .overflow = "hidden"`). Se quitó: era un parche para quince píxeles de barra
    vertical en COMPUTADORA, y esos quince píxeles ya no existen desde que la
    barra del riel se esconde (clase `.sin-barra`). En el teléfono no arreglaba
    nada y sí dejaba el documento congelado en una posición heredada, que es
    parte de lo que se veía roto en Android. Si algún día reaparece esa barrita
    de más, el arreglo NO es volver a congelar el documento.
  */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /*
    LA RUEDA DEL RATÓN GIRA HACIA ABAJO, y aquí no hay abajo. Esto traduce ese
    giro en avance hacia la derecha. En teléfono no hace nada: el dedo ya
    desliza en horizontal por su cuenta.

    TRES CUIDADOS, y los tres son la diferencia entre que se sienta natural o
    que se sienta secuestrado:

    1. SI EL GESTO YA ES HORIZONTAL (trackpad de laptop, ratón con rueda
       lateral), no se toca nada: el navegador ya lo está haciendo bien.
    2. SI EL PANEL DE ABAJO DEL CURSOR SE PUEDE RECORRER HACIA ABAJO —el del
       formulario, por ejemplo—, primero se recorre ÉSE. Solo cuando llega a su
       tope, el giro pasa a mover el riel. Si no, sería imposible llenar el
       formulario con la rueda.
    3. `passive: false` es obligatorio para poder cancelar el gesto. Sin eso el
       navegador ignora el `preventDefault()` y la página pelea consigo misma.
  */
  useEffect(() => {
    const el = riel.current;
    if (!el) return;

    const alGirar = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const panel = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-panel]",
      );
      if (panel && panel.scrollHeight > panel.clientHeight + 1) {
        const enElTope = panel.scrollTop <= 0 && e.deltaY < 0;
        const enElFondo =
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 &&
          e.deltaY > 0;
        if (!enElTope && !enElFondo) return;
      }

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", alGirar, { passive: false });
    return () => el.removeEventListener("wheel", alGirar);
  }, []);

  /*
    LAS OTRAS DOS FORMAS DE MOVERLO: EL TECLADO Y EL ARRASTRE (7-ago-2026).

    POR QUÉ HACEN FALTA. La rueda ya cubre al ratón y —traduciendo el giro
    vertical— también al mousepad, que es como se mueve la mayoría. Pero en esta
    página no hay barra de desplazamiento ni ningún control a la vista, así que
    quien llegue con un ratón sin rueda, o sin saber el gesto lateral del
    mousepad, se queda sin ninguna salida evidente. Estas dos la dan.

    EL ARRASTRE ES, ADEMÁS, LA PISTA DE ESCRITORIO: el cursor se vuelve una mano
    (`.riel-arrastrable` en `globals.css`), y eso ya dice "esto se jala" sin
    dibujar ningún botón. Es el equivalente de escritorio a lo que el
    empujoncito y la rayita hacen en teléfono.

    SOLO CON RATÓN (`pointerType === "mouse"`). En pantalla táctil el dedo ya
    arrastra solo, y meterse en medio nos costaría el desplazamiento con inercia
    del sistema, que es mejor que cualquier cosa que escribamos aquí.

    NUNCA SOBRE UN CAMPO DEL FORMULARIO. Ni el arrastre ni el teclado: en la
    convocatoria hay que poder seleccionar texto con el ratón, y las flechas y
    Inicio/Fin tienen que mover el cursor de escritura, no la página.
  */
  useEffect(() => {
    const el = riel.current;
    if (!el) return;

    /** Dónde NO mandamos nosotros: ahí escribe la gente. */
    const CAMPOS = "input, textarea, select, [contenteditable='true']";

    /*
      ------------------------------------------------------------------
      ARRASTRE CON EL RATÓN
      ------------------------------------------------------------------
    */

    /** Cuánto hay que mover antes de considerarlo arrastre y no un clic.
        Sin este margen, un clic con la mano poco firme movería la página y
        además se comería el clic (ver `matarElClic`). */
    const UMBRAL = 6;

    let apretado = false;
    /** ¿Ya pasó el umbral? Es lo que distingue un clic de un arrastre. */
    let arrastrando = false;
    let xInicial = 0;
    let scrollInicial = 0;
    let puntero = -1;

    /*
      EL CLIC QUE VIENE DETRÁS DEL ARRASTRE HAY QUE MATARLO. Si no, soltar
      encima de la banda del cierre —que es un enlace del tamaño del panel— te
      manda al catálogo cuando lo único que querías era recorrer la página.
      Va en fase de captura para llegar antes que el enlace, y `once` porque es
      para ESE clic y ninguno más.
    */
    const matarElClic = (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
    };

    const alApretar = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if ((e.target as HTMLElement).closest(CAMPOS)) return;

      apretado = true;
      arrastrando = false;
      xInicial = e.clientX;
      scrollInicial = el.scrollLeft;
      puntero = e.pointerId;
    };

    const alMover = (e: PointerEvent) => {
      if (!apretado) return;

      const avance = e.clientX - xInicial;

      if (!arrastrando) {
        if (Math.abs(avance) < UMBRAL) return;
        arrastrando = true;
        /* Capturar el puntero: si la mano se sale de la ventana a media
           jalada, los eventos siguen llegando aquí y el riel no se queda
           pegado a medio camino. */
        el.setPointerCapture(puntero);
        el.classList.add("arrastrando");
      }

      /* Sin esto el navegador empieza a SELECCIONAR el texto por debajo y
         queda todo resaltado en azul al soltar. */
      e.preventDefault();
      el.scrollLeft = scrollInicial - avance;
    };

    const alSoltar = () => {
      if (!apretado) return;
      apretado = false;
      if (!arrastrando) return;

      arrastrando = false;
      el.classList.remove("arrastrando");
      if (el.hasPointerCapture(puntero)) el.releasePointerCapture(puntero);

      window.addEventListener("click", matarElClic, {
        capture: true,
        once: true,
      });
      /* Si se soltó donde no hay nada que reciba clic, el de arriba nunca se
         gasta y se quedaría esperando para comerse un clic legítimo después.
         Este `setTimeout` lo retira: el clic del navegador llega antes. */
      window.setTimeout(() => {
        window.removeEventListener("click", matarElClic, { capture: true });
      }, 0);
    };

    /*
      ------------------------------------------------------------------
      TECLADO
      ------------------------------------------------------------------
      Va en `window` y no en el riel: así funciona sin tener que picar la
      página primero, que es justo lo que no se le ocurre a nadie.

      SOLO IZQUIERDA Y DERECHA, no arriba y abajo: el panel del formulario se
      recorre hacia abajo por dentro, y quitarle sus flechas lo volvería
      imposible de llenar con el teclado.

      POR QUÉ NO ES UN `scrollTo({behavior:"smooth"})` POR FLECHAZO, que es lo
      obvio y fue lo primero que se hizo: **se sentía lento y trabado**, y con
      razón. Al mantener la flecha, el sistema repite la tecla unas treinta
      veces por segundo, y cada repetición ARRANCABA UNA ANIMACIÓN NUEVA que
      pisaba la anterior antes de que terminara. El resultado es un tirón por
      repetición en vez de un movimiento: mientras más rápido teclees, peor.

      Lo que hay ahora es un solo bucle con DOS NÚMEROS: una META (a dónde
      queremos llegar) y la posición real, que se acerca a la meta un pedacito
      por cuadro. Nada reinicia nada:

        · un toque suelto empuja la meta un IMPULSO y el riel se desliza hasta
          allá;
        · mantener la flecha corre la meta a VELOCIDAD constante, así que sale
          un desplazamiento continuo y parejo en vez de treinta tirones;
        · Inicio/Fin y Re Pág/Av Pág solo ponen la meta en otro lado y el mismo
          bucle los lleva.
    */

    /** Lo que avanza un toque suelto. Las flechas del navegador mueven unos
        40 px, y con paneles de 700 px eso serían veinte golpes por panel. */
    const IMPULSO = 200;
    /** A qué ritmo corre la meta mientras la flecha está apretada, en píxeles
        por segundo. Se mide contra el TIEMPO y no contra los cuadros para que
        se mueva igual en una pantalla de 60 Hz que en una de 120. */
    const VELOCIDAD = 1100;
    /** Qué fracción de lo que falta se recorre en un cuadro de 60 Hz. Más alto
        llega antes y se siente más seco; más bajo se siente flotado. */
    const SUAVIZADO = 0.16;
    /** A menos de esto, ya llegamos: se asienta el número y el bucle para. */
    const CERCA = 1;

    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /** Direcciones apretadas ahora mismo. Es un conjunto y no un booleano
        porque se pueden tener las dos flechas apretadas a la vez. */
    const apretadas = new Set<number>();
    let meta = 0;
    let corriendo = false;
    let cuadro = 0;
    let ultimoInstante = 0;
    /** Lo último que ESTE bucle escribió. Sirve para notar que alguien más
        movió el riel (la rueda, un arrastre) y quitarse de en medio. */
    let ultimoAplicado = -1;

    const tope = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const acotar = (n: number) => Math.min(Math.max(n, 0), tope());

    const parar = () => {
      corriendo = false;
      if (cuadro) cancelAnimationFrame(cuadro);
      cuadro = 0;
      apretadas.clear();
    };

    const avanzar = (instante: number) => {
      if (!corriendo) return;

      /* ¿Nos movieron por debajo? Entonces el teclado ya no manda. */
      if (ultimoAplicado >= 0 && Math.abs(el.scrollLeft - ultimoAplicado) > 2) {
        parar();
        return;
      }

      const delta = Math.min((instante - ultimoInstante) / 1000, 0.05);
      ultimoInstante = instante;

      for (const direccion of apretadas) {
        meta = acotar(meta + direccion * VELOCIDAD * delta);
      }

      const falta = meta - el.scrollLeft;
      if (Math.abs(falta) < CERCA && apretadas.size === 0) {
        el.scrollLeft = meta;
        ultimoAplicado = el.scrollLeft;
        parar();
        return;
      }

      /* El suavizado está calibrado para 60 Hz; en pantallas más rápidas hay
         que aplicarlo más veces por segundo o el movimiento saldría lento. */
      const fraccion = 1 - Math.pow(1 - SUAVIZADO, delta * 60);
      let paso = falta * fraccion;

      /*
        EL ÚLTIMO TRAMO SE DA DE UNA VEZ, y esto NO es un detalle estético.
        Acercarse por fracciones significa que el paso se hace cada vez más
        chico; en cuanto baja del píxel, el navegador lo redondea a CERO y el
        riel deja de moverse — pero la meta sigue lejos, así que la condición de
        "ya llegamos" nunca se cumple y el bucle se queda girando para siempre,
        pidiendo un cuadro tras otro sin mover nada.
        Se detectó midiendo: "Fin" se quedaba 3 px antes del tope e "Inicio" no
        llegaba nunca a 0. Cuando el paso suavizado ya no alcanza un píxel, se
        salta lo que falte de golpe: son unos pocos píxeles, no se ve, y el
        bucle termina de verdad.
      */
      if (Math.abs(paso) < 1) paso = falta;

      el.scrollLeft += paso;
      ultimoAplicado = el.scrollLeft;

      cuadro = requestAnimationFrame(avanzar);
    };

    const arrancar = () => {
      if (!corriendo) {
        corriendo = true;
        /* La meta parte de donde REALMENTE está el riel, no de donde la dejamos
           la última vez: en medio pudo haber un arrastre o una rueda. */
        meta = acotar(el.scrollLeft);
        ultimoAplicado = el.scrollLeft;
      }
      /*
        SE PREGUNTA POR EL CUADRO PENDIENTE, no solo por `corriendo`. Son dos
        cosas distintas —"el teclado manda" y "hay un cuadro en camino"— y
        confundirlas deja un agujero: si alguna vez quedara marcado como
        corriendo sin cuadro pendiente, el bucle estaría muerto y ninguna tecla
        lo revivriría, porque la comprobación de `corriendo` se saldría antes de
        pedir uno nuevo. Con esto, cualquier tecla siempre reengancha.
      */
      if (!cuadro) {
        ultimoInstante = performance.now();
        cuadro = requestAnimationFrame(avanzar);
      }
    };

    const alTeclear = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if ((e.target as HTMLElement)?.closest?.(CAMPOS)) return;

      const esFlecha = e.key === "ArrowRight" || e.key === "ArrowLeft";
      if (
        !esFlecha &&
        e.key !== "PageDown" &&
        e.key !== "PageUp" &&
        e.key !== "Home" &&
        e.key !== "End"
      ) {
        return;
      }

      e.preventDefault();
      arrancar();

      if (esFlecha) {
        const direccion = e.key === "ArrowRight" ? 1 : -1;
        /* La repetición del sistema NO suma impulso: de eso se encarga
           `VELOCIDAD` mientras la tecla siga apretada. Sumar aquí sería volver
           al atropello de antes. */
        if (!e.repeat) meta = acotar(meta + direccion * IMPULSO);
        apretadas.add(direccion);
      } else if (e.key === "PageDown") {
        meta = acotar(meta + el.clientWidth * 0.9);
      } else if (e.key === "PageUp") {
        meta = acotar(meta - el.clientWidth * 0.9);
      } else if (e.key === "Home") {
        meta = 0;
      } else {
        meta = tope();
      }

      /* Quien pidió que nada se mueva solo llega de un salto. */
      if (sinMovimiento) {
        el.scrollLeft = meta;
        ultimoAplicado = el.scrollLeft;
      }
    };

    const alSoltarTecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") apretadas.delete(1);
      if (e.key === "ArrowLeft") apretadas.delete(-1);
    };

    /* Si la ventana pierde el foco con la tecla apretada, el `keyup` nunca
       llega y el riel se quedaría corriendo solo para siempre. */
    const alPerderFoco = () => apretadas.clear();

    el.addEventListener("pointerdown", alApretar);
    el.addEventListener("pointermove", alMover);
    el.addEventListener("pointerup", alSoltar);
    el.addEventListener("pointercancel", alSoltar);
    window.addEventListener("keydown", alTeclear);
    window.addEventListener("keyup", alSoltarTecla);
    window.addEventListener("blur", alPerderFoco);

    return () => {
      parar();
      el.removeEventListener("pointerdown", alApretar);
      el.removeEventListener("pointermove", alMover);
      el.removeEventListener("pointerup", alSoltar);
      el.removeEventListener("pointercancel", alSoltar);
      window.removeEventListener("keydown", alTeclear);
      window.removeEventListener("keyup", alSoltarTecla);
      window.removeEventListener("blur", alPerderFoco);
      window.removeEventListener("click", matarElClic, { capture: true });
    };
  }, []);

  /*
    EL EMPUJONCITO (7-ago-2026): al llegar, el riel se asoma solo un poco a la
    derecha y regresa.

    EL PROBLEMA QUE RESUELVE: en teléfono nadie adivinaba que esta página se
    recorre de lado. Un letrero de "desliza →" lo diría, pero mete un elemento
    de interfaz en la única página del sitio que no tiene ninguno; moverlo lo
    ENSEÑA en vez de explicarlo, y no deja nada dibujado. La rayita de abajo
    (`components/pistaDelRiel.tsx`) es la otra mitad de la respuesta: el
    empujón enseña el gesto una vez, la rayita se queda de referencia.

    CUATRO CANDADOS, y cada uno tapa una forma distinta de quedar mal:

    1. SI YA ESTÁ TOCANDO, NO SE MUEVE NADA. Cualquier gesto —dedo, rueda,
       teclado— cancela el empujón, incluso a media animación. Que la página se
       mueva sola contra la mano de alguien se siente descompuesto, no
       simpático. Los eventos van en `window` para agarrar el gesto venga de
       donde venga, no solo del riel.
    2. SOLO DESDE EL PRINCIPIO. Si el navegador restauró una posición previa
       (volver con el botón de atrás), el empujón la pisaría y lo devolvería a
       la entrada.
    3. SOLO SI HAY A DÓNDE IR. En una pantalla ancha donde todo cabe, no hay
       recorrido que enseñar.
    4. RESPETA "REDUCIR MOVIMIENTO". Quien pidió que las cosas no se muevan
       solas se queda con la rayita, que dice lo mismo sin moverse.

    LA ESPERA NO ES CAPRICHO: la página entra con un fundido de 0.55s
    (`.entrada` en `globals.css`). Empujar durante el fundido se ve como un
    salto del render, no como una invitación.
  */
  useEffect(() => {
    const el = riel.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /*
      SOLO EN APARATOS TÁCTILES (7-ago-2026, después de verlo en computadora).
      En teléfono el empujón es la única forma de enseñar el gesto. En
      computadora sobraba y se sentía raro: ahí ya está el cursor de mano, que
      dice "esto se jala" sin moverle nada a nadie, y el letrero de abajo con
      las tres formas. Una página que se mueve sola cuando no la tocaste se lee
      como un fallo, no como una invitación.
    */
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    /*
      CUÁNTO SE ASOMA.

      AHORA ES EL ÚNICO MOMENTO EN QUE SE VE EL PANEL SIGUIENTE, y por eso subió
      (7-ago-2026): el panel de entrada pasó a medir la pantalla justa en
      teléfono, así que ya no hay filo asomado en reposo. Con 56 px fijos el
      asomo se leía como un temblor; el empujón tiene que ENSEÑAR que detrás hay
      otro panel, de otro color.

      VA EN PROPORCIÓN A LA PANTALLA y no en píxeles fijos: 56 px son un 14% de
      un teléfono chico y un 7% de una tableta, o sea el mismo gesto contando
      dos cosas distintas. Los topes evitan los dos extremos —que en una
      pantalla diminuta el asomo se coma media portada, y que en una grande no
      se note.
    */
    const ASOMO = Math.min(Math.max(Math.round(el.clientWidth * 0.18), 56), 96);
    /** Cuánto tarda en arrancar, contado desde que se monta la página. */
    const ESPERA = 900;
    /** Cuánto se queda asomado antes de regresar. El scroll suave del navegador
        se come unos 300 ms de ida, así que esto deja ~350 ms de pausa real. */
    const PAUSA = 650;

    let cancelado = false;
    const cancelar = () => {
      cancelado = true;
    };

    const gestos = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    for (const g of gestos) {
      window.addEventListener(g, cancelar, { passive: true });
    }

    let regreso: number | undefined;
    const salida = window.setTimeout(() => {
      if (cancelado) return;
      if (el.scrollLeft !== 0) return;
      if (el.scrollWidth - el.clientWidth < ASOMO) return;

      el.scrollTo({ left: ASOMO, behavior: "smooth" });

      regreso = window.setTimeout(() => {
        if (cancelado) return;
        el.scrollTo({ left: 0, behavior: "smooth" });
      }, PAUSA);
    }, ESPERA);

    return () => {
      window.clearTimeout(salida);
      window.clearTimeout(regreso);
      for (const g of gestos) window.removeEventListener(g, cancelar);
    };
  }, []);

  /*
    Numeración de las secciones de texto (01, 02, 03…). Se calcula aquí y no en
    `config/about.ts` para que reordenar los bloques no obligue a renumerarlos a
    mano: el número sale del orden real, siempre.
  */
  let cuenta = 0;
  const numeros = BLOQUES.map((b) =>
    b.tipo === "texto" ? String(++cuenta).padStart(2, "0") : undefined,
  );

  /*
    DÓNDE CAE LA BANDA DEL CIERRE: justo después de la FRASE ANCLA, ya no al
    final de la página.

    Antes cerraba el Nosotros, y quedaba demasiado tarde: para cuando alguien
    llegaba ahí ya había leído todo, y el empujón al catálogo aparecía cuando la
    visita estaba por terminar. Pegada a la frase ancla —lo único que se lee en
    voz de marca— la salida al drop existe desde el arranque.

    Se busca por TIPO y no con un número escrito a mano, para que reordenar los
    bloques en `config/about.ts` no la deje en un lugar absurdo. Va detrás del
    manifiesto, y si no hubiera, detrás de la primera frase suelta. Si no hay
    ninguno de los dos, `findIndex` devuelve -1 y la banda sale al final (ver el
    `return`).
  */
  const indiceCierre = BLOQUES.findIndex(
    (b) => b.tipo === "manifiesto" || b.tipo === "frase",
  );

  /*
    LA BANDA. Es la ÚNICA invertida de la página, y ahora además la única con
    algo moviéndose detrás. Se arma aquí como variable —y no en el JSX— porque
    tiene que poder dibujarse en dos lugares distintos según haya frase o no.
  */
  const cierre = ABOUT_CIERRE ? (
    /*
      LA BANDA ENTERA ES EL ENLACE (6-ago-2026). Antes era una frase con un
      "VER DROP #1" chiquito debajo; ahora el rectángulo completo se puede
      picar y la frase dice a dónde lleva, así que ese enlace de más sobraba.
      Un blanco de clic del tamaño de la pantalla no se falla ni con el pulgar.

      OJO: antes del drop, /product manda al countdown a quien no tenga la
      clave de acceso. Es a propósito (misma decisión que en las páginas por
      producto): está bien que vean el countdown.

      `relative` + `overflow-hidden` son lo que encierra al carrusel: sin ellos
      la tira se saldría de la banda y taparía media página.

      Al pasar el cursor NO se atenúa la banda entera —eso apagaría también el
      carrusel y se vería como un error—: se atenúa solo la frase, con
      `group-hover`.
    */
    <Link
      href="/product"
      aria-label={t.about.cta}
      className="group relative flex h-full w-[min(94vw,900px)] shrink-0 items-center overflow-hidden bg-foreground px-6 text-background md:px-12"
    >
      <CarruselDeFondo />

      {/* `relative` otra vez, para que el texto quede ENCIMA de la tira. */}
      <div className="relative w-full">
        <p
          className="font-bold uppercase transition-opacity duration-300 group-hover:opacity-60"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 5.5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          <Line line={ABOUT_CIERRE} />
        </p>
      </div>
    </Link>
  ) : null;

  return (
    /*
      `h-dvh` + `overflow-hidden`: la página mide EXACTAMENTE una pantalla y no
      se mueve para abajo. Todo el recorrido pasó a ser horizontal.
    */
    <div className="entrada flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Navbar />

      {/* LA ETIQUETA DEL DROP la dibuja el navbar, montada en su borde de
          abajo (ver `components/dropTag.tsx`). Se probó suelta desde aquí,
          pegada a la pantalla, y se regresó a la barra. */}

      {/*
        EL RIEL. Aquí es donde la página se voltea: en vez de apilarse hacia
        abajo, los bloques se ponen en fila y se recorren hacia la derecha.
        `pt-20` es el hueco de la barra fija, que antes era un div vacío.

        `overscroll-x-none` NO ES UN DETALLE (7-ago-2026). Sin eso, al arrastrar
        más allá del primer panel el teléfono estira el riel —el rebote elástico
        de siempre— y deja ver una franja del fondo de la página por la
        izquierda, como si al diseño le faltara un pedazo. No se arregla
        pintando ese fondo de otro color: el mismo rebote pasa al FINAL del
        recorrido, y allá el último panel es de otro tono, así que no hay un
        solo color que sirva en las dos orillas. Se quita el rebote y ya.
      */}
      <main
        ref={riel}
        className="sin-barra riel-arrastrable flex flex-1 overflow-x-auto overflow-y-hidden overscroll-x-none pt-20"
        style={{ fontFamily: HELVETICA }}
      >
        {/*
          EL PANEL DE ENTRADA. NO usa el `Panel` genérico, y es por una razón
          concreta: aquí el relleno lateral NO puede ser del panel. El texto sí
          lo lleva, pero la cascada de logos tiene que llegar hasta el borde —y
          pasarse— para poder cortarse. Con el relleno arriba, el logo quedaría
          acomodado dentro y no habría corte que valiera.

          LLEVA EL FONDO DE SUPERFICIE (`bg-surface`), no el de la página: es el
          tono que tenía el recuadro donde vivía el logo cuando iba solo, y
          gustó. De paso separa la entrada del resto del recorrido sin necesitar
          una línea.

          LAS CASCADAS SE COMEN TODO EL ESPACIO QUE SOBRE (`flex-1`) y el texto
          se queda con el suyo (`shrink-0`). Así, en una pantalla alta se ven más
          repeticiones y en una bajita menos, pero el título nunca se mueve ni se
          aprieta.
        */}
        <div
          data-panel
          /*
            `relative` NO ES ADORNO y le faltaba (7-ago-2026): es lo que hace
            que el letrero de aquí abajo se mida CONTRA ESTE PANEL. Sin él, un
            hijo `absolute` se mide contra la página entera, el `overflow` del
            riel ya no lo recorta y el ancho del DOCUMENTO se estira hasta donde
            cae este panel dentro del riel — que es exactamente el bug que rompió
            el sitio en Android. Todos los demás paneles ya lo traían.
          */
          /*
            EN TELÉFONO ESTE PANEL MIDE LA PANTALLA JUSTA (`w-full`), no 92vw
            como los demás (7-ago-2026).

            POR QUÉ ES DISTINTO AL RESTO: los 92vw dejan asomar un filo del
            panel siguiente, y ese filo ERA la pista de que la página seguía de
            lado. Ya no hace falta —para eso están ahora el letrero y el
            empujoncito— y sí estorbaba: la entrada es la portada, y una portada
            con una franja de otro color pegada a la orilla se ve como un
            descuadre, no como una invitación. Los demás paneles conservan su
            filo: ahí ya se entendió el gesto y el asomo ayuda a seguir.

            VA `w-full` Y NO `100vw` a propósito: el porcentaje se mide contra
            el riel, así que da EXACTAMENTE lo que se ve. `100vw` incluye el
            ancho de una barra de desplazamiento que aquí no existe, y habría
            dejado el panel unos píxeles más ancho que la pantalla — o sea el
            mismo filo que se está quitando, pero al revés.

            En computadora no cambia nada: los 720px son el ancho de columna
            diseñado, y ahí se ven varios paneles a la vez a propósito.
          */
          className="relative flex h-full w-full shrink-0 flex-col overflow-hidden border-l border-foreground/10 bg-surface first:border-l-0 md:w-[min(92vw,720px)]"
        >
          <CascadaDeLogos
            src={logoDeEntrada}
            alt={ABOUT_PORTADA.alt[lang]}
            haciaArriba
          />

          <div className="shrink-0 px-6 py-8 md:px-12">
            {/* SIN EL "INDEGO STUDIO" chiquito de encima (se quitó 6-ago-2026):
                el logo ya está a dos dedos, en la barra — y ahora, además, justo
                aquí arriba, repetido. */}
            <h1
              className="font-bold uppercase"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
              }}
            >
              {t.about.title}
            </h1>
            {/* `whitespace-pre-line`: la entrada son DOS renglones que van uno
                debajo del otro, y el salto se escribe en `config/about.ts`. */}
            <p className="mt-6 max-w-sm whitespace-pre-line text-base leading-[1.75] opacity-70 md:text-lg">
              {ABOUT_PORTADA.entrada[lang]}
            </p>
          </div>

          <CascadaDeLogos src={logoDeEntrada} alt="" />

          {/* EL LETRERO DE CÓMO RECORRER. Va dentro del panel de entrada —no
              fijo a la pantalla— para que se vaya con él, y encima se apaga
              antes de que el panel termine de salir. */}
          <ComoRecorrer riel={riel} />
        </div>

        {/*
          LOS BLOQUES, en el orden de `config/about.ts`, con LA BANDA DEL CIERRE
          INTERCALADA justo después del manifiesto.

          EL ANCHO depende del tipo: los de leer van angostos (una columna de
          texto ancha se lee mal) y los de ver, anchos.

          EL FONDO SE ALTERNA, uno y uno: uno lleva el color de la página y el
          siguiente el mismo de la entrada (`bg-surface`). Así el recorrido
          marca su propio ritmo y se nota dónde termina un panel y empieza el
          otro sin depender solo de la línea divisoria.

          La cuenta arranca de manera que el primero alternado sea el que va
          DESPUÉS de "El origen", y el manifiesto (que es el bloque 0) se queda
          con el fondo de la página — si no, quedaría pegado a la entrada, que
          ya es `bg-surface`, y se leerían como un solo panel gigante.
        */}
        {BLOQUES.map((block, i) => (
          <Fragment key={i}>
            {tieneContenido(block) &&
              (() => {
                const conFondo = i > 0 && i % 2 === 0;
                return (
                  <div
                    data-panel
                    className={`relative h-full shrink-0 overflow-y-auto border-l border-foreground/10 ${
                      block.tipo === "texto" || block.tipo === "frase"
                        ? "w-[min(92vw,680px)]"
                        : "w-[min(94vw,1000px)]"
                    } ${conFondo ? "bg-surface" : ""}`}
                  >
                    {/*
                      EL PAPEL DE ENVOLTURA va SOLO en los paneles crema, no en
                      todos: es lo que hace que el color se lea como un material
                      y no como una mancha de color. Los del fondo de la página
                      se quedan limpios, y esa alternancia —material / limpio— es
                      el ritmo del recorrido.

                      VA CON LA VARIANTE "panel", que NO es la del catálogo: aquí
                      es un cintillo apretado en la parte de arriba y allá un
                      fondo que cubre varias pantallas. Los números de cada una
                      viven en `components/patronDeFondo.tsx`.

                      EL PANEL DE ENTRADA NO LO LLEVA, aunque también es crema:
                      ahí ya está la cascada del logo, y las dos cosas juntas se
                      peleaban.
                    */}
                    {conFondo && <PatronDeFondo variante="panel" />}
                    {/* `relative` para que el bloque quede ENCIMA del patrón. */}
                    <div className="relative h-full">
                      <AboutBlock block={block} numero={numeros[i]} />
                    </div>
                  </div>
                );
              })()}
            {i === indiceCierre && cierre}
          </Fragment>
        ))}

        {/* Por si `config/about.ts` se quedara sin frase ancla: la banda no se
            pierde, sale al final. */}
        {indiceCierre === -1 && cierre}

        {/*
          LA CONVOCATORIA. Va DESPUÉS de la banda que manda al catálogo a
          propósito: el recorrido termina pidiendo algo (manda tu arte) en vez
          de vendiendo algo. Se apaga desde `config/convocatoria.ts`.

          Lleva `overflow-y-auto` porque el formulario es más alto que la
          pantalla en casi cualquier aparato: este panel SÍ se recorre hacia
          abajo por dentro (ver cómo lo respeta la rueda, en el `useEffect`).
        */}
        {/*
          VA EN DOS PANELES: primero el llamado (titular + invitación) y luego
          el formulario. Junto en uno solo cabía en computadora pero NO en
          teléfono, y ahí el panel se tenía que recorrer hacia abajo por dentro
          — o sea que en una página que se recorre de lado aparecía un scroll
          vertical justo al final. Partido, cada mitad cabe en su pantalla.
        */}
        <div
          data-panel
          className="relative h-full w-[min(92vw,640px)] shrink-0 overflow-y-auto border-l border-foreground/10"
        >
          <ConvocatoriaLlamado />
        </div>

        {/* SIN LÍNEA ENTRE ESTOS DOS. Las líneas separan bloques distintos, y
            esto es UNA cosa partida en dos pantallas: el llamado y el cupón
            para contestarlo. Con línea en medio se leían como dos secciones que
            no tienen que ver. */}
        <div
          data-panel
          className="relative h-full w-[min(92vw,620px)] shrink-0 overflow-y-auto"
        >
          <Convocatoria />
        </div>

        {/*
          AQUÍ ESTABA EL PIE (se quitó el 6-ago-2026). En el riel quedaba como
          un panel más, y un panel de puros enlaces de servicio no es forma de
          rematar el recorrido: lo último que se ve tiene que ser la
          convocatoria. Los enlaces del pie siguen en todas las demás páginas.
        */}
      </main>

      {/* LA RAYITA DE AVANCE. Va FUERA del riel a propósito: adentro viajaría
          con los paneles y se iría de la pantalla al primer deslizón. */}
      <PistaDelRiel riel={riel} />

      {/* El navbar lleva el botón del carrito, así que el cajón va montado. */}
      <CartDrawer />
    </div>
  );
}
