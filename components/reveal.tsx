"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Aparición al hacer scroll.
 *
 * Antes esto lo hacía framer-motion (`whileInView`), que anima con JavaScript
 * en CADA cuadro. Con varias tarjetas a la vez se notaba el tirón al scrollear
 * en iPhone. Aquí solo se avisa UNA vez que el elemento entró en pantalla, y
 * el movimiento lo hace una transición de CSS, que corre en la GPU.
 *
 * Si el navegador no soporta IntersectionObserver, el contenido se muestra de
 * una vez: nunca se queda invisible.
 */
export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si ya está en pantalla al cargar, se muestra de inmediato: no hay por qué
    // esperar al observador. Esto también evita que lo que se ve de entrada
    // dependa de que algo más funcione.
    const rect = el.getBoundingClientRect();
    const yaSeVe = rect.top < window.innerHeight && rect.bottom > 0;

    if (yaSeVe || typeof IntersectionObserver === "undefined") {
      // Se marca en el DOM y no con estado, para no redibujar de más al montar.
      el.dataset.visible = "true";
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-visible={visible} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
