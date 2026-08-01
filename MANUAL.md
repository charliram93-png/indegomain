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
│   ├── manifesto.tsx        # el corte tipográfico que cierra el catálogo
│   ├── navbar.tsx           # barra superior con logo, idioma, tema y bolsa
│   ├── footer.tsx           # pie de página
│   ├── productCard.tsx      # fila editorial del catálogo (imagen + nombre grande)
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
  - `DROP_NAME`: nombre que se muestra ("DROP #1").
  - `DROP_ACCESS_KEY`: clave para probar la tienda antes de tiempo.
  - `DROP_VIDEO` / `DROP_POSTER`: video de fondo del countdown y su imagen de
    respaldo (ambos en Cloudinary).
  - `isDropOpen()`: función que dice si el drop ya abrió.
- **`config/products.ts`** — El catálogo. Cada producto tiene `slug`, `name`,
  `image`, `price` (en pesos) y `sizes` (tallas con su `stock`).
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
- **`product/page.tsx`** — La tienda. Lee el catálogo de `config/products.ts` y
  pinta las tarjetas. Aquí se montan el Navbar, el CartDrawer y el Footer.
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
- **`manifesto.tsx`** — El corte tipográfico que cierra el catálogo: "YOU ARE
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
  subtotal y botón para pagar.
- **`themeProvider.tsx`** — Envuelve la app para dar modo claro/oscuro (sigue el
  sistema por defecto).
- **`themeToggle.tsx`** — Botón sol/luna que alterna claro/oscuro.
- **`themeColorSync.tsx`** — Sincroniza el `<meta theme-color>` con el tema para
  que la barra del navegador (iOS) cambie de color al cambiar de tema.

### Modo claro / oscuro (temas)

- El tema sigue la preferencia del dispositivo por defecto; el botón sol/luna
  (en el navbar y en la home) lo cambia a mano.
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
`config/products.ts` → en `images`, agrega más URLs de Cloudinary:
`images: [frente, espalda, detalle]`.

### Cambiar la clave de acceso de preview
`config/drop.ts` → `DROP_ACCESS_KEY`. En producción, mejor ponla como variable de
entorno `DROP_ACCESS_KEY` en Vercel.

### Poner el correo de contacto y el Instagram
`config/brand.ts` → `CONTACT_EMAIL` e `INSTAGRAM_URL`. Mientras estén vacíos, el
footer simplemente no muestra esos enlaces; en cuanto los llenes, aparecen solos.

### Ajustar el grano de película
`app/globals.css` → clase `.grain`, la propiedad `opacity` (hoy `0.1`). Es una
textura que genera el navegador con un `<svg>` que vive en `app/layout.tsx`, así
que no pesa nada. Pasando de ~0.15 empieza a comerse el contraste del texto.

### La Helvetica del countdown
El video original está tipografiado en **Helvetica**. Windows y Android no la
traen y el navegador caía en Arial, que se ve casi igual pero tiene la **G sin
espolón** y la **R de pierna recta** — se notaba. Por eso `app/layout.tsx` carga
**TeX Gyre Heros**, un clon libre de Helvetica (licencia GUST), desde
`app/fonts/heros-*.woff2`. Están recortadas a los caracteres que usa el sitio:
pesan ~9 KB cada una, ~38 KB las cuatro (normal, negritas y sus itálicas).

Se usa con la variable `--font-helvetica` en `dropIntro.tsx` y `countdown.tsx`.
Si algún día se compra la licencia de la Helvetica real, basta reemplazar los
cuatro archivos de `app/fonts/` y no hay que tocar nada más.

### Cambiar la fuente
`app/layout.tsx` → cambia el import y el componente de `next/font/google`
(actualmente `Saira_Semi_Condensed`, **temporal**). Ej.: para volver a la de
antes, usa `Inter_Tight`. La variable CSS `--font-inter` se mantiene, así que no
hay que tocar nada más.

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

**Diseño / contenido:**
- **Fuente definitiva** — Saira Semi Condensed es temporal; definir con el equipo.
- **Assets reales a Cloudinary** — logos oficiales (negro y blanco → reemplazar
  `LOGO_DARK`/`LOGO_LIGHT` en `navbar.tsx`) y fotos reales de playeras
  (frente/espalda → `config/products.ts`).
- **Video en escritorio** — decidir si va con zoom (`object-cover`, actual) o
  completo con franjas (`object-contain`).
- **`theme-color` en iOS** — aún puede tardar un instante en repintar la barra al
  cambiar tema; es una limitación conocida de Safari.

**Antes de abrir la tienda:**
- **Fecha real del drop** (`DROP_DATE`), hoy placeholder 1-sep-2026.
- **Stripe en modo LIVE** + activar **OXXO** + webhook live.
- **Rellenar `/terms`** (textos entre `[corchetes]`).

**Siguiente etapa técnica:**
- **Base de datos (Supabase) + correos (Resend)** — guardar órdenes, descontar
  stock automático y confirmar por correo. Mostrar ventas/stock en el panel.
- **Tarifa de envío** — definir (gratis en el precio o tarifa plana).
- **Meses sin intereses (MSI)** — evaluar tras el primer drop.

---

_Última actualización de este manual: julio 2026._
