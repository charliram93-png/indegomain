/**
 * Autenticación simple del panel de administración.
 * La cookie guarda un hash de la contraseña (no la contraseña en claro).
 * Funciona igual en el runtime de Node (API routes) y en edge (proxy).
 */

export const ADMIN_COOKIE = "admin_auth";

/**
 * Ruta secreta del panel (para que no sea adivinable con /panel o /admin).
 * Para cambiarla: edita este valor, el `matcher` en proxy.ts, y renombra la
 * carpeta app/idg-hq-9f2a/ para que coincida.
 */
export const PANEL_PATH = "/idg-hq-9f2a";

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
