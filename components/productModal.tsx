"use client";

import Image from "next/image";
import { Product, isSoldOut } from "@/types/products";
import { X, Plus, Minus } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/format";
import { useScrollLock } from "@/lib/useScrollLock";
import { usePresencia } from "@/lib/usePresencia";
import { useI18n } from "@/lib/i18n/context";
import SwipeHint from "@/components/swipeHint";
import PatronDeFondo from "@/components/patronDeFondo";

type Props = {
  product: Product | null;
  index: number;
  onClose: () => void;
};

/** Lo que tarda el modal en entrar y en irse. Tiene que ser el MISMO número
 *  que la `duration-` de las clases de abajo (ver `lib/usePresencia.ts`). */
const MS = 250;

export default function ProductModal({
  product: productoAbierto,
  index,
  onClose,
}: Props) {
  const { addItem, openCart } = useCart();
  const { t } = useI18n();

  /*
    ENTRAR Y SALIR SIN framer-motion (6-ago-2026). Antes esto era
    `<AnimatePresence>`, que además de animar se encargaba de mantener el modal
    montado mientras se iba. Ahora eso lo hace `usePresencia` y la animación es
    una transición de CSS; framer costaba 39 KB comprimidos por página.

    EL PRODUCTO SE RETIENE: al cerrar, la prop se vuelve `null` de inmediato,
    y si el modal siguiera leyéndola se vaciaría a media salida (se vería
    encogerse una caja en blanco). Por eso se guarda el último que hubo y se
    dibuja ESE mientras dura la salida. Es el mismo ajuste de estado durante el
    dibujado que ya usa `slugAnterior` aquí abajo.
  */
  const { montado, dentro } = usePresencia(!!productoAbierto, MS);
  const [ultimo, setUltimo] = useState<Product | null>(productoAbierto);
  if (productoAbierto && productoAbierto !== ultimo) setUltimo(productoAbierto);
  const product = productoAbierto ?? ultimo;

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  /*
    Al cambiar de playera hay que EMPEZAR DE CERO: mostrando el frente, sin
    talla elegida y con cantidad 1. Si no, el modal se queda con lo de la
    playera anterior (se abría en la foto de la espalda, por ejemplo).
    Se ajusta durante el dibujado y no en un `useEffect` a propósito: así el
    modal nunca alcanza a pintarse un instante con los datos viejos.
  */
  const [slugAnterior, setSlugAnterior] = useState(product?.slug);
  if (product && product.slug !== slugAnterior) {
    setSlugAnterior(product.slug);
    setActiveImage(0);
    setSelectedSize(null);
    setQuantity(1);
  }

  const soldOut = product ? isSoldOut(product) : false;

  // Talla activa derivada (sin efectos).
  const firstAvailable = product?.sizes.find((s) => s.stock > 0)?.size ?? null;
  const selectedValid = product?.sizes.some(
    (s) => s.size === selectedSize && s.stock > 0,
  );
  const activeSize = selectedValid ? selectedSize : firstAvailable;
  const maxQty = product?.sizes.find((s) => s.size === activeSize)?.stock ?? 0;
  const qty = Math.min(quantity, Math.max(1, maxQty));

  const number = String(index + 1).padStart(2, "0");
  const mainImage = product
    ? (product.images[activeImage] ?? product.images[0])
    : "";

  const handleAddToCart = () => {
    if (!product || !activeSize || maxQty <= 0) return;
    addItem(product, activeSize, Math.min(qty, maxQty));
    onClose();
    setTimeout(() => openCart(), 150);
    setQuantity(1);
    setActiveImage(0);
  };

  // Bloquea el scroll del fondo mientras el modal está abierto (evita el
  // "zoom raro" por el cambio de altura de la barra del navegador en móvil).
  // Mismo mecanismo que el carrito, ver `lib/useScrollLock.ts`.
  // Va contra la PROP y no contra el producto retenido: el scroll se tiene que
  // soltar en cuanto le dan cerrar, no cuando termina de irse la animación.
  useScrollLock(!!productoAbierto);

  const hasGallery = !!product && product.images.length > 1;
  const total = product?.images.length ?? 1;

  const nextImage = () => setActiveImage((i) => (i + 1) % total);
  const prevImage = () => setActiveImage((i) => (i - 1 + total) % total);

  // Swipe en móvil para cambiar de foto.
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);
  const marco = useRef<HTMLButtonElement | null>(null);

  /* Cuánto lleva recorrido el dedo, en fracción de foto: solo para que la
     rayita se mueva CON la mano (ver `components/swipeHint.tsx`). */
  const [arrastre, setArrastre] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasGallery) return;
    const ancho = marco.current?.offsetWidth ?? 1;
    const dx = e.touches[0].clientX - touchStartX.current;
    // Arrastrar a la IZQUIERDA avanza a la siguiente foto, de ahí el signo.
    setArrastre(Math.min(Math.max(-dx / ancho, -1), 1));
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    setArrastre(0);
    if (touchStartX.current === null || !hasGallery) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      if (dx < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  if (!montado || !product) return null;

  return (
    <div
      /* Sin `backdrop-blur`: desenfocar el fondo se recalcula en cada
         cuadro mientras el panel entra. Se compensa subiendo la opacidad. */
      className={`fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 transition-opacity duration-[250ms] ease-out md:items-center md:p-10 ${
        dentro ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        /*
          Fondo SÓLIDO. Antes era `bg-surface/50 backdrop-blur-2xl`, y ese
          desenfoque era, con diferencia, lo más caro del sitio: un radio
          enorme recalculándose en cada cuadro mientras el panel entra
          animado. Con color plano la animación va suave hasta en teléfono.

          La entrada: aparece creciendo un pelín y subiendo 12 px. Solo se
          animan `opacity` y `transform`, que son las dos cosas que el
          navegador mueve en la GPU sin volver a calcular la página.
        */
        className={`relative flex h-svh w-full flex-col bg-surface p-4 transition-[opacity,transform] duration-[250ms] ease-out md:grid md:h-auto md:max-h-[90vh] md:max-w-6xl md:grid-cols-2 md:items-center md:gap-10 md:overflow-y-auto md:rounded-sm md:border md:border-foreground/15 md:p-10 md:shadow-2xl ${
          dentro
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/*
          EL PAPEL DE ENVOLTURA, el mismo del catálogo (7-ago-2026). En TODOS
          los aparatos y en los dos temas: el modal es la única pantalla del
          sitio donde la playera se ve sola, y sin nada detrás el fondo se leía
          como un cuadro de diálogo del navegador en vez de una caja de la
          marca.

          VA CON LA VARIANTE "modal", que NO es la del catálogo. Allá son 60
          renglones repartidos en una página de varias pantallas; metidos en una
          caja de una pantalla saldrían todos encimados. El propio
          `patronDeFondo.tsx` lo advierte y ahí están los números de cada una.

          NO ROMPE LA REJILLA de dos columnas aunque sea un hijo más: va
          `absolute`, o sea fuera del flujo, así que no ocupa celda. Y todo lo
          que va encima lleva su propio `relative` o `z-`.
        */}
        <PatronDeFondo variante="modal" />

        {/* Cerrar */}
        <button
          onClick={onClose}
          aria-label={t.product.close}
          className="absolute right-3 top-3 z-30 p-2 text-foreground transition-opacity hover:opacity-50"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {/* IMAGEN + GALERÍA (puntos). En móvil ocupa el espacio disponible.
            `relative` para quedar ENCIMA del papel de envoltura: un elemento
            posicionado se pinta después que el contenido de los que no lo
            están, así que sin esto el patrón se dibujaría sobre la playera. */}
        <div className="relative flex min-h-0 flex-1 flex-col md:block md:flex-none">
          <button
            ref={marco}
            type="button"
            onClick={() => {
              if (swiped.current) {
                swiped.current = false;
                return;
              }
              if (hasGallery) nextImage();
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            aria-label={hasGallery ? t.product.changeView : product.name}
            /* `halo-modal` (NO `halo-prenda`, que es la del catálogo): luz
                   suave detrás de la playera SOLO en tema oscuro, si no la café
                   desaparece contra el fondo. En claro el modal va limpio. Ver
                   globals.css. */
            /*
              EL TOPE DE ALTURA ES LO QUE QUITA EL SCROLL EN LAPTOP
              (7-ago-2026). Sin él, en computadora la caja es CUADRADA y su alto
              lo manda el ancho de la columna: con el modal a 1152 px, cada
              columna mide 516, así que la imagen medía 516 de alto y el
              contenido entero 610 con los rellenos. El modal está topado a
              `90vh`, o sea que en cuanto la ventana bajaba de ~678 px de alto
              —una laptop de 1366×768 deja unos 660— el contenido ya no cabía y
              aparecía una barra de desplazamiento dentro del modal.

              Con el tope, en pantallas altas no cambia NADA (el cuadrado sigue
              mandando porque es más chico que el tope) y en las bajitas la caja
              se achata lo justo para caber. La playera no se deforma: es
              `object-contain`, así que solo se le queda un poco de aire a los
              lados.

              EL `overflow-y-auto` DEL MODAL SE QUEDA, de red: si algún día el
              contenido crece por otro lado, es mejor que se pueda recorrer a
              que se corte.
            */
            className={`halo-modal relative flex min-h-0 w-full flex-1 items-center justify-center md:h-auto md:aspect-square md:max-h-[calc(90vh-8rem)] md:flex-none ${
              hasGallery ? "cursor-pointer" : "cursor-default"
            }`}
          >
            {/* En el modal el número va ARRIBA A LA IZQUIERDA (decisión de
                    diseño): aquí la prenda se ve completa y grande, y el número
                    funciona mejor como marca de agua en la esquina. En el
                    catálogo sí va abajo a la derecha, metido tras la playera. */}
            <span className="pointer-events-none absolute left-2 top-0 text-7xl font-bold leading-none opacity-10 md:text-9xl">
              {number}
            </span>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={`select-none object-contain p-2 pointer-events-none drop-shadow-2xl md:p-4 ${
                soldOut ? "opacity-50 grayscale" : ""
              }`}
            />
          </button>

          {/* La rayita en lugar de los puntitos (ago-2026). Misma señal en
                  el catálogo, aquí y en la página de producto. */}
          {hasGallery && (
            <SwipeHint
              total={total}
              index={activeImage}
              arrastre={arrastre}
              className="mt-3 shrink-0"
            />
          )}
        </div>

        {/* INFO Y CONTROLES */}
        {/* PRUEBA DE DISEÑO (ago-2026): ahora la columna va CENTRADA
                también en escritorio, no solo en móvil. Para volver a la
                versión alineada a la izquierda: cambia `md:items-center` por
                `md:items-stretch` aquí, quita `md:text-center` del bloque del
                nombre y regresa `md:items-start` a tallas y cantidad. */}
        {/* `relative`, por lo mismo que la columna de la imagen: para quedar
            encima del papel de envoltura. */}
        <div className="relative flex shrink-0 flex-col items-center space-y-3 pt-3 text-foreground md:items-center md:justify-center md:space-y-6 md:pt-0">
          <div className="w-full">
            {/* Nombre + precio: en la MISMA línea en móvil, apilados en desktop */}
            <div className="flex items-baseline justify-between gap-3 md:block md:text-center">
              <h1 className="text-3xl font-bold uppercase leading-none tracking-tighter md:text-6xl">
                {product.name}
              </h1>
              <p className="shrink-0 text-lg font-medium opacity-70 md:mt-2">
                {formatMXN(product.price)}
              </p>
            </div>
            {/* La descripción NO va en el modal (en ninguna pantalla): ya
                    se lee en el catálogo, y aquí el espacio es para la foto y
                    los controles de compra. Sigue viviendo en
                    `config/products.ts`. */}
          </div>

          {/* TALLAS */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
              {t.product.selectSize}
            </span>
            {/* Solo texto: sin recuadro ni fondo. El `py-2` no se ve, pero
                    deja el área de toque decente en el teléfono.

                    DECIDIDO con el equipo (1-ago-2026): la talla elegida se
                    marca con el CONTRASTE DEL TEMA —color de texto al 100% y
                    las demás al 35%—, no con un color fijo. Se probaron y se
                    descartaron el rojo de marca y una rayita debajo. */}
            <div className="flex gap-6">
              {product.sizes.map(({ size, stock }) => {
                const out = stock <= 0;
                const active = activeSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => !out && setSelectedSize(size)}
                    disabled={out}
                    aria-pressed={active && !out}
                    className={`py-2 text-sm font-bold uppercase text-foreground transition-opacity ${
                      out
                        ? "cursor-not-allowed opacity-25 line-through"
                        : active
                          ? "cursor-pointer opacity-100"
                          : "cursor-pointer opacity-35 hover:opacity-70"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CANTIDAD */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
              {t.product.quantity}
            </span>
            {/* Igual que las tallas: sin recuadro, solo los signos. */}
            <div className="flex w-fit items-center gap-5">
              <button
                onClick={() => setQuantity(Math.max(1, qty - 1))}
                disabled={soldOut}
                aria-label={t.cart.less}
                className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-6 text-center text-sm font-bold">
                {qty}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
                disabled={soldOut || qty >= maxQty}
                aria-label={t.cart.more}
                className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <Plus size={16} />
              </button>
            </div>
            {!soldOut && maxQty > 0 && maxQty <= 5 && (
              <span className="block text-[10px] uppercase tracking-[0.02em] text-foreground/60">
                {t.product.lastPieces.replace("{n}", String(maxQty))}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={soldOut || !activeSize}
            /* Sin fondo, sin borde, sin sombra: solo el texto. */
            className="w-fit cursor-pointer py-2 text-left text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {soldOut ? t.product.soldOut : t.product.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
