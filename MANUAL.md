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
| `CLOUDINARY_API_KEY` | Llave de tu cuenta de Cloudinary. **Necesaria** para que funcione la convocatoria ("nuestros museos están vacíos"). |
| `CLOUDINARY_API_SECRET` | Secreto de esa misma cuenta. **Nunca compartir.** |
| `CLOUDINARY_CLOUD_NAME` | (Opcional) Solo si algún día cambia la cuenta. Default: `dij60ghdf`. |

> **Dónde salen las llaves de Cloudinary:** cloudinary.com → Settings → API Keys.
> El *cloud name* es público (ya está en el código, es el de las URLs de las
> fotos); la **API Secret no**, va solo en `.env.local` y en Vercel.
> Mientras no estén puestas, el formulario de la convocatoria se ve pero al
> enviar avisa que no se pudo y ofrece el Linktree — no se traga los envíos en
> silencio, que sería lo peor que podría pasar.

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
│   ├── aboutBlock.tsx       # dibuja un bloque de la página "Nosotros"
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
│   ├── about.ts             # contenido de la página "Nosotros" (textos/fotos/video)
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

- **`layout.tsx`** — Envuelve todo el sitio. Carga la **Helvetica** (única
  tipografía del sitio, ver abajo), define los metadatos (título,
  previsualización al compartir), el proveedor de tema, el grano y Analytics.
- **`page.tsx`** (home) — **Video de fondo en bucle** (Cloudinary) con el texto
  del drop encima (`dropIntro.tsx`) y el contador (rojo, Helvetica, un poco
  abajo). Cuando llega a cero (o si ya pasó la fecha), revela el botón
  **ENTRAR**; si tienes la cookie de preview, muestra "Entrar (preview)". En
  móvil vertical el video llena la pantalla con `object-cover`, es decir hace
  zoom a los caballos, y el texto se reacomoda solo al formato vertical.
- **`product/[slug]/page.tsx`** — **PRUEBA (ago-2026)**: página propia de cada
  playera. Lo que gana contra el modal es que tiene DIRECCIÓN propia (se puede
  mandar el enlace de UNA playera por Instagram o WhatsApp) y **previsualización
  propia al compartir**: `generateMetadata` pone el nombre, el precio y la foto
  de ESA prenda, en vez de la imagen genérica del sitio. Las tres se
  pregeneran. El candado del drop ya las cubre (el filtro de `proxy.ts` es
  `/product/:path*`). Hoy NADA enlaza a ellas: se entra escribiendo la
  dirección, porque el catálogo sigue abriendo el modal.
- **`product/page.tsx`** — La tienda. Abre con el **manifiesto** (de lado a lado,
  justo debajo del navbar), y luego las tarjetas del catálogo. Ya no lleva título
  ("The Collection" / "Drop 1"): se quitó porque el manifiesto ya hace de
  entrada. Aquí se montan el Navbar, el CartDrawer y el Footer.
- **`success/page.tsx`** — A donde Stripe manda al cliente tras pagar. Vacía el
  carrito y le muestra su **número de pedido** (`IDG-XXXXXX`), que es lo que va
  a necesitar para consultar su pedido después.
- **`order/page.tsx`** — **Estado del pedido**, enlazada desde el pie. El
  cliente escribe su número de pedido y el correo con el que compró, y ve en
  qué va: pago confirmado, esperando OXXO, en camino (con guía) o no pagado.
  Se piden LAS DOS COSAS porque con el número solo, cualquiera que se lo
  encontrara vería una compra ajena.
- **`terms/page.tsx`** — Términos y condiciones (texto editable con placeholders).
- **`about/page.tsx`** — **NOSOTROS**, la página de marca (ago-2026). Es un
  armazón: **no tiene contenido propio**, todo sale de `config/about.ts` y aquí
  solo se decide el orden (portada → bloques → cierre). Enlazada desde el pie.
  **Es pública incluso antes del drop**, porque el candado de `proxy.ts` solo
  cubre `/product`: se puede compartir desde Instagram mientras el countdown
  sigue corriendo. Para esconderla hasta el lanzamiento, se agrega `"/about"` al
  `matcher` de `proxy.ts`. Nace VACÍA a propósito, con textos de relleno entre
  [corchetes] y sin fotos — ver "Llenar la página de Nosotros" abajo.

### API (`app/api/`)

- **`checkout/route.ts`** — Recibe los items del carrito y crea una **sesión de
  pago** en Stripe. Pide dirección de envío (solo México) y teléfono.

  **REGLA QUE NO SE DEBE ROMPER: el navegador NO manda precios.** Solo dice qué
  playera (`slug`), qué talla y cuántas; el precio lo pone el servidor leyendo
  `config/products.ts`. Antes el precio venía en la petición y se le hacía
  caso — o sea que cualquiera con las herramientas de desarrollador podía
  cambiarlo antes de enviarlo y comprarse una playera de $600 en $20 (probado
  el 1-ago-2026: Stripe cobraba los $20 sin chistar). Si algún día se agrega
  un producto o un descuento, el precio tiene que seguir saliendo del servidor.

  También valida contra el catálogo que la playera y la talla existan, que la
  talla no esté agotada y que no se pidan más de 10 piezas. Ojo con el límite
  real de esto: el inventario de `config/products.ts` está escrito a mano, así
  que frena pedidos absurdos pero **no evita que dos personas compren la última
  pieza al mismo tiempo** — eso llega con Supabase.
- **`webhook/route.ts`** — Stripe le avisa aquí cuando un pago se completa.
  Maneja el caso especial de OXXO (pago diferido). Hoy registra la orden en los
  logs; a futuro guardará en base de datos.
- **`order/route.ts`** — Resuelve la consulta del estado del pedido. Como
  todavía no hay base de datos, le pregunta a **Stripe**. Detalle importante:
  Stripe solo deja BUSCAR por `metadata` en los pagos, no en las sesiones de
  checkout, por eso el número de pedido se guarda en los dos lados. Y como el
  pago no existe hasta que el cliente entra a pagar (y Stripe tarda hasta un
  minuto en indexar lo nuevo), hay un respaldo que revisa las últimas 100
  sesiones para cubrir ese hueco.
- **`convocatoria/route.ts`** — Recibe lo que manda la gente en "nuestros museos
  están vacíos" y **lo guarda en Cloudinary**, que hace de buzón: hoy no hay
  base de datos ni servicio de correo, y Cloudinary es lo único que ya está
  pagado y en uso. Cada envío deja un `.txt` con nombre, contacto y mensaje
  (siempre, aunque no adjunten nada) y, si hubo adjunto, el archivo al lado con
  el mismo nombre base. **No es la solución definitiva y no pretende serlo**:
  cuando entre Supabase esto se vuelve una tabla y solo cambia el interior de la
  ruta; la sección y el formulario se quedan igual.
  Frena hasta 5 envíos por IP cada 10 minutos, con el mismo tope tosco en
  memoria de `order/route.ts` (se pierde en cada despliegue) — si algún día
  llega spam de verdad, hace falta estado compartido o un captcha.

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
- **`dropTag.tsx`** — **PRUEBA (ago-2026)**: el sticker "SPECIAL DROP #1"
  montado a caballo en el borde de abajo del navbar (la mayor parte adentro, el
  resto colgando). Es la forma de llegar al catálogo desde que la puerta de
  entrada es el Nosotros. Se esconde solo dentro de `/product`, que es donde
  sobraría. Va **ladeada** y se endereza y crece al pasar el cursor, en medio
  segundo — a 300 ms se sentía un tirón seco.
  **Sale en UN SOLO lugar del sitio, y por eso pesa.** Se probó ponerla también
  cerrando el Nosotros, en lugar del "VER DROP #1" de texto, y **se revirtió**
  (6-ago-2026): repetida a los pocos segundos de scroll se leía como relleno y
  le quitaba fuerza a la de arriba, que es la que tiene que llamar.
  **Queda en distinto lugar según el tamaño:** en teléfono va más a la
  izquierda (`left-[70px]`, encimándole 10 px al logo, sobre aire y no sobre
  dibujo) y un poco más arriba, porque colgando media etiqueta se comía
  demasiada pantalla; en computadora va después del logo (`left-[146px]`) y
  centrada en el borde.
  La imagen sale de `DROP_TAG_IMAGE` (`config/drop.ts`) y **es apaisada**
  (1681 × 936). Se mide POR ALTURA y el ancho lo saca de la imagen, así que
  cambiarla por otra no la deforma — pero sí cambia cuánto ocupa a lo ancho: si
  algún día vuelve a ser cuadrada, hay que revisar ese `left-*`. Mientras esa
  variable esté vacía se dibuja una etiqueta de respaldo en SVG con los colores
  del tema, para que el navbar no quede con un hueco.
- **`convocatoria.tsx`** — **"NUESTROS MUSEOS ESTÁN VACÍOS"**, la sección que
  cierra el Nosotros: una puerta abierta para que quien haga algo lo mande y se
  pueda colaborar. Va DESPUÉS de la banda que lleva al catálogo, a propósito —
  la página termina pidiendo algo en vez de vendiendo algo. Formulario de
  nombre, contacto (correo **o** @instagram, por eso no valida formato),
  mensaje y **un adjunto opcional** (JPG/PNG/WEBP/GIF/PDF, hasta 4 MB). Trae
  trampa para robots (un campo escondido que solo ellos llenan) y valida de los
  dos lados. El título y la invitación se editan en `config/convocatoria.ts`,
  que también trae el apagador (`activa: false` y desaparece).
- **`footer.tsx`** — Pie con enlaces a Términos y Linktree.
- **`productCard.tsx`** — Fila editorial del catálogo: cuadro de imagen (con
  número 01/02/03) y **nombre en grande** + descripción, alternando
  izquierda/derecha por producto. En **móvil**: título arriba de la imagen y
  descripción debajo. Al hacer clic abre el modal. Marca SOLD OUT.
  **Muestra la ESPALDA sin abrir el modal**: en computadora, al pasar el cursor
  la foto se funde a la espalda; en teléfono se DESLIZA sobre la foto, el mismo
  gesto que ya tenía el modal. En teléfono lleva **la rayita**
  (`components/swipeHint.tsx`) DENTRO del cuadro, debajo de la playera — eso
  cierra el hueco viejo de que nada avisaba que hubiera una segunda foto. Las
  dos fotos van encimadas y solo se cambia la opacidad — si se intercambiara el
  `src`, la espalda parpadearía la primera vez.
- **`productDetail.tsx`** — **PRUEBA (ago-2026)**: el contenido de la página
  propia de cada playera (`/product/idg-01`). Es lo mismo que el modal pero
  como página: aquí sí cabe la descripción y la foto se queda pegada al
  scrollear en escritorio. **Está a revisión**: falta decidir si reemplaza al
  modal o convive con él.
- **`productTeaser.tsx`** — Cuadro "incógnito" (04–05) que adelanta el Drop 1.5,
  con candado y "Drop 1.5 · Próximamente" dentro. Se muestra al final del catálogo.
- **`productModal.tsx`** — Ventana de detalle en un **panel tipo glass**. En
  **escritorio** es tarjeta centrada (imagen + info al lado, precio bajo el
  nombre). En **móvil** ocupa la pantalla completa (`100svh`, sin scroll: imagen
  arriba flexible, controles abajo, precio junto al nombre) y se puede **deslizar
  (swipe)** para cambiar de foto; bloquea el scroll del fondo al abrir. Incluye
  la rayita, talla, cantidad y agregar al carrito.
- **`swipeHint.tsx`** — **La rayita** que dice en qué foto vas (ago-2026,
  reemplazó a los puntitos en los tres lugares: catálogo, modal y página de
  producto). Es una línea fina y tenue con un relleno adentro que se carga a la
  izquierda o a la derecha. Mientras se arrastra, el relleno **sigue al dedo**
  (el padre le pasa `arrastre`, la fracción de foto recorrida) y al soltar cae
  en su lugar con una transición corta. Es `aria-hidden` y
  `pointer-events-none`: pura decoración, el cambio de foto ya se anuncia desde
  el botón de la imagen. Por qué línea y no puntos: los puntos son dos objetos
  sueltos que hay que contar; la línea es un solo trazo que se lee de reojo y se
  puede arrastrar, que es justo el gesto que se quiere enseñar.
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
- **El HALO detrás de la prenda.** Nació por necesidad: las tres playeras son
  oscuras y contra el fondo olivo se perdían (medido: la café marca 57 de
  luminancia y su fondo 60, o sea casi lo mismo). Es un fondo, no un filtro: no
  cuesta rendimiento, y sigue sirviendo cuando lleguen los recortes buenos y se
  quite la placa del cuadro.

  Hay **DOS clases distintas** en `globals.css` y no se deben unificar:

  | Clase | Dónde | Claro | Oscuro |
  |---|---|---|---|
  | `.halo-prenda` | catálogo y página de producto | verde olivo, ancho | crema, angosto |
  | `.halo-modal` | solo el modal | **nada** | crema, con `closest-side` |

  Por qué son distintas, que es lo que costó afinar:
  - En el **modal en claro** no va nada: ahí no hay placa, así que el verde
    quedaba como una mancha suelta en medio de la pantalla.
  - En **claro** el halo va ancho porque la playera tapa el centro del cuadro,
    justo donde un halo angosto es más intenso; poniendo la fuerza en el anillo
    que rodea a la prenda sí se ve.
  - El del modal usa `closest-side` para que el degradado siempre termine en
    transparente ANTES de tocar el borde. Sin eso se le veía la forma cuadrada
    recortada, porque en una caja alta el degradado llegaba al borde con color.
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
Se suben a Cloudinary y en `config/products.ts` se pone la **versión y el
nombre** del archivo (`v1785968996/negro_adelante_lcb2qa`); el helper `foto()`
arma la URL con estas transformaciones:

- **`e_trim`** — recorta el vacío alrededor de la prenda. Las fotos llegan en
  1700×1000 con la playera chica en medio; sin esto se verían diminutas dentro
  del cuadro cuadrado del catálogo. **Depende de que el fondo sea transparente**:
  con un fondo blanco sólido, `e_trim` no recorta nada.
- **`f_auto,q_auto,w_900`** — formato y calidad automáticos. Cada foto pasa de
  ~400–950 KB a 33–56 KB. **Siempre** hay que servirlas así.

La **versión** (`v…`) va pegada al nombre porque Cloudinary le pone una distinta
a cada archivo según el segundo en que se subió; no hay una sola para todas.
Cópiala tal cual de la URL, junto con el sufijo aleatorio del nombre.

> **RESUELTO (5-ago-2026).** Ya están las fotos finales del editor: las seis en
> 1700×1000, fondo transparente y **borde suavizado** (unos 9–12 mil píxeles de
> alfa parcial en cada una). El problema viejo —el recorte en escalerita que se
> notaba en tema claro— desapareció, sin tocar código.
>
> Con eso, **el cuadro (`bg-surface`) y el halo detrás de la prenda ya son
> opcionales**: existían en parte para disimular ese borde duro. Hoy se quedan
> por estética, pero si se quieren quitar, es la clase `halo-prenda` y el
> `bg-surface` del botón en `components/productCard.tsx`.

### El número grande del cuadro (01, 02, 03)
En el **catálogo** va abajo a la derecha, metido tras la playera: el `<span>`
está ANTES de la `<Image>`, así la foto se pinta encima y parece que el número
quedó atrás. Se mide en `cqw` (% del ancho del cuadro) para que se vea igual en
teléfono y en computadora. En el **modal** va arriba a la izquierda, que ahí la
prenda se ve completa y funciona mejor como marca de agua.

### Cambiar la clave de acceso de preview
**La clave NO se escribe en el código.** Sale solo de la variable de entorno
`DROP_ACCESS_KEY`: en producción se pone en Vercel (Settings > Environment
Variables) y en local en `.env.local`. Si no está puesta, el acceso anticipado
queda apagado y todos ven el countdown.

Es así porque **este repositorio es público**: hasta el 1-ago-2026 la clave
estaba escrita en `config/drop.ts` (`"indego-preview"`), o sea que cualquiera
que abriera el código en GitHub podía entrar a la tienda antes del drop.

Para rotarla: cambia el valor en Vercel y vuelve a desplegar. Las cookies de
quienes ya habían entrado con la clave vieja dejan de servir solas, porque se
comparan contra la nueva.

### Llenar la página de Nosotros (`/about`)

> **Por qué NO se parece al catálogo.** La primera versión era la tienda con
> otro texto (mismas bandas invertidas, mismo ancho centrado, mismos títulos
> gigantes) y se leía como copia. Ahora comparte la piel —Helvetica, colores del
> tema, grano— pero tiene su propia composición, la de un dossier y no la de una
> vitrina: **rejilla asimétrica** (etiqueta angosta a la izquierda, contenido a
> la derecha, nunca centrado), **la etiqueta se queda fija** mientras su texto
> pasa de largo, **jerarquía al revés** (títulos chicos y espaciados, párrafos
> grandes: esta página se viene a leer), **secciones numeradas** separadas por
> líneas finas, y **una sola banda invertida**, al final. El manifiesto ABRE la
> tienda; esta CIERRA el Nosotros. Si se toca el diseño, conviene no perder esas
> cinco cosas: son lo que la distingue.

Todo se edita en **`config/about.ts`**; la página (`app/about/page.tsx`) no se
toca. Tres partes:

1. **`ABOUT_PORTADA`** — la foto grande de arriba y el párrafo de entrada.
2. **`BLOQUES`** — la lista que se pinta de arriba abajo, en ese orden. Agrega,
   quita o reordena a gusto. Hay cinco tipos:
   - `frase` — una cita descolgada, grande, dentro de la columna de contenido.
     **Inglés fijo** (es voz de marca, no interfaz); lo que va entre
     `*asteriscos*` sale en cursiva.
   - `texto` — párrafo con título. Este **sí se traduce** (`{ en, es }`).
   - `foto` — una imagen; con `completo: true` va de borde a borde.
   - `duo` — dos fotos al parejo (en el teléfono se apilan).
   - `video` — en bucle y sin sonido, como el del countdown.
3. **`ABOUT_CIERRE`** — la última frase, arriba del botón al catálogo.

**Las fotos y el video van a Cloudinary**, igual que el catálogo: se sube el
archivo y se pega la URL con `f_auto,q_auto,w_1600` (o `q_auto,vc_h264,w_1280`
si es video), para que no pesen de más.

**Mientras no haya archivo, deja el `src` vacío (`""`).** El bloque no se
publica: en el sitio en vivo no aparece nada roto, y en `npm run dev` sí se ve
un recuadro punteado marcando el hueco. Así se puede ir llenando por partes sin
riesgo de que se escape algo a medias a producción.

Los textos entre **[corchetes]** son relleno (misma convención que los
términos): están puestos como guion para ver la forma de la página, hay que
reemplazarlos por los de verdad.

**Ojo con el "VER DROP #1" del cierre:** manda a `/product`, y antes del drop
eso regresa al countdown a quien no tenga la clave de acceso. Es a propósito, la
misma decisión que en las páginas por producto.

### La convocatoria: "nuestros museos están vacíos"
Es la sección de hasta abajo del Nosotros, donde la gente manda su arte para
colaborar. Todo lo editable está en **`config/convocatoria.ts`**:

| Qué | Para qué |
|---|---|
| `activa` | Ponlo en `false` y la sección desaparece y la ruta deja de recibir. Sirve para cerrarla sin borrar nada. |
| `titulo` | El titular. Va **traducido** (`{ en, es }`), no en inglés fijo: es una invitación a que alguien escriba, y se pide en el idioma en el que está leyendo. |
| `entrada` | La explicación corta de al lado. |
| `carpeta` | La carpeta de Cloudinary donde caen los envíos. |
| `maxMB` | Peso máximo del adjunto. **No lo subas de 4**: el archivo pasa por Vercel, que corta las peticiones de más de 4.5 MB. |
| `formatos` | Tipos de archivo que se aceptan. |

Los textos del formulario (etiquetas, botones, errores) están en
`lib/i18n/dictionaries.ts` → bloque `convocatoria`, en los dos idiomas.

**Para leer lo que llega:** entra a Cloudinary → Media Library → carpeta
`indego-convocatoria`. Cada envío deja un `.txt` con el mensaje completo (y el
adjunto al lado, si lo hubo), nombrados `AAAAMMDD-HHmm-nombre` para que la
carpeta se lea en orden. También quedan etiquetados `convocatoria`, así que se
pueden filtrar por tag.

**Necesita `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`** (ver sección 4). Sin
ellas el formulario se ve pero al enviar avisa que no se pudo y ofrece el
Linktree.

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

### Publicar el número de guía de un pedido
La página de **estado del pedido** (`/order`) puede mostrarle al cliente su
guía, pero Stripe no sabe nada de paqueterías: hay que escribírsela.

En el Dashboard de Stripe, abre el **pago** de esa orden y agrégale estos
`metadata` (botón "Edit metadata" en la sección de detalles del pago):

| Clave | Valor | ¿Obligatorio? |
|---|---|---|
| `tracking_number` | El número de guía | Sí — sin este, el pedido sigue como "en preparación" |
| `tracking_carrier` | La paquetería (Estafeta, DHL…) | No |
| `tracking_url` | El enlace directo de rastreo | No |

En cuanto guardes, el cliente lo ve al consultar su pedido y el estado cambia
a **"En camino"**. Para OXXO pendiente puedes poner también `oxxo_voucher_url`
con el enlace de la ficha.

Cuando exista Supabase esto se automatiza y ya no habrá que capturarlo a mano.

### Encontrar un pedido por su número
Los pedidos llevan un número corto tipo `IDG-4F7K2P` (lo genera
`lib/orderNumber.ts` al crear la sesión de pago). En Stripe lo tienes en el
`metadata` de la sesión y del pago, así que se puede buscar en el buscador del
Dashboard escribiendo el número tal cual.

El alfabeto del código no usa O, 0, I, 1 ni L: son las que la gente confunde
al dictarlas por teléfono.

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

### Revisión completa del proyecto (1-ago-2026)

Lo que se buscó: seguridad, rendimiento, código muerto y correctitud.

**Corregido en el momento:**
- **El precio del checkout venía del navegador** y el servidor le hacía caso.
  Explotado en prueba: una playera de $600 quedó lista para cobrarse en $20.
  Ya no — ver `checkout/route.ts`. **Es el hallazgo más grave de la revisión.**
- **No se validaban existencias en el servidor**: se podían pedir 500 piezas o
  una talla agotada. Ahora se valida contra el catálogo.
- **La clave de preview estaba escrita en el código de un repo público.** Ahora
  sale solo de `DROP_ACCESS_KEY`.
- **El carrito guardado mostraba precios viejos.** Como el cobro sale del
  catálogo, el carrito ahora muestra ese mismo (`precioVigente` en
  `store/cart.ts`), para que lo que se ve sea lo que se cobra.

**Detectado y NO corregido (por orden de importancia):**
1. **El login del panel es débil.** La cookie guarda `sha256(contraseña)` sin
   sal y sin caducar ni rotar. Sirve mientras el panel solo tenga enlaces, pero
   NO cuando muestre ventas. Ya está en el plan migrar a Supabase Auth.
2. **Nadie descuenta el stock.** `config/products.ts` es un inventario a mano:
   dos personas pueden comprar la última pieza a la vez y las dos pagan. Es EL
   motivo principal para hacer la etapa de Supabase antes del drop.
3. **`/api/checkout` no tiene freno de peticiones.** Se pueden crear sesiones de
   pago en masa. No cobra nada ni rompe nada, pero ensucia el Dashboard.
   (`/api/order` sí tiene un tope de 10 por minuto.)
4. **El catálogo ahora descarga el doble de fotos** (frente + espalda de cada
   playera, para el efecto del cursor). Son ~37 KB cada una y van en carga
   diferida, así que hoy no duele; si algún día se suben fotos pesadas, sí.
5. **El video del countdown sigue siendo 5.29 MB**, con diferencia lo más
   pesado del sitio. Sigue pendiente la decisión de comprimirlo.
6. **`DROP_NAME` en `config/drop.ts` ya no se usa** (el catálogo dejó de tener
   título cuando entró el manifiesto). Se deja por si vuelve.
7. **`router.back()` en `/order` y `/terms`** no hace nada si alguien llega
   directo desde un enlace compartido, porque no hay historial.

**Revisado y sin problemas:** `.env.local` nunca se ha subido a git; el panel no
tiene contraseñas escritas en el código; el webhook valida la firma de Stripe;
la consulta de pedidos no filtra datos de más ni dice cuál dato falló.

### Antes de abrir la tienda

- **Fecha real del drop** (`DROP_DATE`), hoy placeholder 1-sep-2026.
- **Stripe en modo LIVE** + activar **OXXO** + webhook live.
- **Rellenar `/terms`** (textos entre `[corchetes]`, en los dos idiomas).
- **Variables de entorno en Vercel** (STRIPE, NEXT_PUBLIC_URL, ADMIN_PASSWORD,
  y **CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET** para la convocatoria).
- **Probar la convocatoria de punta a punta** (6-ago-2026): se probó todo el
  camino —formulario, validaciones, trampa de robots, límite de intentos y el
  aviso de error con el Linktree— **menos la subida real a Cloudinary**, que no
  se pudo correr porque las llaves todavía no están puestas. En cuanto estén,
  mandar un envío de prueba con adjunto y confirmar que aparecen el `.txt` y el
  archivo en la carpeta `indego-convocatoria`.

### Siguiente etapa técnica

- **Base de datos (Supabase) + correos (Resend)** — guardar órdenes, descontar
  stock automático y confirmar por correo. Mostrar ventas/stock en el panel.
  **Se lleva también la convocatoria**: hoy los envíos se guardan en Cloudinary
  a falta de otro lado, y con Supabase pasan a ser una tabla (y con Resend, un
  aviso por correo en vez de tener que entrar a revisar la carpeta).
- **Login más robusto para el panel** (hoy es contraseña por variable de
  entorno; migrar a Supabase Auth cuando maneje datos de ventas).
- **Tarifa de envío** — definir (gratis en el precio o tarifa plana).
- **Meses sin intereses (MSI)** — evaluar tras el primer drop.

---

_Última actualización de este manual: 1 de agosto de 2026 (incluye la revisión completa del proyecto)._
