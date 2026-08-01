# Manual — Indego Studio

Manual de referencia del proyecto. Sirve para entender cómo está armado y **cómo
hacer los cambios más comunes** sin romper nada.

> Índice rápido
>
> 1. [Qué es este proyecto](#1-qué-es-este-proyecto)
> 2. [Tecnologías](#2-tecnologías)
> 3. [Cómo correrlo en local](#3-cómo-correrlo-en-local)
> 4. [Variables de entorno](#4-variables-de-entorno)
> 5. [Estructura de carpetas](#5-estructura-de-carpetas)
> 6. [Explicación de cada archivo](#6-explicación-de-cada-archivo)
> 7. [Cómo funciona el drop (candado + countdown)](#7-cómo-funciona-el-drop)
> 8. [Cómo funciona la compra (carrito → Stripe)](#8-cómo-funciona-la-compra)
> 9. [Cómo hacer cambios comunes](#9-cómo-hacer-cambios-comunes)  ← lo que más vas a usar
> 10. [Despliegue en Vercel](#10-despliegue-en-vercel)
> 11. [Pendientes / próximos pasos](#11-pendientes--próximos-pasos)

---

## 1. Qué es este proyecto

Tienda web para el lanzamiento ("drop") de una marca de ropa. El sitio tiene dos
estados:

- **Antes del drop:** la home muestra una **cuenta regresiva**. La tienda está
  bloqueada al público.
- **Cuando el contador llega a cero:** la tienda se abre sola y la gente puede
  comprar en línea (pago con Stripe, envíos solo dentro de México).

Estética minimalista inspirada en drops tipo Yeezy: paleta olivo/crema,
tipografía condensada (Saira Semi Condensed, **temporal** — a definir con el
equipo), mucho espacio en blanco.

---

## 2. Tecnologías

| Tecnología | Para qué se usa |
|---|---|
| **Next.js 16** (App Router, Turbopack) | Framework principal. Páginas, rutas y API en un solo proyecto. |
| **React 19** | Librería de interfaz (los componentes). |
| **TypeScript** | JavaScript con tipos: menos errores, mejor autocompletado. |
| **Tailwind CSS v4** | Estilos por clases. La paleta de marca vive en `app/globals.css`. |
| **next-themes** | Modo claro/oscuro (sigue el sistema, con toggle manual). |
| **i18n propio** | Idioma EN/ES (default inglés). Diccionario en `lib/i18n/`. |
| **Stripe** | Cobros en línea (tarjeta, OXXO). Pantalla de pago segura. |
| **Cloudinary** | Hospedaje y optimización de imágenes (logos, productos). |
| **Framer Motion** | Animaciones (modal de producto, drawer del carrito). |
| **Zustand** | Estado del carrito (con guardado en el navegador). |
| **lucide-react** | Íconos (bolsa, +/-, cerrar, basura). |
| **@vercel/analytics** | Métricas de visitas. |
| **Vercel** | Donde se publica el sitio (hosting). |

---

## 3. Cómo correrlo en local

```bash
npm install     # solo la primera vez
npm run dev     # levanta el sitio en http://localhost:3000
```

Otros comandos:

```bash
npm run build   # compila para producción (verifica que todo esté bien)
npm run start   # corre la versión de producción ya compilada
npm run lint    # revisa el código
```

Para entrar a la tienda mientras el drop sigue cerrado, usa la clave de acceso:

```
http://localhost:3000/product?access=indego-preview
```

---

## 4. Variables de entorno

Viven en `.env.local` (no se sube a git). En Vercel se configuran en el panel del
proyecto → Settings → Environment Variables.

| Variable | Qué es |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave pública de Stripe (frontend). |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe (backend). **Nunca compartir.** |
| `NEXT_PUBLIC_URL` | URL del sitio (ej. `https://indegostudio.com`). Se usa para redirigir tras el pago. |
| `DROP_ACCESS_KEY` | (Opcional) Clave para entrar a la tienda antes del drop. Default: `indego-preview`. |
| `STRIPE_WEBHOOK_SECRET` | (Opcional) Secreto del webhook para confirmar pagos. |
| `ADMIN_PASSWORD` | Contraseña del panel de administración (ruta secreta `/idg-hq-9f2a`). **Necesaria** para entrar. |

---

## 5. Estructura de carpetas

```
indego/
├── app/                     # páginas y rutas (Next.js App Router)
│   ├── layout.tsx           # plantilla raíz (fuente, metadatos, analytics)
│   ├── page.tsx             # HOME = countdown del drop
│   ├── globals.css          # paleta de marca + estilos base
│   ├── icon.png             # favicon
│   ├── product/page.tsx     # LA TIENDA (catálogo)
│   ├── success/page.tsx     # página de "gracias por tu compra"
│   ├── terms/page.tsx       # términos y condiciones
│   ├── idg-hq-9f2a/         # panel admin (ruta SECRETA, no adivinable)
│   │   ├── page.tsx         # dashboard (menú lateral con accesos)
│   │   └── login/page.tsx   # login del panel
│   └── api/
│       ├── checkout/route.ts   # crea la sesión de pago de Stripe
│       ├── webhook/route.ts    # recibe confirmaciones de Stripe
│       └── panel/              # login/logout del panel
├── components/              # piezas de interfaz reutilizables
│   ├── countdown.tsx        # la cuenta regresiva
│   ├── dropIntro.tsx        # el texto animado que va sobre el video del countdown
│   ├── manifesto.tsx        # el corte tipográfico que ABRE el catálogo
│   ├── navbar.tsx           # barra superior con logo, idioma, tema y bolsa
│   ├── footer.tsx           # pie de página
│   ├── productCard.tsx      # fila editorial del catálogo (imagen + nombre grande)
│   ├── reveal.tsx           # aparición al scrollear (barata, con CSS)
│   ├── productModal.tsx     # ventana de detalle (fotos, tallas, compra)
│   ├── productTeaser.tsx    # cuadro "incógnito" 04–05 (adelanto Drop 1.5)
│   ├── cartDrawer.tsx       # carrito lateral
│   ├── themeProvider.tsx    # provee el modo claro/oscuro a la app
│   ├── themeToggle.tsx      # botón sol/luna para cambiar de tema
│   ├── themeColorSync.tsx   # sincroniza el color de la barra del navegador (iOS)
│   └── langToggle.tsx       # botón EN/ES para cambiar de idioma
├── config/                  # configuración editable del negocio
│   ├── drop.ts              # fecha, nombre y clave del drop
│   ├── dropIntro.ts         # guion del texto del countdown (tiempos y tamaños)
│   ├── brand.ts             # contacto, redes y el manifiesto
│   ├── products.ts          # catálogo e inventario (stock por talla)
│   └── panel.ts             # links/accesos del panel de administración
├── lib/
│   ├── format.ts            # formatea precios ($1,200 MXN)
│   ├── adminAuth.ts         # helper de sesión del panel (hash de contraseña)
│   └── i18n/                # idioma EN/ES
│       ├── dictionaries.ts  # TODOS los textos (inglés y español)
│       └── context.tsx      # provee el idioma a la app
├── store/
│   └── cart.ts              # estado del carrito (Zustand)
├── types/
│   └── products.ts          # definiciones de tipos (Producto, Carrito…)
├── proxy.ts                 # candado: protege /product hasta el drop
└── next.config.ts           # config de Next (dominios de imágenes permitidos)
```

---

## 6. Explicación de cada archivo

### Configuración del negocio (lo que más se edita)

- **`config/drop.ts`** — El "panel de control" del lanzamiento:
  - `DROP_DATE`: fecha y hora del drop.
  - `DROP_NAME`: nombre del drop ("DROP 1"). Hoy no se pinta en pantalla: el
    catálogo ya no lleva título.
  - `DROP_ACCESS_KEY`: clave para probar la tienda antes de tiempo.
  - `DROP_VIDEO` / `DROP_POSTER`: video de fondo del countdown y su imagen de
    respaldo (ambos en Cloudinary).
  - `isDropOpen()`: función que dice si el drop ya abrió.
- **`config/products.ts`** — El catálogo. Cada producto tiene `slug`, `name`,
  `images` (la PRIMERA es el frente, la segunda la espalda), `price` (en pesos),
  `description` bilingüe y `sizes` (tallas con su `stock`). Las fotos pasan por
  el helper `foto()`, que les aplica transformaciones de Cloudinary al vuelo —
  ver "Las fotos de las playeras" en la sección 9.
- **`config/brand.ts`** — Lo que el sitio dice de sí mismo: `CONTACT_EMAIL`,
  `INSTAGRAM_URL`, `LINKTREE_URL` y el `MANIFESTO`. El correo y el Instagram
  **solo aparecen en el footer si están llenos** (vacío = no se muestra el
  enlace), para no publicar un dato inventado.
- **`config/dropIntro.ts`** — El **guion del texto del countdown**: qué palabra
  entra, en qué segundo del video, de qué tamaño y en qué lugar. Los valores
  salieron de medir cuadro por cuadro el video original que traía las letras
  quemadas, por eso la secuencia se ve igual pero ahora se adapta a cualquier
  pantalla. Aquí también están `INTRO_COLOR` (color del texto) e
  `INTRO_ENABLED` (para apagarlo).

### Páginas (`app/`)

- **`layout.tsx`** — Envuelve todo el sitio. Carga la fuente (Saira Semi
  Condensed, **temporal** — cambiable en 1 línea por otra de `next/font/google`),
  define los metadatos (título, previsualización al compartir), el proveedor de
  tema y Analytics. También carga la **Helvetica del countdown**: ver abajo.
- **`page.tsx`** (home) — **Video de fondo en bucle** (Cloudinary) con el texto
  del drop encima (`dropIntro.tsx`) y el contador (rojo, Helvetica, un poco
  abajo). Cuando llega a cero (o si ya pasó la fecha), revela el botón
  **ENTRAR**; si tienes la cookie de preview, muestra "Entrar (preview)". En
  móvil vertical el video llena la pantalla con `object-cover`, es decir hace
  zoom a los caballos, y el texto se reacomoda solo al formato vertical.
- **`product/page.tsx`** — La tienda. Abre con el **manifiesto** (de lado a lado,
  justo debajo del navbar), y luego las tarjetas del catálogo. Ya no lleva título
  ("The Collection" / "Drop 1"): se quitó porque el manifiesto ya hace de
  entrada. Aquí se montan el Navbar, el CartDrawer y el Footer.
- **`success/page.tsx`** — A donde Stripe manda al cliente tras pagar. Vacía el
  carrito.
- **`terms/page.tsx`** — Términos y condiciones (texto editable con placeholders).

### API (`app/api/`)

- **`checkout/route.ts`** — Recibe los items del carrito y crea una **sesión de
  pago** en Stripe con todos los productos. Pide dirección de envío (solo México)
  y teléfono. Devuelve la URL de pago.
- **`webhook/route.ts`** — Stripe le avisa aquí cuando un pago se completa.
  Maneja el caso especial de OXXO (pago diferido). Hoy registra la orden en los
  logs; a futuro guardará en base de datos.

### Componentes (`components/`)

- **`countdown.tsx`** — La cuenta regresiva. Lee `DROP_DATE` y avisa cuando llega
  a cero.
- **`dropIntro.tsx`** — El texto del drop (INDEGOSTUDIO, "YOU ARE NOT A CONTENT
  CREATOR / YOU ARE AN ARTIST", COMING SOON) **dibujado en el navegador**, no
  quemado en el video. Va pegado al `currentTime` del video, así que reinicia
  solo con cada vuelta del bucle, y todo se mide en `cqw` (% del ancho del
  video) para que escale nítido en cualquier pantalla. El guion (textos,
  segundos, tamaños, posiciones) vive en `config/dropIntro.ts`.
- **`reveal.tsx`** — La aparición al hacer scroll del catálogo. Solo avisa UNA
  vez que el elemento entró en pantalla (`IntersectionObserver`) y el movimiento
  lo hace una transición de CSS. Antes lo animaba framer-motion cuadro a cuadro
  con JavaScript y se sentía pesado al scrollear en el teléfono.
- **`productModal.tsx`** — La ventana de detalle. Al cambiar de playera reinicia
  foto, talla y cantidad; si no, se quedaba abriendo en la foto de la espalda de
  la playera anterior.
- **`manifesto.tsx`** — El corte tipográfico que ABRE el catálogo: "YOU ARE
  NOT A CONTENT CREATOR / YOU ARE AN ARTIST", con los colores invertidos para
  que rompa el ritmo de la página. Usa la misma Helvetica del countdown, así se
  lee como continuación del video. El texto se edita en `config/brand.ts`, donde
  lo que va entre `*asteriscos*` sale en cursiva. Va en inglés fijo, no se
  traduce: es identidad de marca, no interfaz.
- **`navbar.tsx`** — Barra superior. El ícono de bolsa abre el carrito y muestra
  cuántos productos hay.
- **`footer.tsx`** — Pie con enlaces a Términos y Linktree.
- **`productCard.tsx`** — Fila editorial del catálogo: cuadro de imagen (con
  número 01/02/03) y **nombre en grande** + descripción, alternando
  izquierda/derecha por producto. En **móvil**: título arriba de la imagen y
  descripción debajo. Al hacer clic abre el modal. Marca SOLD OUT.
- **`productTeaser.tsx`** — Cuadro "incógnito" (04–05) que adelanta el Drop 1.5,
  con candado y "Drop 1.5 · Próximamente" dentro. Se muestra al final del catálogo.
- **`productModal.tsx`** — Ventana de detalle en un **panel tipo glass**. En
  **escritorio** es tarjeta centrada (imagen + info al lado, precio bajo el
  nombre). En **móvil** ocupa la pantalla completa (`100svh`, sin scroll: imagen
  arriba flexible, controles abajo, precio junto al nombre) y se puede **deslizar
  (swipe)** para cambiar de foto; bloquea el scroll del fondo al abrir. Incluye
  puntos, descripción bilingüe, talla, cantidad y agregar al carrito.
- **`cartDrawer.tsx`** — Carrito lateral: lista de productos, cantidades,
  subtotal y botón para pagar. Va **al mismo estilo minimalista del modal**:
  sin recuadro en la cantidad y con el botón de pagar en puro texto. Mientras
  está abierto **bloquea el scroll de la página** (ver `lib/useScrollLock.ts`).
- **`themeProvider.tsx`** — Envuelve la app para dar modo claro/oscuro. El sitio
  **siempre abre en claro**; el botón sol/luna lo cambia y esa elección se
  recuerda en el navegador de cada quien.
- **`themeToggle.tsx`** — Botón sol/luna que alterna claro/oscuro.
- **`themeColorSync.tsx`** — Sincroniza el `<meta theme-color>` con el tema para
  que la barra del navegador (iOS) cambie de color al cambiar de tema.

### Modo claro / oscuro (temas)

- El sitio **siempre abre en tema CLARO** (ago-2026). Antes seguía la
  preferencia del dispositivo, así que a quien tuviera el modo oscuro prendido
  el sitio se le abría en oscuro sin pedirlo, y la primera impresión de la
  marca cambiaba según el aparato. El botón sol/luna (en el navbar y en la
  home) lo cambia a mano y la elección se recuerda.
- **Las prendas en tema oscuro:** las tres playeras son oscuras y contra el
  fondo olivo se perdían (medido: la café marca 57 de luminancia y su fondo 60,
  o sea casi lo mismo). Por eso hay un **halo**: una luz suave detrás de la
  prenda que solo existe en tema oscuro (clase `.halo-prenda` en `globals.css`,
  puesta en `productCard.tsx` y `productModal.tsx`). Es un fondo, no un filtro:
  no cuesta rendimiento. Sigue sirviendo cuando lleguen los recortes buenos y
  se quite la placa del cuadro.
- Los colores viven en `app/globals.css` con **tokens semánticos** que cambian
  según el tema: `background` (fondo), `foreground` (texto), `surface`
  (navbar/tarjetas). En claro son crema/olivo; en oscuro se invierten.
- Los componentes usan clases como `bg-background` / `text-foreground`, por eso
  se adaptan solos a ambos temas.
- **Excepción:** la **home se mantiene siempre oscura** porque los logos son PNG
  blancos (se verían invisibles sobre fondo claro). Si algún día hay logos
  oscuros, se puede volver temática.

### Idioma (EN / ES)

- Idioma por defecto: **inglés**. Botón EN/ES (junto al de tema) para cambiarlo;
  la preferencia se recuerda en el navegador.
- **Todos los textos** viven en `lib/i18n/dictionaries.ts`, en dos bloques
  espejo: `en` y `es`. Los componentes leen los textos con `useI18n()`.
- Los términos y condiciones también están ahí (`terms`), en ambos idiomas.

### Panel de administración (ruta secreta)

- Vive en una **ruta secreta**: `/idg-hq-9f2a` (así `/panel` o `/admin` no
  revelan nada — dan 404). Es un **menú lateral** con tus accesos directos
  (Stripe, Vercel, GitHub, Cloudinary, envíos, utilidades…). Pensado para crecer:
  mostrará ventas y stock reales cuando se conecte Supabase.
- Protegido con **login por contraseña** (`ADMIN_PASSWORD`): sin sesión te manda
  a `/idg-hq-9f2a/login`. La cookie guarda un **hash**, no la contraseña en claro
  (`lib/adminAuth.ts`).
- Los accesos se editan en **`config/panel.ts`**.
- La **contraseña es la protección real**; la ruta secreta es una capa extra
  contra curiosos. (Si el repo es público, la ruta se ve en el código; la
  contraseña sigue protegiendo el acceso.)

### Lógica de apoyo

- **`store/cart.ts`** — El "cerebro" del carrito (Zustand). Guarda los productos,
  suma totales y persiste en el navegador (sobrevive al refresh).
- **`lib/format.ts`** — Convierte números a formato de precio: `1200` → `"$1,200 MXN"`.
- **`types/products.ts`** — Define las "formas" de los datos (qué campos tiene un
  producto, un item del carrito, etc.).
- **`lib/useScrollLock.ts`** — Congela la página de atrás mientras el carrito o
  el modal están abiertos. Usa `position: fixed` y no `overflow: hidden` porque
  **Safari en iPhone ignora `overflow: hidden`** en el body: sin esto, la página
  seguía moviéndose al arrastrar dentro del carrito, y al cerrarlo aparecías
  hasta el final del catálogo. Guarda y restaura la posición, y compensa el
  ancho de la barra de scroll para que en computadora no brinque el contenido.
- **`lib/flags.ts`** — Banderas de prueba por dirección (`?grano=0`,
  `?glass=0`, `?talla=rojo`). Sirven para comparar dos versiones **en el teléfono, en vivo**,
  sin volver a desplegar. Nada se guarda: al abrir la dirección normal, todo
  vuelve a su valor de siempre. Se borran cuando cada cosa quede decidida.
- **`components/grain.tsx`** — El grano de película (el `<svg>` que genera el
  ruido). Antes vivía dentro de `app/layout.tsx`.
- **`proxy.ts`** — El candado. Corre en el servidor antes de mostrar
  `/product`: si el drop ya abrió, deja pasar; si no, exige la clave.

---

## 7. Cómo funciona el drop

1. El público entra a la home y ve el **countdown** (`app/page.tsx` +
   `components/countdown.tsx`), que cuenta hacia `DROP_DATE`.
2. Si alguien intenta entrar directo a `/product`, el **`proxy.ts`** lo
   revisa en el servidor:
   - ¿Ya pasó `DROP_DATE`? → entra (tienda pública).
   - ¿No, pero trae `?access=CLAVE` correcta? → guarda cookie y entra.
   - ¿No? → lo regresa a la home.
   - Esto **no se puede burlar** cambiando el reloj del navegador, porque la fecha
     se valida en el servidor.
3. Cuando el countdown llega a cero, la home muestra el botón **ENTRAR**.

---

## 8. Cómo funciona la compra

1. En el catálogo, el cliente hace clic en un cuadro (`productCard.tsx`) → se abre
   el modal (`productModal.tsx`) → elige talla y cantidad → **Agregar al carrito**
   (`store/cart.ts`).
2. Abre el carrito (`cartDrawer.tsx`) y da **Pagar ahora**.
3. El carrito manda los items a **`/api/checkout`**, que crea la sesión de Stripe
   y devuelve la URL.
4. El cliente paga en Stripe (tarjeta u OXXO), poniendo su dirección de envío.
5. Stripe lo regresa a **`/success`** y vacía el carrito.
6. En paralelo, Stripe avisa a **`/api/webhook`** que el pago se completó.
7. Tú ves la orden con la dirección en tu **Dashboard de Stripe** para enviarla.

---

## 9. Cómo hacer cambios comunes

> Casi todo lo del día a día se cambia en la carpeta `config/`.

### Cambiar el video del countdown
`config/drop.ts` → `DROP_VIDEO` (URL de Cloudinary del video) y `DROP_POSTER`
(imagen de respaldo). Súbelo a Cloudinary como *video* y usa `q_auto,vc_h264` en
la URL para que sea ligero y compatible. No subir videos pesados a git (`/public/*.mp4` está ignorado).

**Importante:** el video debe ir **SIN letras** (solo los caballos). El texto lo
pone el sitio encima. Si el video nuevo dura distinto, ajusta `INTRO_LOOP` en
`config/dropIntro.ts` y revisa los tiempos de las escenas.

### Cambiar los textos o tiempos del countdown
`config/dropIntro.ts` → `INTRO_CUES`. Cada escena tiene `start` y `end` (segundos
del video), `x`/`y` (% de la caja del video) y `size` (en `cqw`, o sea % del ancho
del video). Para mover una palabra a la derecha, súbele la `x`; para agrandarla,
súbele el `size`. Para apagar todo el texto: `INTRO_ENABLED = false`.

### Cambiar el color del texto del countdown
`config/dropIntro.ts` → `INTRO_COLOR`. Está en blanco. Si algún día hay que
compararlo contra un video que ya traiga letras quemadas, ponlo en verde
(`"#00E676"`) y se distingue solo.

### Cambiar la fecha del drop
`config/drop.ts` → edita `DROP_DATE`. Formato: `"2026-12-01T18:00:00-06:00"`
(el `-06:00` es la zona horaria del centro de México).

### Cambiar el precio de un producto
`config/products.ts` → cambia el número en `price` (en pesos, sin centavos).

### Agotar / reponer una talla
`config/products.ts` → en la talla, pon `stock: 0` para agotarla, o un número
mayor para reponerla. Si **todas** las tallas quedan en 0, el producto muestra
SOLD OUT automáticamente.

### Agregar un producto nuevo
`config/products.ts` → copia un bloque existente y cambia `slug` (único), `name`,
`price` y `sizes`. En `images` puedes poner **varias fotos** (frente, espalda,
detalle…): la primera es la principal y las demás salen como miniaturas.
La `description` es **bilingüe**: `{ en: "...", es: "..." }`.

### Agregar más fotos a un producto
`config/products.ts` → en `images`, agrega más nombres de archivo:
`images: [foto("frente"), foto("espalda"), foto("detalle")]`.

### Las fotos de las playeras
Se suben a Cloudinary y en `config/products.ts` solo se pone el nombre del
archivo; el helper `foto()` arma la URL con estas transformaciones:

- **`e_trim`** — recorta el vacío alrededor de la prenda. Las fotos llegan en
  16:9 con la playera chica en medio; sin esto se verían diminutas dentro del
  cuadro cuadrado del catálogo.
- **`f_auto,q_auto,w_900`** — formato y calidad automáticos. Cada foto pasa de
  ~650 KB a ~37 KB. **Siempre** hay que servirlas así.

> **PENDIENTE IMPORTANTE.** Las fotos actuales están recortadas del fondo con el
> borde duro (en escalerita, sin suavizar). Sobre fondo oscuro no se nota, pero
> **en tema claro se ven los escalones**. El editor va a entregar los mockups
> bien recortados; al reemplazarlos esto desaparece solo, sin tocar código.
> (Se probó ponerles un fondo fijo oscuro para taparlo y se descartó: se prefirió
> conservar el look de la prenda recortada sobre el fondo del tema.)

### El número grande del cuadro (01, 02, 03)
En el **catálogo** va abajo a la derecha, metido tras la playera: el `<span>`
está ANTES de la `<Image>`, así la foto se pinta encima y parece que el número
quedó atrás. Se mide en `cqw` (% del ancho del cuadro) para que se vea igual en
teléfono y en computadora. En el **modal** va arriba a la izquierda, que ahí la
prenda se ve completa y funciona mejor como marca de agua.

### Cambiar la clave de acceso de preview
`config/drop.ts` → `DROP_ACCESS_KEY`. En producción, mejor ponla como variable de
entorno `DROP_ACCESS_KEY` en Vercel.

### Poner el correo de contacto y el Instagram
`config/brand.ts` → `CONTACT_EMAIL` e `INSTAGRAM_URL`. Mientras estén vacíos, el
footer simplemente no muestra esos enlaces; en cuanto los llenes, aparecen solos.

### Ajustar el grano de película
`app/globals.css` → clase `.grain`, la propiedad `opacity` (hoy `0.05`). Es una
textura que genera el navegador con un `<svg>` que vive en
`components/grain.tsx`, así que no pesa nada. Pasando de ~0.15 empieza a
comerse el contraste del texto.

Para **apagarlo y compararlo** sin desplegar nada, abre cualquier página con
`?grano=0` al final de la dirección (y `?grano=1` para prenderlo).

### La Helvetica del countdown
El video original está tipografiado en **Helvetica**. Windows y Android no la
traen y el navegador caía en Arial, que se ve casi igual pero tiene la **G sin
espolón** y la **R de pierna recta** — se notaba. Por eso `app/layout.tsx` carga
**TeX Gyre Heros**, un clon libre de Helvetica (licencia GUST), desde
`app/fonts/heros-*.woff2`. Están recortadas a los caracteres que usa el sitio:
pesan ~9 KB cada una, ~38 KB las cuatro (normal, negritas y sus itálicas).

Están recortadas a **Latin-1 completo**: traen minúsculas, acentos, ñ, ¿, ¡ y
comillas tipográficas, por eso alcanzan para TODO el sitio en español y no solo
para el countdown. Desde ago-2026 son la única tipografía (ver "Cambiar la
fuente").

Si algún día se compra la licencia de la Helvetica real, basta reemplazar los
cuatro archivos de `app/fonts/` y no hay que tocar nada más.

### Cambiar la fuente
Desde ago-2026 el sitio tiene **UNA SOLA tipografía**: la Helvetica del
countdown (TeX Gyre Heros), en todo. Antes convivían dos — Saira Semi
Condensed para el cuerpo y la Helvetica para títulos y countdown.

Se controla en un solo lugar: `app/globals.css` → `--font-sans`. Para volver a
tener una tipografía distinta en el cuerpo, se carga en `app/layout.tsx` (con
`next/font/google`) y se apunta `--font-sans` a su variable.

### Cambiar colores de marca
`app/globals.css`:
- Colores fijos de marca: `--color-olive`, `--color-cream`, `--color-cream-dark`.
- Colores del tema **claro**: bloque `:root` (`--background`, `--foreground`, `--surface`).
- Colores del tema **oscuro**: bloque `.dark` (los mismos tokens, invertidos).
Cambiarlos ahí actualiza todo el sitio en su respectivo tema.

### Editar textos / traducciones
`lib/i18n/dictionaries.ts` → cambia el texto en `en` y su equivalente en `es`.
Ambos bloques deben tener las mismas claves.

### Cambiar el idioma por defecto
`lib/i18n/context.tsx` → `DEFAULT_LANG` (`"en"` o `"es"`).

### Editar los accesos del panel
`config/panel.ts` → agrega/quita links por grupo. `external: true` abre en pestaña
nueva; `soon: true` lo marca "próximamente".

### Cambiar la contraseña del panel
Variable de entorno `ADMIN_PASSWORD` (en `.env.local` para local, y en Vercel para
producción).

### Cambiar la ruta secreta del panel
Edita `PANEL_PATH` en `lib/adminAuth.ts`, el `matcher` en `proxy.ts` (debe ser
literal), y **renombra la carpeta** `app/idg-hq-9f2a/` para que coincidan los tres.

### Editar los términos y condiciones
`lib/i18n/dictionaries.ts` → sección `terms` (en `en` y `es`). Reemplaza los
textos entre `[corchetes]` con tus datos reales.

---

## 10. Despliegue en Vercel

**Ya está conectado:** el repo está en GitHub y Vercel despliega solo. **Cada push
a la rama `main` = despliegue a producción en vivo.** Variables de entorno ya
capturadas en Vercel (STRIPE keys, NEXT_PUBLIC_URL, ADMIN_PASSWORD).

Recordatorios de configuración:
- El **webhook**: en Stripe → Developers → Webhooks → endpoint
  `https://indegostudio.com/api/webhook`, y copia el `whsec_...` a
  `STRIPE_WEBHOOK_SECRET` en Vercel.
- Para aceptar **OXXO**: actívalo en Stripe → Settings → Payment methods.
- Si cambias variables `NEXT_PUBLIC_*`, haz **Redeploy** para que apliquen.

---

## 11. Pendientes / próximos pasos

### Resuelto el 1-ago-2026

- **El botón de pagar cortado en iOS.** La causa no era solo `h-dvh`: era que
  la página de atrás **seguía scrolleando** con el carrito abierto, y al
  scrollear Safari esconde su barra de abajo, así que la altura de la ventana
  cambiaba a media animación y el pie del checkout quedaba fuera. Se arregló
  bloqueando el scroll del fondo (`lib/useScrollLock.ts`), cambiando el panel a
  `h-svh` y agregando `env(safe-area-inset-bottom)` al pie por la barra de
  gestos del iPhone. **Falta confirmarlo en el iPhone.**
- **Se movía la página desde el carrito** y al cerrarlo aparecías hasta abajo.
  Mismo arreglo: ahora se guarda y se restaura la posición exacta.
- **Rendimiento: se quitaron los cuatro `backdrop-filter`.** Eran el costo real
  (el navegador tenía que volver a desenfocar el fondo en cada cuadro). El panel
  del modal pasó a fondo sólido y los fondos oscuros del carrito y el modal, a
  color plano con más opacidad. **El cristal del navbar SE QUEDÓ**: era el más
  barato de los cuatro (una franja de 80 px, no un panel animado encima) y el
  que más se nota. Si el scroll aún se siente pesado, es el siguiente
  sospechoso: se prueba con `?glass=0`.
- **El carrito ya está al estilo del modal:** sin recuadro en la cantidad y
  botón de pagar en puro texto.
- **Tema claro por defecto** y **halo para las prendas en tema oscuro**.
- **Tipografía unificada:** todo el sitio en la Helvetica del countdown.
- **Transición countdown → tienda:** fundido al color del tema.
- **Traducciones auditadas** (ver la nota grande en `lib/i18n/dictionaries.ts`).

### Falta verificar EN EL IPHONE

1. Que el botón de pagar ya no se corte, con la página scrolleada hasta abajo.
2. Si los tirones se fueron al quitar los `backdrop-filter`. Si aún se sienten,
   comparar con `?grano=0` (granulado) y `?glass=0` (cristal del navbar) para
   descartarlos uno por uno.
3. Que la barra de direcciones cambie de color con el tema. Si falla, hay
   PLAN B en `components/themeColorSync.tsx` (`DEJAR_QUE_SAFARI_ELIJA = true`).

### Para decidir con el equipo

- **Cómo se marca la talla elegida.** Hoy con el contraste del tema: la elegida
  al 100% y las demás al 35%. El riesgo es que, siendo solo opacidad, con poco
  brillo o al sol no se note cuál está seleccionada — que es justo la que se va
  al carrito. Para verlas **en vivo, una junto a la otra**: abre el catálogo con
  `?talla=rojo` o `?talla=tema`. Se decide y se borra la bandera
  (`MARCA_TALLA_POR_DEFECTO` en `productModal.tsx`).
- **Modal en escritorio con los controles CENTRADOS** — es un cambio de prueba
  de esta sesión. Cómo revertirlo está comentado en el propio archivo.
- **Nombres de los productos** — reemplazar "IDG - 01/02/03".
- **Video del countdown** — pesa 5.29 MB, lo más pesado del sitio. Medido:
  `q_auto:eco` lo baja a 4.07 MB (−23%); a 960 px de ancho, a 2.63 MB (−50%).
  Afecta la calidad del material, por eso es decisión del equipo.
- **Datos que faltan** — correo de contacto e Instagram en `config/brand.ts`
  (mientras estén vacíos, el footer no muestra esos enlaces).

### Estética — propuestas pendientes

- **Quitar la placa del cuadro de producto.** Hoy la foto va sobre un cuadro
  `bg-surface`. Cuando lleguen los recortes buenos, se puede quitar y dejar la
  prenda flotando sobre el fondo de la página. El halo de tema oscuro sigue
  funcionando sin la placa.
- **Cierre del catálogo.** El manifiesto se movió arriba, así que la página
  termina en el teaser y el pie, sin remate.

### Diseño / contenido

- **Recortes buenos de las playeras** — el editor entrega los mockups sin fondo
  con el borde suavizado. Al reemplazarlos en Cloudinary desaparecen los
  escalones que hoy se ven en tema claro. Ver "Las fotos de las playeras".
- **Assets reales a Cloudinary** — logos oficiales (negro y blanco → reemplazar
  `LOGO_DARK`/`LOGO_LIGHT` en `navbar.tsx`) y fotos reales de playeras
  (frente/espalda → `config/products.ts`).
- **Video en escritorio** — decidir si va con zoom (`object-cover`, actual) o
  completo con franjas (`object-contain`).

### Antes de abrir la tienda

- **Fecha real del drop** (`DROP_DATE`), hoy placeholder 1-sep-2026.
- **Stripe en modo LIVE** + activar **OXXO** + webhook live.
- **Rellenar `/terms`** (textos entre `[corchetes]`, en los dos idiomas).
- **Variables de entorno en Vercel** (STRIPE, NEXT_PUBLIC_URL, ADMIN_PASSWORD).

### Siguiente etapa técnica

- **Base de datos (Supabase) + correos (Resend)** — guardar órdenes, descontar
  stock automático y confirmar por correo. Mostrar ventas/stock en el panel.
- **Login más robusto para el panel** (hoy es contraseña por variable de
  entorno; migrar a Supabase Auth cuando maneje datos de ventas).
- **Tarifa de envío** — definir (gratis en el precio o tarifa plana).
- **Meses sin intereses (MSI)** — evaluar tras el primer drop.

---

_Última actualización de este manual: 1 de agosto de 2026._
