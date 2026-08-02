import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDropOpen, DROP_ACCESS_KEY } from "@/config/drop";
import { ADMIN_COOKIE, PANEL_PATH, sha256 } from "@/lib/adminAuth";

const ACCESS_COOKIE = "drop_access";
const PREVIEW_COOKIE = "drop_preview";

/**
 * Candado de la tienda (antes "middleware", ahora "proxy" en Next 16):
 *  - Si el drop ya abrió (fecha alcanzada) -> acceso público.
 *  - Si no ha abierto -> solo entra quien tenga la clave de prueba.
 *    Comparte: /product?access=TU_CLAVE  (se guarda en cookie por dispositivo).
 *  - Sin clave y con el drop cerrado -> se manda al countdown en la home.
 *
 * La verificación de fecha es del lado del servidor, así que NO se puede
 * burlar cambiando el reloj del navegador.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- PANEL DE ADMINISTRACIÓN (ruta secreta) ---
  // Siempre protegido con login (independiente de la fecha del drop).
  if (pathname.startsWith(PANEL_PATH)) {
    if (pathname === `${PANEL_PATH}/login`) return NextResponse.next();
    const adminPass = process.env.ADMIN_PASSWORD;
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    if (adminPass && cookie && cookie === (await sha256(adminPass))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(`${PANEL_PATH}/login`, request.url));
  }

  /*
    --- LIMPIEZA DE COOKIES VIEJAS (la home) ---
    La home NO se protege; aquí solo se BORRAN las cookies de acceso que ya no
    valen, por ejemplo después de rotar la clave.

    Por qué hace falta: son DOS cookies distintas. `drop_access` es la que da
    el acceso de verdad, y `drop_preview` solo le dice a la home que muestre el
    enlace de "Entrar (preview)". Al cambiar la clave, la primera deja de servir
    sola... pero la segunda no, así que a quien ya había entrado le seguía
    saliendo el enlace: le daba clic, la pantalla se fundía al color del tema
    (se quedaba en verde) y el candado lo regresaba al countdown. Un callejón.

    Limpiando las dos aquí, el enlace simplemente ya no aparece.
  */
  if (pathname === "/") {
    const acceso = request.cookies.get(ACCESS_COOKIE)?.value;
    const preview = request.cookies.get(PREVIEW_COOKIE)?.value;
    const sigueValiendo = !!DROP_ACCESS_KEY && acceso === DROP_ACCESS_KEY;

    if (!sigueValiendo && (acceso || preview)) {
      const res = NextResponse.next();
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(PREVIEW_COOKIE);
      return res;
    }
    return NextResponse.next();
  }

  // --- CANDADO DE LA TIENDA (/product) ---
  // 1. Drop abierto al público: pasa cualquiera.
  if (isDropOpen()) {
    return NextResponse.next();
  }

  /*
    Si no hay clave configurada (`DROP_ACCESS_KEY` en las variables de entorno),
    el acceso anticipado queda APAGADO y todos ven el countdown. Es la falla
    segura, y evita que un valor vacío accidental deje entrar a cualquiera.
    Ver la nota en `config/drop.ts`: el repositorio es público, la clave no
    puede vivir en el código.
  */
  if (!DROP_ACCESS_KEY) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. ¿Trae la clave en la URL? Se guarda en cookie y se limpia la URL.
  const key = request.nextUrl.searchParams.get("access");
  if (key && key === DROP_ACCESS_KEY) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access");
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(ACCESS_COOKIE, DROP_ACCESS_KEY, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    // Cookie legible por el cliente: la home la usa para mostrar la
    // entrada de "preview" a quien ya desbloqueó (no es secreta ni da acceso;
    // el acceso real lo valida ACCESS_COOKIE arriba).
    res.cookies.set(PREVIEW_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  // 3. ¿Ya tiene la cookie de acceso de un intento previo?
  if (request.cookies.get(ACCESS_COOKIE)?.value === DROP_ACCESS_KEY) {
    return NextResponse.next();
  }

  // 4. Drop cerrado y sin acceso -> al countdown, y de paso se tiran las
  //    cookies que ya no valen (misma razón que la limpieza de la home).
  const fuera = NextResponse.redirect(new URL("/", request.url));
  fuera.cookies.delete(ACCESS_COOKIE);
  fuera.cookies.delete(PREVIEW_COOKIE);
  return fuera;
}

export const config = {
  // OJO: si cambias PANEL_PATH en lib/adminAuth.ts, actualiza también este
  // matcher (debe ser un literal) y renombra la carpeta app/idg-hq-9f2a/.
  //
  // La home ("/") entra aquí NO para protegerla —es pública— sino para poder
  // borrar cookies de acceso vencidas antes de que se pinte el countdown.
  matcher: ["/", "/product/:path*", "/idg-hq-9f2a/:path*"],
};
