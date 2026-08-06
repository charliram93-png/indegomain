"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useEffect, useRef, type ReactNode } from "react";
import Navbar from "@/components/navbar";
import CartDrawer from "@/components/cartDrawer";
import AboutBlock from "@/components/aboutBlock";
import Convocatoria from "@/components/convocatoria";
import DropTag from "@/components/dropTag";
import { Line } from "@/components/manifesto";
import { ABOUT_PORTADA, ABOUT_CIERRE, BLOQUES } from "@/config/about";
import { PRODUCTS } from "@/config/products";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

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
  const tira = [...PRODUCTS, ...PRODUCTS];

  return (
    <div
      className={`carrusel flex h-1/3 w-max items-center ${
        alReves ? "carrusel-al-reves" : ""
      }`}
    >
      {tira.map((producto, i) => (
        /*
          LA SEPARACIÓN VA COMO `pr-*` EN CADA PIEZA, NO COMO `gap` EN LA TIRA,
          y esto NO es cuestión de gusto: con `gap`, seis piezas dejan CINCO
          huecos, así que la mitad exacta de la tira cae medio hueco antes de
          donde empieza la copia — y el bucle daría un brinquito cada vuelta.
          Con el espacio metido en cada pieza, las seis miden exactamente lo
          mismo, la mitad cae justo en la copia y el salto es invisible.
        */
        <div key={i} className="h-4/5 shrink-0 pr-10 md:pr-20">
          <div className="relative h-full w-28 md:w-48">
            <Image
              src={producto.images[0]}
              alt=""
              fill
              sizes="(max-width: 768px) 30vw, 200px"
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

/** Next reemplaza esto por `true`/`false` al compilar; no queda en el bundle. */
const EN_DESARROLLO = process.env.NODE_ENV === "development";

/**
 * ¿ESTE BLOQUE TIENE ALGO QUE ENSEÑAR?
 *
 * Los bloques de foto y video sin archivo (`src: ""`) no se publican. Cuando la
 * página iba hacia abajo eso no se notaba —simplemente no ocupaban alto—, pero
 * en el riel cada bloque reserva un panel ANCHO, así que un bloque vacío dejaba
 * mil píxeles de nada en medio del recorrido. Aquí se filtran.
 *
 * EN `npm run dev` SÍ SE DIBUJAN, con su recuadro punteado: es la misma
 * convención de siempre (ver `components/aboutBlock.tsx`), para poder ver la
 * forma de la página mientras se llena sin que se escape un hueco a producción.
 */
function tieneContenido(block: (typeof BLOQUES)[number]): boolean {
  if (EN_DESARROLLO) return true;
  if (block.tipo === "foto" || block.tipo === "video") return !!block.src;
  if (block.tipo === "duo") return !!(block.a.src || block.b.src);
  return true;
}

/**
 * UN PANEL DEL RIEL: una "pantalla" del recorrido horizontal.
 *
 * `shrink-0` es lo que impide que los paneles se apachurren para caber —sin
 * eso, flex los encogería y no habría nada que recorrer—, y `h-full` los hace
 * del alto de la ventana. La línea de la izquierda hace de separación, igual
 * que las líneas horizontales hacían de separación cuando la página iba hacia
 * abajo.
 */
function Panel({ ancho, children }: { ancho: string; children: ReactNode }) {
  return (
    <div
      data-panel
      className={`flex h-full shrink-0 flex-col justify-center border-l border-foreground/10 px-6 first:border-l-0 md:px-12 ${ancho}`}
    >
      {children}
    </div>
  );
}

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
  const riel = useRef<HTMLElement>(null);

  /*
    UNA SOLA BARRA DE DESPLAZAMIENTO, la del riel.

    Sin esto salían DOS: la horizontal del riel y una vertical del documento.
    La vertical no era contenido de más, era aritmética: la página mide `h-dvh`
    (el alto completo de la ventana) pero la barra horizontal se come ~15 px de
    ese alto, así que la página quedaba 15 px más alta que el hueco disponible y
    el navegador ofrecía recorrerla. Quince píxeles de nada, con su barra al
    lado.

    Se apaga el desplazamiento del DOCUMENTO —no el del riel— y solo mientras se
    está en esta página: al salir se deja como estaba. Se toca `documentElement`
    y no `body` a propósito, para no pelearse con `lib/useScrollLock.ts`, que es
    quien bloquea el `body` cuando se abre el carrito.
  */
  useEffect(() => {
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => {
      raiz.style.overflow = previo;
    };
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

      {/* LA ETIQUETA DEL DROP, pegada a la pantalla (derecha, bien abajo del
          navbar). Va aquí y no dentro del navbar: el `backdrop-blur` de la
          barra impide fijar nada a la ventana desde adentro. Se dibuja en esta
          página y no en el layout para que no se cuele en el countdown, el
          pago ni el panel. Ver `components/dropTag.tsx`. */}
      <DropTag />

      {/*
        EL RIEL. Aquí es donde la página se voltea: en vez de apilarse hacia
        abajo, los bloques se ponen en fila y se recorren hacia la derecha.
        `pt-20` es el hueco de la barra fija, que antes era un div vacío.
      */}
      <main
        ref={riel}
        className="sin-barra flex flex-1 overflow-x-auto overflow-y-hidden pt-20"
        style={{ fontFamily: HELVETICA }}
      >
        {/*
          PORTADA. El catálogo arranca de golpe con el manifiesto pegado al
          navbar; aquí se hace lo contrario: mucho aire, el título colgado de la
          izquierda y la entrada descolgada abajo.
        */}
        <Panel ancho="w-[min(92vw,720px)]">
          {/* SIN EL "INDEGO STUDIO" chiquito de encima (se quitó 6-ago-2026):
              el logo ya está a dos dedos, en la barra. Decirlo otra vez ahí
              arriba solo le robaba el arranque al título. */}
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
          <p className="mt-8 max-w-sm whitespace-pre-line text-base leading-[1.75] opacity-70 md:text-lg">
            {ABOUT_PORTADA.entrada[lang]}
          </p>
        </Panel>

        {/*
          Foto de portada. En vertical iba de orilla a orilla; aquí manda la
          ALTURA (llena el panel) y el ancho lo pone la foto.
        */}
        {ABOUT_PORTADA.imagen && (
          <div className="relative h-full w-[min(92vw,900px)] shrink-0 overflow-hidden border-l border-foreground/10 bg-surface">
            <Image
              src={ABOUT_PORTADA.imagen}
              alt={ABOUT_PORTADA.alt[lang]}
              fill
              priority
              sizes="900px"
              className="object-cover"
            />
          </div>
        )}

        {/*
          LOS BLOQUES, en el orden de `config/about.ts`, con LA BANDA DEL CIERRE
          INTERCALADA justo después de la frase ancla.

          El ANCHO depende del tipo: los de leer van angostos (una columna de
          texto ancha se lee mal) y los de ver, anchos.
        */}
        {BLOQUES.map((block, i) => (
          <Fragment key={i}>
            {tieneContenido(block) && (
              <div
                data-panel
                className={`h-full shrink-0 overflow-y-auto border-l border-foreground/10 ${
                  block.tipo === "texto" || block.tipo === "frase"
                    ? "w-[min(92vw,680px)]"
                    : "w-[min(94vw,1000px)]"
                }`}
                /* El manifiesto y las fotos van anchos; el texto de leer, no. */
              >
                <AboutBlock block={block} numero={numeros[i]} />
              </div>
            )}
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
        <div
          data-panel
          className="h-full w-[min(94vw,1100px)] shrink-0 overflow-y-auto border-l border-foreground/10 md:overflow-hidden"
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

      {/* El navbar lleva el botón del carrito, así que el cajón va montado. */}
      <CartDrawer />
    </div>
  );
}
