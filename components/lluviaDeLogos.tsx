import Image from "next/image";
import { LOGO_PALABRA } from "@/config/brand";

/**
 * LLUVIA DE LOGOS — el fondo de los costados del catálogo.
 *
 * QUÉ RESUELVE: en computadora el catálogo vive en una columna centrada de
 * 1152 px, así que en una pantalla ancha quedan unos 300 px de nada a cada
 * lado. Esta capa los llena con la palabra INDEGO cayendo, muy tenue, como
 * textura del fondo y no como contenido.
 *
 * ES LA MISMA IDEA DE LA CASCADA DE LA ENTRADA DEL NOSOTROS, girada al oficio
 * de fondo: ahí la palabra es protagonista y se lee; aquí apenas se adivina y
 * lo que manda son las playeras.
 *
 * SOLO EN COMPUTADORA (`hidden md:block`). En teléfono no hay costados que
 * llenar —el catálogo ocupa todo el ancho— y la lluvia solo se metería debajo
 * de las fotos.
 *
 * NO SE VE EN LAS FRANJAS DE COLOR: el manifiesto que abre la página es una
 * banda opaca de lado a lado, así que la tapa. Es correcto — la lluvia es para
 * el aire de los costados, no para encimarse a nada.
 *
 * NO ES UN COMPONENTE DE CLIENTE, y eso es a propósito: no tiene estado ni
 * escucha nada. El cambio de tema se resuelve dibujando LAS DOS versiones del
 * logo y escondiendo una con CSS (`dark:hidden` / `hidden dark:block`), en vez
 * de preguntarle el tema a JavaScript. Así no hay parpadeo al hidratar ni hace
 * falta esperar a que monte. Las dos imágenes pesan unos pocos KB y son las
 * mismas que ya usa el Nosotros, así que el navegador suele traerlas de caché.
 */

/**
 * QUÉ TAN TENUE. Este es el único número que hay que mover si se ve de más o de
 * menos. A 0.10 se adivina la palabra sin llegar a competir con las playeras;
 * pasando de ~0.15 empieza a leerse como contenido y estorba.
 */
const OPACIDAD = 0.1;

/**
 * CUÁNTAS REPETICIONES POR COLUMNA. De sobra a propósito: la columna las corta
 * (`overflow-hidden`), y así la lluvia llena de arriba abajo sin importar qué
 * tan alta sea la pantalla.
 */
const REPETICIONES = 22;

/**
 * UNA COLUMNA. Las dos van pegadas a su borde y SE SALEN un poco por fuera, para
 * que la palabra se lea cortada por la orilla de la pantalla en vez de acomodada
 * dentro de un margen — que es lo que la vuelve fondo y no un elemento más.
 *
 * La de la izquierda alinea la palabra a la izquierda y se sale por la
 * izquierda; la de la derecha hace lo contrario. Así las dos se cortan HACIA
 * AFUERA y la composición queda simétrica.
 */
function Columna({ lado }: { lado: "izq" | "der" }) {
  const izquierda = lado === "izq";
  const alineacion = izquierda ? "object-left" : "object-right";

  return (
    <div
      className={`absolute inset-y-0 flex w-[240px] flex-col justify-center overflow-hidden ${
        izquierda ? "left-[-40px]" : "right-[-40px]"
      }`}
    >
      {Array.from({ length: REPETICIONES }).map((_, i) => (
        <div key={i} className="relative h-14 w-full shrink-0">
          <Image
            src={LOGO_PALABRA.claro}
            alt=""
            fill
            sizes="240px"
            className={`object-contain dark:hidden ${alineacion}`}
          />
          <Image
            src={LOGO_PALABRA.oscuro}
            alt=""
            fill
            sizes="240px"
            className={`hidden object-contain dark:block ${alineacion}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function LluviaDeLogos() {
  return (
    /*
      `fixed` y no `absolute`: la lluvia se queda quieta mientras el catálogo
      pasa por encima, como si fuera parte del fondo de la ventana. Si se
      moviera con el scroll se leería como contenido.

      `pointer-events-none` para que nunca robe un clic, y `aria-hidden` para
      que un lector de pantalla no diga "Indego Studio" cuarenta y cuatro veces.
    */
    <div
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      style={{ opacity: OPACIDAD }}
      aria-hidden
    >
      <Columna lado="izq" />
      <Columna lado="der" />
    </div>
  );
}
