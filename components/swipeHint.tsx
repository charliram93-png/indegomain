"use client";

/**
 * INDICADOR DE FOTOS (la rayita)
 * ------------------------------
 * Una línea fina y tenue con un relleno adentro: si se está viendo el frente,
 * el relleno se carga a la izquierda; si es la espalda, a la derecha. Sustituye
 * a los dos puntitos que había en el modal y en la página de producto, y ADEMÁS
 * aparece en el catálogo en teléfono, donde antes no había ninguna pista de que
 * la foto se pudiera deslizar.
 *
 * Por qué una línea y no puntos (ago-2026): los puntos son dos objetos sueltos
 * que hay que contar y ensuciaban el cuadro del catálogo. La línea es UN solo
 * trazo, se lee de reojo como "hay algo más de este lado" y de paso se puede
 * arrastrar, que es justo el gesto que queremos enseñar.
 *
 * EL RELLENO SIGUE AL DEDO. Mientras se arrastra, el padre manda `arrastre`
 * (qué fracción de foto lleva recorrida, de -1 a 1) y el relleno se mueve con
 * la mano en vez de esperar a que se suelte. Al soltar, `arrastre` vuelve a 0 y
 * el relleno cae en su lugar con una transición corta.
 *
 * Es DECORATIVO para quien usa lector de pantalla (`aria-hidden`): el cambio de
 * foto ya se anuncia desde el botón de la imagen, y aquí sería ruido repetido.
 */
export default function SwipeHint({
  total,
  index,
  arrastre = 0,
  className = "",
}: {
  /** Cuántas fotos hay. Con una sola no se dibuja nada. */
  total: number;
  /** Cuál se está viendo (empezando en 0). */
  index: number;
  /** Cuánto lleva arrastrado el dedo, en fracción de foto (-1 a 1). */
  arrastre?: number;
  className?: string;
}) {
  if (total < 2) return null;

  const ancho = 100 / total;

  /*
    Posición del relleno, en "fotos". Se limita al rango real para que al
    arrastrar en la primera o en la última no se salga de la línea (el clásico
    tirón contra el tope, pero sin dejar hueco).
  */
  const posicion = Math.min(Math.max(index + arrastre, 0), total - 1);
  const arrastrando = arrastre !== 0;

  return (
    <div
      aria-hidden
      /* `pointer-events-none`: es decoración. En el catálogo va ENCIMA de la
         foto, y sin esto se comería el toque que abre el modal. */
      className={`pointer-events-none mx-auto h-[2px] w-14 overflow-hidden rounded-full bg-foreground/15 ${className}`}
    >
      <div
        className="h-full rounded-full bg-foreground/70"
        style={{
          width: `${ancho}%`,
          transform: `translateX(${posicion * 100}%)`,
          /* Mientras el dedo manda, sin transición: cualquier retraso se
             siente como que la rayita va arrastrando los pies. */
          transition: arrastrando ? "none" : "transform 0.35s ease-out",
        }}
      />
    </div>
  );
}
