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
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave pública de Stripe. **HOY NO LA USA NADIE** (revisado 6-ago-2026): el pago no lo arma el navegador, el servidor crea la sesión y redirige a la URL de Stripe. Se deja puesta por si algún día se usa Stripe desde el cliente; ver la auditoría en la sección 11. |
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
  `INSTAGRAM_URL`, `LINKTREE_URL`, el `MANIFESTO` y **los logos**. El correo
  y el Instagram **solo aparecen en el footer si están llenos** (vacío = no se
  muestra el enlace), para no publicar un dato inventado.
  **LOS LOGOS VIVEN AQUÍ**, cada uno en sus dos versiones (`claro` = el negro,
  para fondos claros; `oscuro` = el blanco): **`LOGO_PALABRA`** es el alterno,
  la palabra INDEGO, y **`LOGO_ESTRELLA`** es el principal, el del navbar. Están
  en la config y no escritos dentro de los componentes porque cada uno lo usan
  varios —la cascada del Nosotros, el patrón de fondo del catálogo y el navbar—,
  así que cambiar un archivo se hace en un solo lugar.
  > Ojo: `LOGO_ESTRELLA` **no** lleva `e_trim`. El navbar necesita el margen
  > transparente del archivo para que la estrella quede centrada y del tamaño de
  > siempre; recortándola cambiaría de tamaño. Quien la quiera recortada que se
  > lo pida a Cloudinary por su cuenta.
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
- **`lib/usePresencia.ts`** (no es componente, pero va aquí porque es de lo
  mismo) — Lo que permitió **sacar framer-motion del proyecto** el 6-ago-2026.
  Resuelve lo único que el CSS no sabe hacer solo: animar algo que se está
  DESMONTANDO. Mantiene el elemento en la página mientras dura la salida y lo
  quita al terminar. Lo usan el carrito y el modal de producto. El porqué y las
  trampas (el temporizador de respaldo, y por qué los cuadros se congelan en
  pestañas ocultas) están en la auditoría de la sección 11.
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
  **EL LOGO LLEVA A `/about`, no a la raíz** (6-ago-2026). La raíz es el
  countdown: mandar ahí a alguien que ya entró es sacarlo del sitio y ponerlo
  otra vez en la puerta. El logo lleva "a casa", y la casa de la marca es su
  página. Apunta al MISMO lugar que `DESTINO` en `app/page.tsx` (a dónde lleva
  ENTRAR): **si se cambia uno hay que cambiar el otro**. La raíz sigue siendo
  los caballos y nada más, a propósito: quien escribe el dominio pelado ve el
  countdown.
  **NOSOTROS NO VA EN LA BARRA.** Se probó junto al logo y se regresó al pie:
  competía con el logo y con el carrito por la misma mirada y no es un enlace
  de esa jerarquía.
- **`dropTag.tsx`** — El sticker "SPECIAL DROP #1", la salida al catálogo desde
  la página de marca. **Va MONTADO A CABALLO en el borde de abajo del navbar**
  —la mayor parte adentro, el resto colgando— y **ladeado**: derecho se leería
  como un botón más de la barra, que es justo lo que no es. Al pasar el cursor
  se endereza un poco y crece. Lo dibuja `components/navbar.tsx`, y se esconde
  solo dentro de `/product`; como el navbar solo existe en el Nosotros y en el
  catálogo, en la práctica sale SOLO en el Nosotros.
  **LAS DOS SE ENCIMAN AL LOGO** por 16 px, sobre aire y no sobre dibujo: así se
  lee como calcomanía pegada encima y no como algo acomodado a un lado. En
  teléfono va en `left-[64px]` y además un poco más arriba (colgando media
  etiqueta se comía demasiada pantalla); en computadora, en `left-[112px]` y
  centrada en el borde. Antes iba en 146, después del logo y sin tocarlo, y se
  veía despegada.
  La inclinación es de **10°** (era 7, y así se leía casi derecha); al pasar el
  cursor se endereza a 5.

  **Dos cosas que ya se probaron y se echaron para atrás**, para no volver a
  proponerlas:
  (1) **suelto, pegado a la pantalla** (fijo, a la derecha y muy abajo de la
  barra): siendo `fixed` se encimaba con lo que iba pasando por detrás del riel
  del Nosotros, y en el panel de museos le caía cerca del titular. Y ojo si se
  reintenta: **no se puede fijar a la pantalla desde dentro de la barra**,
  porque el `backdrop-blur` del navbar hace que un `position: fixed` se
  posicione contra la BARRA y no contra la ventana — habría que dibujarlo desde
  la página.
  (2) **repetirlo cerrando el Nosotros** en lugar del "VER DROP #1" de texto:
  repetido a los pocos segundos de scroll se leía como relleno.

  La imagen sale de `DROP_TAG_IMAGE` (`config/drop.ts`) y **es apaisada**
  (1681 × 936). Se mide POR ALTURA y el ancho lo saca de la imagen, así que
  cambiarla por otra no la deforma, pero sí cambia cuánto ocupa a lo ancho.
  Mientras esa variable esté vacía se dibuja una de respaldo en SVG con los
  colores del tema, para que nunca quede un hueco.
- **`patronDeFondo.tsx`** — **(6-ago-2026)** El fondo del catálogo: los logos de
  la marca repartidos por toda la página, ladeados a distintos ángulos y en
  distintos tamaños, **casi imperceptibles**. La referencia es el papel en el que
  envuelven la comida rápida: uno no lo mira, pero el lugar se siente de la
  marca.
  **SALEN LOS CUATRO LOGOS DE LA MARCA y en la MISMA PROPORCIÓN** (15 de cada
  uno de 60 piezas): la palabra INDEGO, los niños, la estrella y el del
  countdown. Cuatro formas distintas es lo que evita que se lea como una
  cuadrícula. Se reparten POR TURNOS, no al azar — al azar, con 60 piezas, uno
  salía 20 veces y otro 9, y se notaba.
  **LOS CUATRO EN LOS DOS TEMAS.** El color se pide al vuelo con `e_colorize` de
  Cloudinary, que pinta la imagen del color que se le diga respetando la
  transparencia; como los cuatro logos son de un solo color, con eso salen en
  negro y en blanco desde el mismo archivo, sin tener que subir las dos
  versiones. Ver `LOGOS_DE_MARCA` en `config/brand.ts`.
  **CUBRE TODA LA PÁGINA, PIE INCLUIDO**, y se corta donde termina: es
  `absolute` sobre el contenedor de la página, no `fixed` sobre la ventana. Para
  que se vea a través, **el pie ya no lleva fondo propio** (lo pone la página,
  que es del mismo color). Va detrás de todo (`z-0`, con `main` y el pie en
  `relative z-10`).
  **HAY DOS VARIANTES**, y todos los números viven en `VARIANTES` dentro de
  `components/patronDeFondo.tsx`. Se elige con la prop `variante`; cada una trae
  los suyos justamente para que ajustar una no mueva la otra:

  | | `catalogo` | `panel` |
  |---|---|---|
  | Dónde | fondo de toda la página de producto | cintillo arriba de los paneles crema del Nosotros |
  | Reja | 1 columna × 60 renglones | 8 columnas × 4 renglones |
  | Hasta | 100% del alto | 15% |
  | Ancho de pieza | `clamp(90px, 12vw, 200px)` | `clamp(80px, 18cqw, 190px)` |
  | Escala | 0.7 – 1.5 | 0.6 – 1.05 |
  | Pesos emparejados | no | sí |
  | Opacidad claro / oscuro | 0.028 / 0.015 | 0.035 / 0.022 |

  **EL REPARTO ES UNA REJA**, y la forma de la reja es la del hueco que hay que
  llenar: el catálogo es una columna larguísima (por eso 1 × 60), el cintillo de
  un panel es ancho y bajito (8 × 4). Cae una pieza por celda, empujada al azar
  dentro de la suya. Antes el cintillo era una sola hilera con la altura al azar
  y por eso quedaban claros: en cada columna caía UNA pieza a una altura
  cualquiera, así que la parte de hasta arriba salía medio vacía. Con la reja la
  cobertura pasó de 53% a 83%.
  **Las celdas son MÁS CHICAS que las piezas, a propósito**: por eso se encaraman
  unas sobre otras y se ve apachurrado. Las de hasta arriba se cortan con la
  orilla del panel, también a propósito.
  **`hasta` es el CENTRO de la pieza, no su orilla.** Las piezas van centradas en
  su punto, así que la de más abajo se pasa unos puntos de ese número: con 15, el
  cintillo termina cerca del 20% del alto y el texto del bloque más apretado (el
  03) empieza pasando el 30%. Ese margen es el que hay que cuidar al moverlo.
  **El cintillo se mide contra el PANEL (`cqw`), no contra la ventana**, y esto
  era el bug del teléfono ("se ve muy disperso y casi sin logos"): con `vw`, en
  un celular el `clamp` se iba a su mínimo y las piezas quedaban chiquitas y
  perdidas dentro del panel, mientras que en computadora salían al doble. Ahora
  una pieza mide siempre lo mismo EN PROPORCIÓN AL PANEL: medido a 359, 331 y
  300px de panel, la cobertura se queda en 81–85% y el cintillo en 18%.
  **`emparejarPesos` le saca raíz al peso de cada logo.** Los pesos de
  `LOGOS_DE_MARCA` están puestos para que los cuatro se vean del mismo peso
  visual SUELTOS, y ahí la palabra INDEGO sale más del doble de ancha que la
  estrella. En un fondo suelto da igual; en un cintillo apretado hacía las dos
  cosas malas a la vez: la palabra se volvía una plasta de tinta y los otros tres
  quedaban tan chicos que dejaban huecos alrededor. La raíz los acerca sin
  igualarlos.

  **La opacidad es distinta en cada tema**, y no es capricho: sobre el crema del
  tema claro un logo negro al 3.5% apenas se adivina, pero sobre el olivo del
  oscuro el mismo logo en blanco al mismo 3.5% se ve bastante más — el blanco
  contra fondo oscuro pesa más que el negro contra fondo claro.
  **EL CINTILLO DEL NOSOTROS SALIÓ DE UN ACCIDENTE.** Al principio el panel solo
  pedía 14 de las 60 piezas del catálogo; como el reparto iba por franjas de
  arriba abajo, esas 14 cayeron todas juntas en la parte de arriba. Gustó y se
  volvió intencional (de ahí la variante `panel`): arriba el cintillo, abajo aire
  para el texto del bloque. Es lo que hace que ese color se lea como un material
  y no como una mancha; los paneles del color de la página se quedan limpios y
  esa alternancia es el ritmo del recorrido. **El panel de entrada NO lo lleva**,
  aunque también sea crema: ahí ya está la cascada del logo y las dos cosas
  juntas se peleaban.
  > **Las posiciones se calculan con un azar CONTROLADO.** `Math.random()` a
  > secas no sirve: el servidor y el navegador sacarían posiciones distintas y
  > React se quejaría de que el HTML no coincide. El generador arranca siempre
  > de la misma semilla. Y el reparto va POR CELDAS (una pieza por celda de la
  > reja, con un empujón al azar dentro de la suya): al puro azar salen montones
  > y huecos.
  > **El tamaño va en `clamp` y el alto lo saca `aspect-ratio`.** Con píxeles
  > fijos, lo que en computadora era un detallito, en teléfono ocupaba medio
  > ancho de pantalla y las piezas se encimaban.
  > **No es un componente de cliente, a propósito.** El cambio de tema se
  > resuelve poniendo LAS DOS versiones y escondiendo una con CSS
  > (`dark:hidden` / `hidden dark:block`) en vez de preguntarle el tema a
  > JavaScript: así no hay parpadeo al hidratar, y como el navegador no descarga
  > el fondo de un elemento escondido, la versión que no se usa tampoco se baja.
  >
  > **ANTES ERA UNA "LLUVIA"** de la palabra INDEGO en dos columnas pegadas a
  > las orillas. Se cambió porque llenaba los costados pero dejaba el centro
  > pelón: se leía como dos cenefas, no como un fondo.

- **`convocatoria.tsx`** — **"NUESTROS MUSEOS ESTÁN VACÍOS"**, la sección que
  cierra el Nosotros: una puerta abierta para que quien haga algo lo mande y se
  pueda colaborar. Va DESPUÉS de la banda que lleva al catálogo, a propósito —
  la página termina pidiendo algo en vez de vendiendo algo. Formulario de
  nombre, contacto (correo **o** @instagram, por eso no valida formato),
  mensaje y **un adjunto opcional** (JPG/PNG/WEBP/GIF/PDF, hasta 4 MB). Trae
  trampa para robots (un campo escondido que solo ellos llenan) y valida de los
  dos lados. El título y la invitación se editan en `config/convocatoria.ts`,
  que también trae el apagador (`activa: false` y desaparece).
- **`footer.tsx`** — Pie con los enlaces del sitio. **No pinta fondo propio**:
  lo pone la página (siempre es el mismo color), y así la lluvia del catálogo se
  ve a través de él en vez de cortarse en su borde. El orden de los enlaces es a
  propósito:
  primero lo que resuelve un problema (**seguir pedido**), luego **Nosotros** —
  que de todo lo de marca es lo único que alguien busca queriendo— y después
  términos y redes. Contacto e Instagram solo salen si están puestos en
  `config/brand.ts`.
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
- **`pistaDelRiel.tsx`** — **La rayita del Nosotros** (7-ago-2026): el mismo
  trazo, pero de avance del riel entero en vez de saltar entre fotos. Fija abajo
  al centro, con un halo del color de la página para que se lea sobre la cascada
  negra y sobre la banda invertida. No usa estado de React. El detalle completo
  está en la sección del riel de `/about`.
- **`comoRecorrer.tsx`** — **El letrero de cómo recorrer** (7-ago-2026), abajo
  del panel de entrada del Nosotros, sobre vidrio esmerilado, que se desvanece
  al avanzar. Dice "Desliza →" en lo táctil y "Arrastra | Rueda | ←→" en lo que
  tiene cursor. Tampoco usa estado de React. Detalle en la sección del riel.
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
3. Cuando el countdown llega a cero, la home muestra el botón **ENTRAR**, que
   lleva a la **página de marca** (`/about`), y de ahí se pasa a las playeras. Antes de darle, la pantalla se
   funde al color del tema y aparece el manifiesto un momento — el puente entre
   el video y la tienda. Los tres tiempos de esa salida están en `app/page.tsx`
   (`T_CORTINA`, `T_FRASE`, `T_DIFUMINA`).
   Esto se ha ido y vuelto: se probó llevar directo al catálogo y se regresó al
   Nosotros (6-ago-2026), ya que dejó de ser una página de lectura larga y pasó
   a ser un recorrido de lado que se pasa rápido. Es UNA línea (`DESTINO` en
   ese archivo), pero hay que cambiar también el logo del navbar.

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

### La página de Nosotros SE RECORRE HACIA LA DERECHA (6-ago-2026)

Es el cambio más grande que ha tenido esta página: **ya no va hacia abajo**. Los
bloques se ponen en fila y la página mide **exactamente una pantalla de alto**.
Cada bloque de `config/about.ts` es ahora un **panel** del riel.

**Cómo se recorre.** En teléfono, deslizando con el dedo (el navegador ya sabe
hacerlo solo). En computadora hay que traducir la rueda del ratón, que gira en
vertical — eso lo hace un `useEffect` en `app/about/page.tsx`, y respeta tres
cosas para que no se sienta secuestrado:

1. si el gesto ya es horizontal (trackpad, rueda lateral), no toca nada;
2. si el panel bajo el cursor se puede recorrer hacia abajo —el del formulario,
   por ejemplo— primero se recorre ÉSE, y solo al llegar a su tope el giro pasa
   a mover el riel;
3. el detector va con `passive: false`, que es obligatorio para poder cancelar
   el gesto. Sin eso la página pelea consigo misma.

**HAY CUATRO FORMAS DE MOVERLO, no una** (las dos últimas son del 7-ago-2026):

| Forma | Para quién |
|---|---|
| **El dedo** | Teléfono y tabletas. El navegador lo hace solo. |
| **La rueda** | Ratón *y también mousepad*: como el giro vertical se traduce a avance horizontal, dos dedos hacia abajo en un trackpad ya mueve el riel — no hace falta saber el gesto lateral. |
| **Arrastrar con el ratón** | Quien no tiene rueda, y como **pista visual**: el cursor se vuelve una mano (`.riel-arrastrable`), y eso dice "esto se jala" sin dibujar ningún botón. |
| **El teclado** | ←/→, Re Pág/Av Pág e Inicio/Fin. Va en `window`, no en el riel, para que funcione sin tener que picar la página primero — que es justo lo que no se le ocurre a nadie. **No es un `scrollTo` suave**, ver abajo. |

Y **dos avisos** de que hay que moverla, uno por aparato: el **letrero** de cómo
recorrer (los dos) y el **empujoncito** de entrada (solo táctiles). Los dos
tienen su apartado más abajo.

> **POR QUÉ HICIERON FALTA LAS DOS ÚLTIMAS.** Esta página no tiene barra de
> desplazamiento ni ningún control a la vista. En teléfono eso ya lo resuelven
> el empujoncito y la rayita; en computadora no había nada equivalente.

Detalles del arrastre y del teclado que **no hay que romper**:

- **El arrastre es SOLO con ratón** (`pointerType === "mouse"`). En pantalla
  táctil el dedo ya arrastra solo, y meterse en medio nos costaría el
  desplazamiento con inercia del sistema, que es mejor que cualquier cosa que
  escribamos nosotros.
- **Hay un umbral de 6 px** antes de considerarlo arrastre. Sin ese margen, un
  clic con la mano poco firme movería la página y además se comería el clic.
- **EL CLIC QUE VIENE DETRÁS DEL ARRASTRE SE MATA.** Si no, soltar encima de la
  banda del cierre —que es un enlace del tamaño del panel— te manda al catálogo
  cuando lo único que querías era recorrer. Va en fase de captura, con `once`, y
  con un `setTimeout` que lo retira por si se soltó donde no había nada que
  recibiera clic (si no, se quedaría esperando para comerse un clic legítimo).
- **NI EL ARRASTRE NI EL TECLADO ENTRAN EN LOS CAMPOS DEL FORMULARIO**
  (`input, textarea, select, [contenteditable]`). En la convocatoria hay que
  poder seleccionar texto con el ratón, y las flechas e Inicio/Fin tienen que
  mover el cursor de escritura. La misma lista está en el CSS, para que esos
  campos conserven su cursor de escritura en vez de heredar la mano.
- **El teclado NO toma arriba y abajo**, solo izquierda y derecha: el panel del
  formulario se recorre hacia abajo por dentro, y quitarle sus flechas lo
  volvería imposible de llenar con el teclado.

#### El teclado NO usa `scrollTo({behavior:"smooth"})`, y es una corrección

La primera versión lanzaba un desplazamiento suave por cada flechazo. **Se
sentía lento y trabado**, y con razón: al mantener la flecha el sistema repite
la tecla unas treinta veces por segundo, y cada repetición **arrancaba una
animación nueva que pisaba la anterior** antes de terminar. Salía un tirón por
repetición en vez de un movimiento, y mientras más rápido tecleabas, peor.

Lo que hay ahora es **un solo bucle con dos números**: una META y la posición
real, que se acerca a la meta un pedacito por cuadro. Nada reinicia nada.

| | |
|---|---|
| `IMPULSO` 200 px | lo que avanza un toque suelto |
| `VELOCIDAD` 1100 px/s | a qué ritmo corre la meta mientras la tecla sigue apretada |
| `SUAVIZADO` 0.16 | qué fracción de lo que falta se recorre por cuadro de 60 Hz |

La repetición del sistema **no** suma impulso: de eso se encarga `VELOCIDAD`.
Sumarlo sería volver al atropello. Medido: un toque da 200 px exactos; mantenida
medio segundo da 750, que es `200 + 0.5 × 1100`.

> **DOS TRAMPAS QUE YA COSTARON Y ESTÁN TAPADAS:**
>
> 1. **El último tramo se da de una vez.** Acercarse por fracciones hace el paso
>    cada vez más chico; en cuanto baja del píxel el navegador lo redondea a
>    CERO, el riel deja de moverse pero la meta sigue lejos, así que la
>    condición de "ya llegamos" **no se cumple nunca y el bucle gira para
>    siempre** pidiendo cuadros sin mover nada. Se detectó midiendo: "Fin" se
>    quedaba 3 px antes del tope e "Inicio" no llegaba a 0. Cuando el paso ya no
>    alcanza un píxel, se salta lo que falte de golpe.
> 2. **`arrancar()` pregunta por el cuadro pendiente, no solo por `corriendo`.**
>    Son dos cosas distintas —"el teclado manda" y "hay un cuadro en camino"— y
>    confundirlas dejaba un agujero: marcado como corriendo pero sin cuadro, el
>    bucle quedaba muerto y **ninguna tecla lo revivía**.
>
> Comprobado después del arreglo: 200 exactos, tope exacto, 0 exacto, no se pasa
> por la izquierda, y **0 cuadros pedidos con la página quieta** — el bucle sí
> se apaga.

#### El letrero de cómo recorrer (`components/comoRecorrer.tsx`)

Un renglón chico abajo del panel de entrada, sobre vidrio esmerilado, que **se
desvanece conforme se avanza**: a la mitad del panel ya está en cero y se apaga
con `visibility` (a opacidad 0 el `backdrop-filter` se seguiría calculando en
cada cuadro, y es de lo más caro que hay).

Dice **una cosa distinta según el aparato**, y por eso es un componente y no un
texto suelto:

- donde se toca con el dedo → **"Desliza →"**;
- donde hay cursor → **"Arrastra | Rueda | ←→"**, que son las tres formas que de
  verdad funcionan ahí.

Mostrar las dos a la vez sería ruido: leer instrucciones que no aplican hace
dudar de las que sí. La detección es `pointer: coarse` **y no** `pointer: fine`
— pregunta por la precisión del apuntador, no por el ancho: un teléfono en
horizontal y una laptop chica miden casi lo mismo. En una laptop táctil, que
responde a las dos, **gana el cursor**.

**NACE EN LA ESQUINA Y SE DISUELVE** (7-ago-2026). No es una pastilla flotando
en el panel: es un pedazo de la esquina de abajo a la izquierda que está
esmerilado, pegado a los dos bordes, sin esquinas redondeadas. Se difumina hacia
sus dos lados libres —arriba y a la derecha— para que no se lea el rectángulo
antes que el texto.

- **El vidrio va en SU PROPIA CAPA, debajo del texto.** Es lo que permite
  enmascararlo sin borrar las letras: el difuminado se come el desenfoque y el
  tinte por las orillas, pero el texto es hermano suyo y va encima entero.
- **La máscara va en el MISMO elemento que el `backdrop-filter`, nunca en un
  padre**: un padre con máscara crearía una "raíz de fondo" y el desenfoque se
  quedaría sin nada que desenfocar.
- **Son DOS degradados rectos multiplicados** (`mask-composite: intersect`), no
  uno radial desde la esquina. El radial fue el primer intento y **se descartó
  midiendo**: este letrero es un renglón ancho y bajo, y una caída circular
  llega al final del texto mucho antes que al borde de la caja — la máscara
  valía 0.61 justo bajo las últimas letras, o sea que ahí el tinte caía a 0.49 y
  volvía el problema de contraste ya resuelto. Taparlo pedía una caja de casi
  500 px, más ancha que un teléfono. Con dos degradados cada eje se ajusta por
  separado, que es justo lo que hacía falta.
- **El relleno de arriba y de la derecha es MUCHO mayor que el de abajo y la
  izquierda**, y no es por gusto: ahí es donde el vidrio tiene que
  desvanecerse. Sin ese aire el degradado empezaría encima de las letras.
- **Los dos degradados terminan en 100%**, o sea en el borde de la caja. Si
  acabaran antes, el vidrio se cortaría a filo dentro del recuadro — que es
  exactamente lo que se está quitando.
- **EL RECUADRO NO CAMBIA DE TAMAÑO AL CAMBIAR DE IDIOMA.** Se dibujan TODOS los
  idiomas uno encima de otro en la misma celda de una retícula y solo se ve el
  activo; los demás van con `invisible` (`visibility: hidden`), que **no se ve
  pero sigue ocupando su sitio**. Así la celda mide lo que el más ancho —hoy el
  español— y el recuadro se queda quieto. Antes se encogía en inglés, y un
  elemento que se estira al tocar un botón que no tiene nada que ver se lee como
  un fallo.
  > Ojo: con `hidden` de Tailwind (`display: none`) NO ocuparían sitio y
  > volvería el problema. Y **sale del diccionario en vez de un `min-width` a
  > mano**: así una corrección de traducción o un idioma nuevo lo reajustan
  > solos. Los invisibles llevan `aria-hidden` para que un lector de pantalla no
  > lea el aviso en todos los idiomas.
- **El relleno de abajo es el más chico de todos**, a propósito: el renglón se
  veía trepado. La mitad de abajo del recuadro es la parte del vidrio que va
  maciza, así que el texto se centra **en esa mitad** y no en la caja entera,
  que incluye todo el aire del desvanecido.

> **EL TINTE DEL VIDRIO (80%) ESTÁ MEDIDO Y ES EL MÍNIMO.** Empezó en 50% con el
> texto atenuado y sobre una letra maciza de la cascada el contraste caía a
> 3.9:1, corto para diez píxeles. Componiendo los colores reales salieron dos
> cosas: el texto tiene que ir a **fuerza completa** (es lo que más aporta y lo
> que menos cuesta), y **los dos temas fallan por lados opuestos** —en claro la
> cascada es negra y aclara el texto contra ella; en oscuro es blanca y aclara
> la pastilla bajo el texto—, así que el tinte que arreglaba uno dejaba corto el
> otro. 0.80 es el primero que pasa 4.5:1 en AMBOS (claro 5.83, oscuro 4.81).
> **Si se toca, hay que medir sobre la CASCADA en LOS DOS temas**, nunca sobre
> el fondo del panel: ahí da 8:1 y engaña. Y **los primeros números de los dos
> degradados son parte de esa medición**: marcan hasta dónde el vidrio va
> macizo, y ahí es donde vive el texto. Comprobado: la máscara vale 1.000 bajo
> todo el renglón y 0.000 en los dos bordes libres.

#### El empujoncito quedó SOLO para táctiles (7-ago-2026)

En computadora sobraba y se sentía raro: ahí ya están el cursor de mano y el
letrero. **Una página que se mueve sola cuando no la tocaste se lee como un
fallo, no como una invitación.**

#### EN TELÉFONO, EL PANEL DE ENTRADA MIDE LA PANTALLA JUSTA (7-ago-2026)

Es el único panel distinto: `w-full` en teléfono, `md:w-[min(92vw,720px)]` de
ahí para arriba. Los 92vw de los demás dejan asomar un filo del panel siguiente,
y ese filo **era** la pista de que la página seguía de lado. Ya no hace falta
—para eso están el letrero y el empujoncito— y sí estorbaba: la entrada es la
portada, y una portada con una franja de otro color pegada a la orilla se ve
como un descuadre. **Los demás paneles conservan su filo**: ahí ya se entendió
el gesto y el asomo ayuda a seguir.

> **VA `w-full` Y NO `100vw`, a propósito.** El porcentaje se mide contra el
> riel, así que da exactamente lo que se ve; `100vw` incluye el ancho de una
> barra de desplazamiento que aquí no existe y habría dejado el panel unos
> píxeles más ancho que la pantalla — o sea el mismo filo que se está quitando,
> pero al revés. Comprobado: `w-full` cae clavado en el ancho del riel.

Como consecuencia, **el empujoncito es ahora el único momento en que se ve el
panel siguiente**, así que su asomo subió y pasó a medirse **en proporción a la
pantalla** (18%, con topes en 56 y 96 px). Con 56 px fijos el asomo se leía como
un temblor: 56 px son un 14% de un teléfono chico y un 7% de una tableta, o sea
el mismo gesto contando dos cosas distintas.

**Lo que cambió de paso:**

- **Las líneas separadoras giraron 90°**: eran `border-t` entre franjas, ahora
  son `border-l` entre paneles. Las pone el panel, no el bloque.
- **EL PIE DE PÁGINA YA NO ESTÁ** en esta página. Se probó como último panel y
  se quitó: rematar el recorrido con un panel de puros enlaces de servicio le
  quitaba el final a la convocatoria, que es lo que debe cerrar. Los enlaces del
  pie siguen en todas las demás páginas.
- **NINGUNA BARRA DE DESPLAZAMIENTO A LA VISTA.** Salían dos: la del riel y una
  vertical del documento. La vertical no era contenido de más sino aritmética —
  la página mide `h-dvh` pero la barra horizontal se comía ~15 px de ese alto,
  así que sobresalía por quince píxeles. Se resolvieron por separado: el
  desplazamiento del DOCUMENTO se apaga mientras se está en esta página
  (tocando `documentElement` y no `body`, para no pelearse con
  `lib/useScrollLock.ts`), y la del riel se esconde con la clase `.sin-barra`
  de `globals.css`. **Se sigue recorriendo igual**, con el dedo, la rueda o el
  teclado; lo único que no está es la barra gris cruzada abajo.
  > Esa barra era la única pista visual de que la página va de lado, y aquí
  > decía que los paneles cortados en la orilla bastarían. **No bastaban**: en
  > teléfono no se entendía (7-ago-2026). El reemplazo son las dos cosas del
  > punto siguiente. Si algún día se quitan, hay que devolver la barra.
- **CÓMO SE AVISA QUE LA PÁGINA VA DE LADO** (7-ago-2026). Dos piezas que
  trabajan juntas, porque cada una sola se queda corta:
  1. **El empujoncito.** Al llegar, el riel se asoma solo 56 px a la derecha y
     regresa, una sola vez (el `useEffect` del empujón en `app/about/page.tsx`).
     Enseña el gesto haciéndolo, en vez de explicarlo con un letrero — que es lo
     que se quería evitar, porque esta es la única página del sitio sin ningún
     elemento de interfaz. Lleva cuatro candados: **cualquier gesto lo cancela**
     (dedo, rueda o teclado, incluso a media animación — que la página se mueva
     contra la mano se siente descompuesto); **solo arranca desde el principio**
     (si el navegador restauró una posición al volver con "atrás", no la pisa);
     **solo si hay a dónde ir**; y **respeta "reducir movimiento"**. Espera
     900 ms porque la página entra con un fundido de 0.55s y empujar durante el
     fundido se ve como un salto del render.
  2. **La rayita de avance** (`components/pistaDelRiel.tsx`), fija abajo al
     centro. **En teléfono NO está desde el principio** (7-ago-2026): en la
     primera pantalla ya vive el letrero, que ocupa media anchura justo abajo, y
     la rayita cae centrada encima de él — dos avisos apretados en la misma
     esquina se estorban y no se lee ninguno. Se reparten el trabajo **en el
     tiempo, no en el espacio**: el letrero manda en la primera pantalla y se
     apaga a la mitad del panel; la rayita entra justo ahí y llega entera al
     final del panel, o sea cuando aparece el manifiesto. En computadora se
     queda visible siempre, porque ahí el letrero está metido en la esquina de
     una pantalla ancha y la rayita ni lo roza.
     > **El relevo se mide contra el PRIMER PANEL, no contra el recorrido
     > completo.** Tiene que pasar cuando la entrada se va, y ese momento
     > depende del ancho del panel, no de cuántos bloques traiga hoy
     > `config/about.ts`. Con un porcentaje del total, agregar una sección
     > movería el punto de entrada sin que nadie lo pidiera. Es **la misma rayita del catálogo** a propósito: en
     `swipeHint.tsx` ya significa "hay más de este lado", así que repetir el
     trazo es enseñar un vocabulario y no inventar otro adorno. No usa estado de
     React —mueve el nodo directo desde el `scroll`— porque con estado cada
     cuadro de scroll redibujaría los diez paneles para correr una barra de dos
     píxeles.
     > **EL HALO NO ES ADORNO.** La rayita va fija sobre un riel donde por
     > debajo pasa el crema de la página, la cascada de logos NEGRA de la
     > entrada y la banda del cierre INVERTIDA. Una línea de un solo color se
     > borra en alguno de esos. Lleva un `drop-shadow` del color de la página
     > alrededor de un trazo del color de la tinta: sobre el crema manda el
     > trazo y el halo no se ve; sobre lo oscuro el trazo se pierde y el halo
     > toma su lugar. Se resuelve solo en los dos temas porque los dos colores
     > son variables. **NO es `mix-blend-mode`**, que es justo lo que este
     > proyecto le quitó al grano por rendimiento.
- **TODOS LOS PANELES DEL RIEL VAN `relative`, INCLUIDO EL DE ENTRADA.** Al
  entrada le FALTABA y se corrigió el 7-ago-2026, al meterle el letrero. Es lo
  que hace que un hijo `absolute` se mida contra su panel; sin eso se mide
  contra la página entera, el `overflow` del riel ya no lo recorta y el ancho
  del DOCUMENTO se estira hasta donde cae ese panel — que es **exactamente** el
  bug que rompió el sitio en Android. Si agregas un panel, ponle `relative`
  aunque hoy no lleve nada posicionado adentro.
- **LAS PLAYERAS DEL CARRUSEL VAN LIGERAMENTE DESENFOCADAS** (7-ago-2026,
  `--desenfoque-carrusel` en `globals.css`). En foco competían con la frase por
  la atención aunque estuvieran al 16% de opacidad: el ojo se enganchaba a un
  cuello o una manga y se iba a leerlos. Es **un solo número** del que tiran el
  tema claro y el oscuro, para que las dos bandas se parezcan. No cuesta
  cuadros: el filtro se aplica a la tira, el navegador la dibuja desenfocada una
  vez y de ahí solo la desliza. Lo caro sería animar el desenfoque.
- **EL REBOTE DEL RIEL ESTÁ APAGADO** (`overscroll-x-none`, 7-ago-2026). Al
  arrastrar más allá del primer panel, el teléfono estiraba el riel y dejaba ver
  una franja del fondo de la página por la izquierda, como si al diseño le
  faltara un pedazo. **No se arregla pintando ese fondo**: el mismo rebote pasa
  al final del recorrido y allá el último panel es de otro tono, así que no hay
  un solo color que sirva en las dos orillas.
- **EL FONDO DE LOS PANELES SE ALTERNA, uno y uno**: uno lleva el color de la
  página y el siguiente el mismo de la entrada (`bg-surface`). Marca el ritmo
  del recorrido y hace que se note dónde termina un panel y empieza el otro sin
  depender solo de la línea. La cuenta arranca de manera que el primero
  alternado sea el que va **después de "El origen"**, y el manifiesto se queda
  con el fondo de la página — si no, quedaría pegado a la entrada, que ya es
  `bg-surface`, y los dos se leerían como un solo panel gigante. La banda de
  "GO TO DROP #1" queda fuera de la cuenta: es la invertida.
- **Las fotos se miden POR ALTURA, no por proporción sobre el ancho.** Los
  bloques `foto`, `duo` y `video` eran `aspect-*` a todo el ancho de su columna:
  en una página que bajaba eso daba igual, crecía el alto y ya. En el riel el
  panel mide lo que mide la pantalla, así que ese alto se salía y le sacaba una
  barra de desplazamiento AL PANEL. Ahora el alto es un porcentaje del panel
  (siempre cabe) y el ancho lo saca la proporción. **Si tocas esto, el padre
  tiene que llevar `h-full`**: un porcentaje de alto necesita contra qué
  medirse, y sin eso las fotos vuelven a crecer por el ancho.
- **La convocatoria va en DOS PANELES**, y eso también es por el teléfono:
  primero el llamado (titular + invitación) y luego el formulario. Todo junto en
  uno solo cabía en computadora pero no en teléfono, y ahí el panel se tenía que
  recorrer hacia abajo por dentro — o sea que en una página que se recorre de
  lado aparecía un scroll vertical justo al final. Partido, cada mitad cabe en
  su pantalla.
  El formulario lleva el aire más apretado en teléfono (`py-6` y `space-y-6` en
  vez de 8): medido, mide 528 px con ese espaciado y en un iPhone SE el panel
  solo tiene 587. Con el aire de computadora se pasaba por unos píxeles y
  reaparecía el scroll en el aparato más chico.
- **Los bloques sin archivo ya no ocupan lugar.** Antes una foto vacía
  simplemente no ocupaba alto y no se notaba; en el riel reservaba un panel de
  mil píxeles de nada. Ahora se filtran (`tieneContenido`), salvo en
  `npm run dev`, donde se siguen viendo con su recuadro punteado.
- **El ancho de cada panel depende del tipo**: los de leer van angostos (680 px)
  porque una columna de texto ancha se lee mal, y los de ver van anchos
  (1000 px).

**PENDIENTE: el teléfono.** Lo que hay que mirar ahí: si los paneles de 92vw se
sienten bien al deslizar y si el panel del formulario se puede llenar sin pelear
con el riel.

> **EL EMPUJONCITO NO SE PUDO PROBAR AQUÍ** (7-ago-2026). La ventana de Chrome
> automatizada congela `requestAnimationFrame`, y un scroll suave depende justo
> de esos cuadros: el empujón no llegó a moverse ni una vez en la prueba, y al
> insistir se cayó la extensión. **Lo que sí quedó verificado**: los cuatro
> candados se cumplen (hay 3651 px que recorrer en teléfono, arranca en 0,
> "reducir movimiento" apagado), `overscroll-behavior-x` sale en `none`, y la
> rayita se lee sobre la banda invertida — medido en pixeles: 151 el relleno,
> 201 la línea, 222 el fondo. **Falta verlo en un celular de verdad.**

### Llenar la página de Nosotros (`/about`)

> **Por qué NO se parece al catálogo.** La primera versión era la tienda con
> otro texto (mismas bandas invertidas, mismo ancho centrado, mismos títulos
> gigantes) y se leía como copia. Ahora comparte la piel —Helvetica, colores del
> tema, grano— pero tiene su propia composición, la de un dossier y no la de una
> vitrina: **rejilla asimétrica** (etiqueta angosta a la izquierda, contenido a
> la derecha, nunca centrado), **la etiqueta se queda fija** mientras su texto
> pasa de largo, **jerarquía al revés** (títulos chicos y espaciados, párrafos
> grandes: esta página se viene a leer), **secciones numeradas** separadas por
> líneas finas, y **una sola banda invertida** — la de "GO TO DROP #1", que ya
> no cierra la página sino que va pegada al manifiesto. Si se toca el diseño,
> conviene no perder esas cinco cosas: son lo que la distingue.
>
> Ojo con una: la **rejilla asimétrica** y la **etiqueta fija** eran gestos de
> una página que bajaba. Desde que se recorre de lado, la etiqueta ya no tiene
> contra qué quedarse fija (el panel no se mueve por dentro) y la rejilla solo
> sobrevive en los bloques de texto. Es deuda pendiente de esa mudanza, no un
> descuido.

Todo se edita en **`config/about.ts`**; la página (`app/about/page.tsx`) no se
toca. Tres partes:

1. **`ABOUT_PORTADA`** — el panel de entrada, el primero del recorrido:
   - `entrada` — el párrafo debajo del título "Nosotros".
   - `imagen` / `imagenOscuro` — **el LOGO ALTERNO** (la palabra INDEGO), que se
     dibuja **EN CASCADA dentro de ese mismo panel**: dos repeticiones apiladas
     encima del título y otras dos debajo del párrafo, cuatro en total. Pegadas
     entre sí a propósito — es lo que las vuelve cascada y no cuatro logos
     sueltos. Son dos archivos porque el logo es de un solo color: el negro se
     pierde sobre el olivo del tema oscuro igual que el blanco sobre el crema
     del claro, y la página elige según el tema. Las dos URLs llevan `e_trim`,
     que le recorta al archivo el enorme margen transparente que trae (la
     palabra ocupa 345 × 89 de un lienzo de 500 × 500) para que llene el ancho
     en vez de quedar chiquita en medio.
     **LA CASCADA SE SALE DEL PANEL POR LOS TRES LADOS, a propósito**, para que
     se sienta que sigue más allá de lo que se ve: por arriba se pierde bajo el
     navbar, por abajo se va por el borde de la pantalla, y por la izquierda
     arranca fuera del panel — lo primero que se ve es **media "I"**.
     Se dibujan 8 repeticiones por lado y el panel corta las que sobran; el
     texto se queda con su espacio y las cascadas se comen el resto, así que en
     una pantalla alta se ven más y en una bajita menos, pero el título nunca se
     mueve.
     Los cuatro números están arriba de `app/about/page.tsx`:
     `REPETICIONES_DEL_LOGO`, `ALTO_LOGO`, `CORTE_IZQUIERDA` y
     `OPACIDAD_CASCADA`.
     > **`OPACIDAD_CASCADA` (hoy 0.93) es un ajuste fino, no un fondo.** Al 100%
     > la cascada competía con el título "Nosotros", que es lo que tiene que
     > mandar en ese panel; al 85% se pasaba de largo y empezaba a leerse como
     > textura. El 93% la deja un pelín atrás y la mantiene como elemento de la
     > composición.
     > **`ALTO_LOGO` va en PÍXELES, no en porcentaje**, y costó descubrirlo: un
     > porcentaje se mide contra el contenedor de la cascada —que es el que se
     > lleva "lo que sobre" del panel—, así que las repeticiones salían de 32 px
     > en vez de 96, diminutas, y encima cambiaban de tamaño según el largo del
     > texto de al lado. Hoy son 96 px en teléfono y 112 en computadora: en
     > teléfono casi no baja aunque quepan menos, porque achicándola se leía
     > como un patrón de fondo cualquiera en vez de una palabra cortada.
     > **`CORTE_IZQUIERDA` está medido, no a ojo:** a 112 px de alto la palabra
     > mide unos 430 de ancho y la "I" unos 52. Se fue ajustando a la baja: con
     > 4% dejaba un hilito de "I" y arrancaba casi en la "N", con 3% quedaba
     > media letra, y hoy está en 2.5%.
   - **Este panel lleva `bg-surface`**, no el fondo de la página. Es el tono que
     tenía el recuadro donde vivía el logo cuando iba solo; se conservó al
     juntarlos, y de paso separa la entrada del resto del recorrido sin
     necesidad de una línea.
   > Se probó tener el logo en su PROPIO panel, después de la entrada, y se
   > quitó: metido en el panel del título y repetido arriba y abajo, la palabra
   > enmarca en vez de competir, y el recorrido se ahorra una parada.
   **HOY ESA IMAGEN ES EL LOGO ALTERNO** (la palabra INDEGO), no una foto, y por
   eso son DOS: `imagen` (la negra) e `imagenOscuro` (la blanca). El logo es de
   un solo color, así que el negro se pierde sobre el olivo del tema oscuro
   igual que el blanco sobre el crema del claro; la página elige según el tema.
   Si algún día vuelve a ser una foto, se vacía `imagenOscuro` y se usa la misma
   en los dos temas. Las dos URLs llevan `e_trim`, que le recorta al archivo el
   enorme margen transparente que trae (la palabra ocupa 345 × 89 de un lienzo
   de 500 × 500) para que llene el recuadro en vez de quedar chiquita en medio.
2. **`BLOQUES`** — la lista que se pinta en orden (de izquierda a derecha, desde
   que la página se recorre de lado). Agrega, quita o reordena a gusto. Hay
   seis tipos:
   - `manifiesto` — **EL manifiesto de la marca**, el mismo que abre el catálogo
     ("YOU ARE NOT A CONTENT CREATOR / YOU ARE AN ARTIST") y con su misma
     tipografía. **No lleva texto**: lo lee de `config/brand.ts`, que es donde
     vive, así que cambiarlo allá lo cambia en los dos lados. Aquí va sobre el
     fondo del tema y NO invertido — esa carta ya la juega la banda de "GO TO
     DROP #1", y dos bandas invertidas en un mismo recorrido se anulan.
   - `frase` — una cita descolgada, grande, dentro de la columna de contenido.
     **Inglés fijo** (es voz de marca, no interfaz); lo que va entre
     `*asteriscos*` sale en cursiva. Hoy no se usa —el arranque lo tomó el
     manifiesto— pero se queda para meter una cita suelta entre bloques.
   - `texto` — párrafo con título. Este **sí se traduce** (`{ en, es }`).
   - `foto` — una imagen; con `completo: true` va de borde a borde.
   - `duo` — dos fotos al parejo (en el teléfono se apilan).
   - `video` — en bucle y sin sonido, como el del countdown.
3. **`ABOUT_CIERRE`** — lo que dice la banda invertida. Hoy `"GO TO DROP #1"`.
   **La banda ENTERA es el enlace al catálogo**, así que esta frase es lo único
   que se lee ahí y tiene que decir a dónde lleva; antes debajo había además un
   "VER DROP #1" chiquito, que sobraba y se quitó. Inglés fijo, como el
   manifiesto. Vacío = no se muestra la banda.

**LA BANDA DEL CIERRE YA NO CIERRA (6-ago-2026).** Se subió: ahora sale **justo
después de la frase ancla** (el bloque de tipo `frase`), cerca del arranque de
la página. Antes iba al final y quedaba demasiado tarde — para cuando alguien
llegaba, ya había leído todo y el empujón al catálogo aparecía cuando la visita
estaba por terminar. El nombre `ABOUT_CIERRE` se quedó como estaba para no
romper nada.

Su lugar **se calcula por tipo de bloque**, no con un número escrito a mano, así
que reordenar `BLOQUES` no la deja en un lugar absurdo: se pega a la primera
`frase` que encuentre. Si algún día no hubiera ninguna, sale al final, como
antes.

**LA BANDA TRAE UN CARRUSEL DE FONDO**: **tres tiras** con las playeras del
catálogo pasando despacio y en bucle detrás del texto (30 s por vuelta). Lleva
FRENTES Y ESPALDAS revueltos: se toman todas las fotos de todas las prendas y se
acomodan alternando producto, con un orden FIJO —no `Math.random()`, que daría
órdenes distintos en el servidor y en el navegador y React se quejaría de que el
HTML no coincide. Se alimenta de `config/products.ts`, así que si cambian las fotos del drop cambian
solas aquí. Cuatro detalles que importan si se toca:

- **La de en medio va para un lado y las de afuera para el otro**
  (`animation-direction: reverse`, clase `.carrusel-al-reves`). Tres tiras al
  mismo ritmo y en la misma dirección se leen como una sola cosa moviéndose y el
  fondo se aplana; cruzadas se nota que son capas.

- **El bucle no se nota** porque la lista va dos veces y la animación recorre
  exactamente media tira. Para que esa mitad caiga justo en la copia, la
  separación entre piezas va como `pr-*` en CADA pieza y **no** como `gap` en la
  tira: con `gap`, seis piezas dejan cinco huecos y el salto se vería.
- **En tema claro las playeras van aclaradas** (`grayscale` + `brightness`, en
  la clase `.carrusel` de `globals.css`). La banda es olivo oscuro y las tres
  prendas también son oscuras: subir la opacidad no las hacía aparecer, solo las
  volvía una mancha del mismo tono. En tema oscuro la banda es crema y resaltan
  solas, así que ahí va sin filtro.
- **Respeta "menos movimiento"**: si el sistema lo pide, la tira se queda quieta
  pero las playeras siguen ahí.

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

**Ojo con la banda:** manda a `/product`, y antes del drop eso regresa al
countdown a quien no tenga la clave de acceso. Es a propósito, la misma decisión
que en las páginas por producto.

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

### Auditoría de peso y rendimiento (6-ago-2026)

Todo lo de abajo está **medido** sobre el build de producción de ese día, no
estimado. Están ordenados por lo que de verdad cambia, no por lo fácil.

**Casi todo ya se aplicó el mismo día.** Lo que se ganó, en números:

| | Antes | Ahora |
|---|---|---|
| Video del countdown | 5.42 MB | **2.70 MB** |
| Primera carga de `/about` | 192 KB gzip | **153 KB** |
| Primera carga de `/product` | 191 KB | **153 KB** |
| Primera carga de la home | 179 KB | **140 KB** |
| Recorrido home → nosotros → catálogo | bajaba framer-motion **dos veces** | ya no lo baja |

**Lo único que NO se aplicó es el punto 3 (el idioma)**, y por una razón de
peso que solo se vio al probarlo. Está explicado ahí.

**Cómo se midió** (para poder repetirlo): `npm run build`, y luego sumar el
tamaño gzip de los `.js` que cada página pide en su HTML ya generado
(`.next/server/app/*.html`). El video se midió pidiéndolo a Cloudinary con
distintas transformaciones y comparando `size_download`.

**El piso del sitio son 125.7 KB gzip de JavaScript**, iguales en todas las
páginas (React + el router de Next + los proveedores de tema e idioma). Es lo
normal de Next 16 y ahí no hay mucho que rascar. Todo lo interesante está
encima de ese piso.

> **No te asustes con los números crudos.** Hay un chunk de 38.7 KB gzip que
> parece cargarse en todas las páginas: son *polyfills* para navegadores viejos
> y va marcado `noModule`, así que **ningún navegador moderno lo descarga**. No
> cuenta. Si algún día mides y te sale ~165 KB de piso, es que lo estás
> sumando de más.

#### 1. El video del countdown pesaba 5.42 MB — HECHO, ahora pesa la mitad

Es, con muchísima diferencia, lo más pesado del sitio, y es **lo primero que ve
todo el mundo**. Medido contra Cloudinary:

| Cómo se pide | Peso |
|---|---|
| Hoy (`q_auto,vc_h264,w_1280`) | **5.42 MB** |
| `q_auto:eco,vc_h264,w_960` | **2.70 MB** (la mitad) |
| `q_auto,vc_vp9,w_1280` (webm) | 3.43 MB |

Se aplicó `q_auto:eco,vc_h264,w_960` en `DROP_VIDEO` (`config/drop.ts`). El de
webm se descartó: Safari lo reproduce a medias según la versión, y el countdown
en iPhone es el caso que más importa.

> **FALTA VERLO EN UN TELÉFONO.** Esto se midió, no se juzgó a ojo: `q_auto:eco`
> aprieta la calidad y el video es de caballos corriendo, que es justo donde se
> nota. Si se ve feo, lo primero que hay que soltar es `q_auto:eco` (déjalo en
> `q_auto` y quédate con `w_960`, que sigue ahorrando bastante). Está anotado
> también en el comentario de `config/drop.ts`.

#### 2. framer-motion costaba 39 KB gzip por página y viajaba DOS VECES — HECHO, ya no está

Es lo más caro del JavaScript. Y está **duplicado**: hay dos copias distintas del
mismo paquete, una para la home y otra para el resto. Un recorrido normal
(countdown → Nosotros → catálogo) descarga **78 KB gzip de la misma librería**.

Se usa para exactamente **tres cosas**, y las tres son transiciones de entrada y
salida que el CSS hace solo:

| Dónde | Qué anima |
|---|---|
| `app/page.tsx` | la cortina de salida y el manifiesto que se desenfoca |
| `components/cartDrawer.tsx` | el fondo que se oscurece y el cajón que entra de lado |
| `components/productModal.tsx` | el fondo y el panel que aparece creciendo |

**CÓMO QUEDÓ.** Lo único que framer resolvía gratis es **animar algo que se está
desmontando** (`AnimatePresence`): cuando un elemento desaparece del árbol, ya
no hay a qué aplicarle una transición. Eso ahora lo hace **`lib/usePresencia.ts`**,
un enganche de ~30 líneas que mantiene el elemento montado el tiempo que dura la
salida y lo quita al terminar. El carrito y el modal lo usan; la cortina de la
home no lo necesita, porque solo entra (para cuando termina, ya se cambió de
página) y le bastan unos `@keyframes` en `globals.css`.

**Ya había precedente:** `components/reveal.tsx` hacía esto mismo con framer y se
pasó a CSS justo porque se sentía pesado al scrollear en iPhone.

> **Lo que se aprendió haciéndolo, y por qué `usePresencia` trae un temporizador
> de respaldo:** para que una transición de CSS corra, el navegador tiene que
> haber pintado ANTES el estado apagado, y eso normalmente se consigue esperando
> dos cuadros (`requestAnimationFrame`). Pero **los navegadores CONGELAN los
> cuadros cuando la pestaña no se está viendo** — comprobado: en una pestaña
> oculta `requestAnimationFrame` no dispara ni en medio segundo. Sin respaldo,
> algo que se abriera con la pestaña en segundo plano quedaría montado pero
> invisible para siempre. Por eso hay además un `setTimeout` de 80 ms: gana el
> que llegue primero y los dos terminan en el mismo lugar.
>
> Ese mismo congelamiento es la razón de que **la animación no se pueda
> comprobar con el navegador automatizado**: se puede verificar que las clases
> cambian y que el elemento se monta y se desmonta cuando debe (eso sí se
> probó), pero el movimiento en sí hay que verlo con los ojos.

#### 3. El idioma parpadea, y Google solo ve el sitio en inglés — SE PROBÓ Y SE ECHÓ PARA ATRÁS

`lib/i18n/context.tsx` arranca **siempre** en inglés y corrige después de
hidratar, leyendo `localStorage`. Eso trae tres cosas:

1. Quien eligió español **ve la página en inglés un instante** y luego cambia.
2. El HTML que sirve el servidor está siempre en inglés, así que **el buscador
   nunca ve la versión en español**.
3. El `<html lang>` inicial dice `en` aunque el texto acabe en español (el
   contexto lo corrige después, pero el HTML servido ya salió mal).

**El arreglo obvio** era guardar el idioma en una **cookie** en vez de
`localStorage` y leerla en `app/layout.tsx`, que es de servidor.

**SE IMPLEMENTÓ, SE MIDIÓ Y SE REVIRTIÓ.** Leer una cookie en el layout raíz
**vuelve DINÁMICAS todas las páginas del sitio**: en el build, las diez páginas
que hoy salen como `○` (HTML estático, servido desde la red de Vercel sin
ejecutar nada) pasaron todas a `ƒ` (se arman en un servidor en cada visita).

No vale la pena, y menos ahora: el día del drop es justo cuando llega el pico de
tráfico y cuando más importa que las páginas salgan de la caché y no de una
función. Se cambiaba un parpadeo de medio segundo por perder el HTML estático en
el peor momento posible.

**Queda pendiente, con la salida buena identificada:** si algún día importa de
verdad, la forma correcta es **rutas por idioma** (`/es/...` y `/en/...`) con el
proxy redirigiendo según la cookie. Así hay dos versiones estáticas en vez de
una dinámica: se arregla el parpadeo Y el SEO **sin** perder el HTML estático.
Es más trabajo, pero es el único camino que no cambia una cosa por otra.

Mientras tanto: el `<html lang>` sí se corrige después de hidratar
(`lib/i18n/context.tsx` lo hace), así que un lector de pantalla acaba con el
idioma bueno; lo que queda mal es el HTML inicial que ve el buscador.

#### 4. Dos dependencias que no usaba nadie — HECHO, fuera

- **`@stripe/stripe-js`** — cero imports. El pago no lo hace el navegador: el
  servidor crea la sesión y se redirige a la URL que devuelve Stripe.
- **`next-cloudinary`** — cero imports. Las fotos se piden con URLs armadas a
  mano (el helper `foto()` de `config/products.ts`), que es más simple.

**OJO, esto NO adelgazó el sitio:** como nadie las importaba, nunca llegaron al
navegador. Lo que se ganó es instalación más ligera, menos superficie de
supply chain y documentación que deja de mentir — porque de paso se descubrió
que **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` tampoco la usa nadie**, aunque la
sección 4 la listaba como necesaria. Esa tabla ya quedó corregida; la variable
se puede borrar de Vercel cuando quieras.

#### 5. Restos que había que barrer — HECHO

- **`png.pngtree.com` en `next.config.ts`** — un host de imágenes de relleno que
  quedó de las pruebas. Mientras estuviera en `remotePatterns`, el optimizador
  de Next aceptaba traer y servir cualquier imagen de ese dominio. Quitado.
- **`public/` tenía los 5 SVG del starter de Next** (`file`, `globe`, `next`,
  `vercel`, `window`). Borrados; la carpeta quedó vacía.

#### 6. El grano se abarató — HECHO

Lo caro de verdad —`mix-blend-mode` y los `backdrop-filter`— ya se quitó, y eso
está bien. Lo que queda es que la textura la dibuja un filtro `feTurbulence`
sobre un rectángulo **del tamaño completo de la pantalla**: rasterizar eso una
vez a resolución de teléfono no es gratis, y se vuelve a rasterizar cada vez que
alguien gira el aparato.

**Cómo quedó:** el ruido se genera **una sola vez en un cuadrito de 256 px** y
se repite como `background-image` (`stitchTiles="stitch"` es lo que hace que las
orillas empaten y no se note la cuadrícula). El `<svg>` desapareció de la
página: `components/grain.tsx` ahora solo dibuja un `<div class="grain">` y todo
el filtro vive dentro de la clase, en `globals.css`.

> Comprobado en el **build de producción**, no en `npm run dev`: el servidor de
> desarrollo puede quedarse una edición atrás con el CSS y hacerte creer que no
> aplicó. Si vuelves a tocar esta clase y "no pasa nada", levanta
> `npm run build && npx next start` antes de perseguir un fantasma.

#### 7. Cosas que parecen problema y no lo son

Anotadas para que nadie las "arregle" pensando que urgen:

- **Los logos del navbar se piden a Cloudinary sin `f_auto,q_auto`** (18 KB y
  7 KB en crudo). Da igual: pasan por `/_next/image`, que los vuelve a optimizar
  antes de mandarlos. El navegador no paga de más; lo único que cambia es un
  poco de trabajo del optimizador la primera vez.
- **Los dos diccionarios (inglés y español) viajan siempre**, completos: 5.4 KB
  gzip. Partirlos costaría más complejidad de lo que ahorra.
- **Todas las `<Image>` con `fill` ya traen su `sizes`.** Revisadas una por una;
  no hay ninguna sirviendo una foto más grande de la que cabe.
- **En el CSS ya compilado vas a ver `filter: blur()`, sin número.** No está
  roto: el argumento de `blur()` es opcional y vale 0, y el minificador lo
  acorta. Comprobado en el navegador — `blur()` se calcula como `blur(0px)`.

#### 8. Segunda pasada, con el recorrido horizontal ya puesto (6-ago-2026)

Revisión de responsividad y peso después de voltear el Nosotros. Lo medido:

**EL BUG GORDO: EL CELULAR ACOSTADO.** En horizontal un teléfono deja ~310 px
de alto útil (390 menos el navbar), y **cuatro paneles no caben ahí**: el
manifiesto (316 px), "a dónde vamos" (378), el llamado de museos (568) y el
formulario (512).

El problema no era que no cupieran —para eso los paneles se recorren— sino que
un `items-center` normal, cuando el contenido es más alto que su caja, **lo
desborda por ARRIBA y por abajo en partes iguales, y lo de arriba queda
inalcanzable**: no se puede scrollear hacia atrás del inicio. O sea que en
horizontal se comía el principio de los textos y no había forma de leerlo.

Arreglado con **alineación segura** (`items-center-safe` /
`justify-center-safe`, de Tailwind 4.1+): centra mientras quepa y, en cuanto no
cabe, se pega arriba y deja que el panel se recorra normal. Comprobado a 390 y
a 360 px de alto: ya no queda nada atrapado.

> De paso: el panel del llamado de museos tenía **dos contenedores de scroll
> anidados** (el panel y su sección). El de adentro se quedaba con el
> desbordamiento y el de afuera nunca se enteraba de que había más contenido —
> que es justo lo que consulta la rueda del ratón para decidir si recorre el
> panel o el riel. Se dejó uno solo.

**EL ICONO DE LA PESTAÑA.** Era la estrella de Indego **casi blanca sobre
transparente**: en una barra de pestañas clara, invisible.

Se probó ponerle fondo olivo. Se veía en todos lados, pero en el conmutador de
pestañas de **Safari en iPhone** quedaba como un cuadrito verde que no dice nada
de la marca, así que se descartó.

La solución final: **la estrella sin fondo, en DOS versiones** —blanca y negra—
y el navegador elige según su interfaz (`prefers-color-scheme`, declarado en
`metadata.icons` de `app/layout.tsx`). Los archivos están en `public/`
(`icono-oscuro.png` e `icono-claro.png`), 6 y 14 KB.

> Ya NO se usa `app/icon.png`, que es la forma automática de Next: esa solo
> admite UNA imagen y aquí hacen falta dos. La versión OSCURA va PRIMERO en la
> lista a propósito: un navegador que ignore el `media` se queda con la primera,
> y esa es la que se ve bien en el caso que originó el cambio.

**LO QUE SE REVISÓ Y ESTÁ BIEN:**

- Los anchos de panel usan `min(92vw, …)`, así que ningún panel se pasa del
  ancho de la pantalla por angosta que sea.
- La lluvia del catálogo es `hidden md:block`, así que su `w-[240px]` fijo nunca
  toca el teléfono.
- El JS por página casi no se movió con todo lo nuevo: `/about` 28.7 KB gzip
  sobre el piso (era 27.7) y `/product` 27.1 (era 26.9).

**UNA COSA QUE SE ACEPTÓ A SABIENDAS:** la lluvia del catálogo dibuja las DOS
versiones del logo y esconde una con CSS, así que el navegador se baja una
imagen que no se ve (~10 KB). Es el precio de no tener que preguntarle el tema a
JavaScript, que traía parpadeo al hidratar. Son dos URLs repetidas 44 veces, así
que el navegador las descarga UNA vez cada una, no 88.

#### 9. EL BUG DE ANDROID, y por qué era el mismo de las dos barras

**Reportado el 6-ago-2026** (S23 y S26 Ultra, Chrome y Edge): entrando al
Nosotros después de un "atrás" del navegador, la página salía **encogida y
desplazada hasta el fondo, en blanco**. Había que alejar el zoom y subir a mano
para ver algo.

**LA CAUSA, y es la misma que la de las dos barras en computadora:** el
DOCUMENTO se volvía recorrible en horizontal. El riel del Nosotros se le
escapaba al recorte y `<html>` acababa midiendo miles de píxeles de ancho. De
ahí salían los dos síntomas:

- en computadora, una barra horizontal que se comía 15 px de alto y obligaba a
  una segunda barra, vertical;
- en Android, el navegador **encoge la página** para que quepa un documento más
  ancho que la pantalla — y encima conservaba la posición de scroll de la página
  anterior al volver con "atrás".

**EL ARREGLO:** `overflow-x: clip` en `html, body` (`globals.css`, arriba del
todo, con la explicación completa). Y el Nosotros se pone en cero al montar,
para no heredar posiciones de la página anterior.

> **NO USAR `hidden` PARA ESTO.** Es lo primero que uno escribe y fue lo primero
> que se hizo — mal. `hidden` CREA un contenedor de scroll (solo que sin
> barras), así que el navegador sigue guardando y restaurando una posición, que
> es justo lo que hay que evitar; además rompe `position: sticky` en los hijos.
> `clip` recorta y ya.

##### 9-bis. LO QUE DE VERDAD LO CAUSABA: un input invisible a 8 300 px

**El arreglo de arriba NO bastó**, y el 6-ago-2026 el usuario dio con el síntoma
que faltaba: en la vista responsiva de Chrome **la barra de arriba se iba hasta
la derecha y la página quedaba metida en la esquina izquierda**, con más página
abajo y a la derecha. En iPhone no pasaba, por eso se había escapado.

**LA CAUSA, medida:** en el Nosotros, `document.documentElement.scrollWidth`
daba **8 348 px** con una ventana de 396. El culpable era **UN SOLO ELEMENTO**:
el `<input type="file" name="archivo">` del formulario de la convocatoria, que
va con la clase `sr-only` — y `sr-only` es `position: absolute`.

Ese input **no tenía ningún ancestro posicionado**, así que su bloque contenedor
terminaba siendo el de la página. Y ahí está la trampa: **el `overflow` de un
elemento solo recorta a los descendientes que lo tienen en su cadena de bloques
contenedores.** Como el input se medía contra la página y no contra el panel, el
`overflow-x: auto` del riel **no lo recortaba**: quedaba dibujado en su posición
natural —8 347 px a la derecha, que es donde cae el panel de la convocatoria
dentro del riel— y estiraba el ancho del DOCUMENTO hasta allá.

De ahí salía todo lo demás: Chrome de Android, al ver un documento de 8 300 px,
encoge la página entera para que quepa; la barra es `fixed w-full`, o sea 100%
del ancho del documento, así que se estiraba con él y se iba hasta la derecha.

> **`overflow-x: clip` no salva de esto**, y por eso el arreglo anterior no
> alcanzó: lo que se le escapa al recorte no es un hijo que se desborda, es un
> elemento que ni siquiera está midiéndose contra ese contenedor.

**EL ARREGLO:** `relative` en el `<div>` que envuelve ese input
(`components/convocatoria.tsx`) — con eso el bloque contenedor vuelve a ser el
panel y el riel sí lo recorta. Y de red, `relative` en TODOS los paneles del
riel (`app/about/page.tsx`), aunque hoy no tengan nada posicionado adentro, para
que el próximo `absolute` que alguien meta ahí no vuelva a fugarse.

**Medido después:** en las cinco páginas (`/`, `/about`, `/product`,
`/product/idg-01`, `/track`) el desborde horizontal es **0** y `window.scrollTo`
en horizontal ya no mueve nada. Cero elementos posicionados contra la página que
caigan fuera de la pantalla.

> **CÓMO CAZARLO SI VUELVE.** Sale en dos líneas en la consola: comparar
> `documentElement.scrollWidth` con `clientWidth` y, si no cuadran, listar los
> `position: absolute` cuyo `offsetParent` sea `body` o `null` — esos son los
> que se miden contra la página. El culpable salta por su `left`.

#### 10. LOS SEIS `set-state-in-effect`, y por qué eran el mismo

**Cerrado el 6-ago-2026.** `npx eslint` marcaba **seis errores**, todos de la
misma regla (`react-hooks/set-state-in-effect`) y casi todos la misma idea
escrita seis veces: *"esto no lo sé hasta estar en el navegador"*.

```
app/page.tsx            components/langToggle.tsx    components/themeToggle.tsx
components/navbar.tsx   components/countdown.tsx     lib/i18n/context.tsx
```

El patrón repetido era `useState(false)` + `useEffect(() => setMontado(true))`.
Funcionaba, pero dibujaba dos veces cada vez que alguien entraba: React pintaba,
el efecto cambiaba el estado, React volvía a pintar.

**LA HERRAMIENTA CORRECTA ERA `useSyncExternalStore`**, que es justo para esto:
se le dan dos respuestas —la del servidor y la del cliente— y resuelve el cambio
sin pasar por un efecto. Quedó en tres piezas:

- **`lib/useMontado.ts`** — el hook compartido. Sustituye el patrón en `navbar`,
  `themeToggle`, `langToggle` y `app/page.tsx`.
- **`lib/i18n/almacen.ts`** — el idioma dejó de ser un `useState` y ahora vive en
  `localStorage`, con el proveedor leyéndolo. **De pilón se sincroniza entre
  pestañas**: cambiar el idioma en una lo cambia en todas, cosa que antes no
  pasaba hasta recargar.
- **`components/countdown.tsx`** — el reloj también es un almacén externo: la
  hora no vive en React, cambia sola. El aviso de "llegó a cero" (`onComplete`)
  SÍ se quedó en un efecto, porque toca algo de fuera del componente, y eso no
  se puede hacer mientras React dibuja.

> **LA COPIA EN MEMORIA NO ES OPCIONAL**, ni en el idioma ni en el reloj.
> `useSyncExternalStore` exige que leer dos veces seguidas, sin que nada haya
> cambiado, devuelva EXACTAMENTE el mismo valor. Devolver un objeto nuevo cada
> vez —que es lo que hace `calculateTimeLeft()`— mete a React en un ciclo
> infinito de dibujados. Por eso el reloj guarda el último valor y solo
> recalcula cuando cambió el SEGUNDO.

**Comprobado en el navegador después del cambio:** el contador avanza, el idioma
cambia y se guarda (y le pone el `lang` al `<html>`), el tema cambia, el carrito
agrega y persiste, y no sale ni un aviso de hidratación en la consola.

#### 11. Lo que queda pendiente de esta auditoría

- **El idioma** (punto 3), por la vía de rutas `/es` y `/en`.
- ~~**`npm audit`: quedan 3 altas, y las tres piden `next@16.3.0`.**~~
  **HECHO el 7-ago-2026: `npm audit` da 0.** Se subió a `next@16.3.0` y
  `eslint-config-next@16.3.0` (desde 16.1.6), y con eso se cerraron las tres
  altas de Next —las que este manual había decidido no tocar el 6-ago porque
  ninguna era alcanzable con esta configuración (no hay `rewrites`, el disco lo
  maneja Vercel, y `sharp` solo toca assets propios de Cloudinary). La decisión
  de aquel día fue "no el día del despliegue, sin nadie que lo pruebe"; se
  esperó y se hizo con calma.
  Los avisos que quedaban después de subir **no eran de Next**: `brace-expansion`,
  `flatted`, `js-yaml`, `picomatch` y `@babel/core`, todos del andamio de ESLint
  y Babel, o sea **dependencias de desarrollo que no llegan al navegador**. Se
  cerraron con `npm audit fix` a secas (sin `--force`, sin cambios de mayor).
  > **Falta probar a mano** el catálogo, el carrito y el pago sobre esta
  > versión. El `npm run build` pasa limpio y `npx eslint .` no da nada, pero
  > eso no es lo mismo que una compra de prueba.
  > **Regla nueva de la 16.3** que salió al subir:
  > `no-location-assign-relative-destination`. Marcó el
  > `window.location.href` del cierre de sesión del panel
  > (`app/idg-hq-9f2a/page.tsx`). **Se dejó como estaba, con un
  > `eslint-disable` explicado**: ahí la navegación dura es justo lo que se
  > quiere, porque tira el árbol de React y con él lo que el panel tuviera en
  > memoria. Importará más cuando el panel muestre ventas.
  > **`next dev` de la 16.3 escribe solo un `AGENTS.md` y un `CLAUDE.md`** en la
  > raíz, con instrucciones para agentes de IA. **Están en el `.gitignore`**: no
  > son del proyecto y se regeneran cada vez que se levanta el servidor, así que
  > trackearlas solo ensuciaría el historial. La documentación de este proyecto
  > es este manual.
- **EL AZUL DEL AUTOCOMPLETADO YA NO SE VE** (7-ago-2026, `globals.css`). Cuando
  el navegador rellenaba un campo guardado le pintaba encima SU fondo —azul
  claro en Chrome— y en un formulario de campos transparentes con una línea
  abajo se veía como si el diseño se hubiera roto. **Ese fondo no se puede pisar
  con `background-color`**: el navegador lo pone con `!important` desde su hoja.
  Hay que rodearlo, y van las dos formas conocidas juntas: `background-clip:
  text` lo recorta a la silueta de las letras, y un retraso absurdo en la
  transición de `background-color` hace que no llegue nunca. Los otros dos
  tiempos de la transición están escritos a mano **para no perder la del borde
  al enfocar**, que es la que da la sensación de que el campo responde.
- **Dos `<img>` a pelo en `components/dropIntro.tsx`**, con su
  `eslint-disable`. Ya está explicado en el propio archivo: se miden en `cqw`
  contra el lienzo del video y `next/image` necesita el tamaño de antemano.
  > Ojo con "optimizar" el logo ovalado del cierre: se midió y pedirle
  > `f_auto,q_auto,w_400` a Cloudinary lo deja en **16 KB contra los 12 KB del
  > original**. Es un PNG chico de un solo color, ya está en su mejor forma. La
  > estrella sí gana (7 → 4 KB) y esa sí las lleva.

### Antes de abrir la tienda

- **Fecha real del drop** (`DROP_DATE`), hoy placeholder 1-sep-2026.
- **Stripe en modo LIVE** + activar **OXXO** + webhook live.
- **Rellenar `/terms`** (textos entre `[corchetes]`, en los dos idiomas).
- **Revisar ANDROID.** La causa de fondo ya se encontró y se arregló (ver 9-bis:
  era el input `sr-only` de la convocatoria estirando el documento a 8 348 px),
  pero se midió en Chrome de escritorio, NO en un Android real. Falta
  confirmarlo en el aparato. Ahí es donde más
  suele romperse un scroll horizontal: la barra del navegador que aparece y
  desaparece cambiando el alto real de la ventana (`dvh`), el gesto de "atrás"
  desde el borde que compite con el deslizar de lado, y el teclado al abrir el
  formulario de la convocatoria.
- ⚠️ **`MOSTRAR_HUECOS` de vuelta en `false`** (`config/about.ts`). Está en
  `true` a propósito y de forma TEMPORAL, para poder ver la forma del recorrido
  de Nosotros con sus paneles de foto en el sitio desplegado mientras llegan las
  fotos de verdad. Si se queda así, los clientes van a ver recuadros punteados
  que dicen "[Foto de detalle]".
- **Variables de entorno en Vercel** (STRIPE, NEXT_PUBLIC_URL, ADMIN_PASSWORD,
  y **CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET** para la convocatoria).
- **Probar la convocatoria de punta a punta** (6-ago-2026): se probó todo el
  camino —formulario, validaciones, trampa de robots, límite de intentos y el
  aviso de error con el Linktree— **menos la subida real a Cloudinary**, que no
  se pudo correr porque las llaves todavía no están puestas. En cuanto estén,
  mandar un envío de prueba con adjunto y confirmar que aparecen el `.txt` y el
  archivo en la carpeta `indego-convocatoria`.

### ⚠️ EL REPO ES PÚBLICO — la decisión pendiente antes del lanzamiento

`github.com/charliram93-png/indegomain` está **en público**. Se planteó el
6-ago-2026 quitar todos los comentarios del código y dejarlos solo en este
manual, o bien poner el repo en privado. **No son dos formas de lo mismo**, así
que aquí queda el debate con lo que se midió.

#### El dato que decide casi todo

**Los comentarios NO se publican con el sitio.** `next build` los borra: se
comprobó buscándolos dentro de `.next/static/chunks/*.js` y no aparece ni uno.
Quien entra a indegostudio.com **no puede leerlos por ningún medio**.

O sea que la única puerta por la que se ven es **el repo de GitHub**. Y esa
puerta se cierra con un botón.

#### Opción A — Quitar los comentarios, repo sigue público

| A favor | En contra |
|---|---|
| Nadie lee las decisiones internas al pasar por el repo | **No resuelve casi nada**: lo delicado no son los comentarios, es el CÓDIGO, y ese se queda igual de visible |
| | Se pierde el "por qué" pegado a la línea, que es lo que evita que alguien "arregle" algo que estaba así a propósito. Este manual guarda las decisiones, pero no puede estar al lado de cada línea |
| | Es trabajo manual, se hace una vez y se vuelve a ensuciar al primer cambio |
| | Da **falsa sensación de seguridad**: el repo sigue enseñando la ruta del panel, el nombre del campo trampa, los límites de intentos y toda la lógica de negocio |

#### Opción B — Poner el repo en privado

| A favor | En contra |
|---|---|
| Cierra **todo** de golpe: comentarios, lógica, historial, y lo que se llegue a subir mañana | Se pierde el repo como escaparate (si algún día sirviera de portafolio) |
| Gratis, un clic, y **se puede deshacer** cuando sea | Hay que dar acceso a mano a quien colabore |
| Los comentarios se quedan, que es lo que hace mantenible el proyecto | Vercel sigue desplegando igual — **no se rompe nada** |

#### Recomendación

**La B, y las dos cosas no se suman.** Poner el repo en privado y **quedarse con
los comentarios**. Quitarlos con el repo público es pagar el precio caro (perder
la memoria del proyecto) por el beneficio chico (que no se lean unos textos que,
de todas formas, van junto a un código que sí se sigue viendo).

Si algún día el repo tiene que volver a público, **eso** es el momento de
revisar qué dicen los comentarios — no antes.

#### Lo que hay que hacer aunque el repo se ponga en privado

Esto no depende de la visibilidad y ya está resuelto, pero conviene volver a
comprobarlo antes de abrir:

- **Ningún secreto escrito en el código.** Comprobado el 6-ago-2026: no hay
  `sk_live`, `sk_test`, `whsec_` ni contraseñas a mano. Todo va por variables de
  entorno y `.gitignore` ya excluye `.env*`.
- **La clave de vista previa fuera del código** (se sacó el 1-ago-2026,
  justamente porque el repo es público).
- **`PANEL_PATH` (`/idg-hq-9f2a`) es seguridad por oscuridad y nada más.** Con
  el repo público no es secreto para nadie. Lo que de verdad protege el panel es
  la contraseña, y esa ya vive en una variable de entorno.

### Siguiente etapa técnica

- **Lo que quedó pendiente de la auditoría de peso** (sección de arriba,
  6-ago-2026): las rutas por idioma (`/es` y `/en`) y la actualización de Next
  que cierra las alertas de `sharp`. El resto ya se aplicó ese mismo día.
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
