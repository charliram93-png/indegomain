/**
 * La Helvetica del sitio.
 *
 * `--font-helvetica` la carga `app/layout.tsx` (TeX Gyre Heros, clon libre de
 * Helvetica). Detrás quedan las de sistema por si algo fallara.
 *
 * Se aplica al CONTENEDOR de cada bloque y se hereda hacia adentro, así no hay
 * que repetirla en cada texto.
 */
export const HELVETICA =
  'var(--font-helvetica), "Helvetica Neue", Helvetica, Arial, sans-serif';
