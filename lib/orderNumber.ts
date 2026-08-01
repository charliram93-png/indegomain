/**
 * NÚMERO DE PEDIDO
 * ----------------
 * Un código corto que el cliente pueda leer por teléfono o teclear sin
 * equivocarse: `IDG-4F7K2P`.
 *
 * Stripe ya le pone un identificador a cada compra, pero se ve así:
 * `cs_test_a1B2c3D4e5F6...` — imposible de dictar. Por eso se genera este
 * aparte y se guarda EN el pago de Stripe (en su `metadata`), que hoy es la
 * única "base de datos" que hay. Cuando exista Supabase, este mismo número se
 * vuelve la llave de la tabla de órdenes y no hay que cambiar nada de cara al
 * cliente.
 *
 * El alfabeto NO tiene O, 0, I, 1 ni L: son las que la gente confunde al
 * dictar o al teclear. Quedan 31 símbolos y 6 posiciones, o sea unos 900
 * millones de combinaciones — de sobra para que dos pedidos no choquen.
 */

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LARGO = 6;

export const PREFIJO = "IDG-";

/**
 * Genera un número de pedido nuevo. Solo se usa en el servidor.
 *
 * Se descartan los bytes que caen en la "cola" (los últimos 256 % 31) en vez
 * de usar el residuo a secas: con el residuo, las primeras letras del alfabeto
 * saldrían un poco más seguido que las últimas. No es que importe para un
 * número de pedido, pero tirar el byte y pedir otro sale igual de barato.
 */
export function generarNumeroPedido(): string {
  const limite = 256 - (256 % ALFABETO.length);
  let codigo = "";

  while (codigo.length < LARGO) {
    const bytes = new Uint8Array(LARGO);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < limite && codigo.length < LARGO) {
        codigo += ALFABETO[b % ALFABETO.length];
      }
    }
  }

  return PREFIJO + codigo;
}

/**
 * Limpia lo que el cliente escribió y confirma que TIENE FORMA de número de
 * pedido. Devuelve `null` si no.
 *
 * Perdona lo que suele pasar al copiar y pegar: minúsculas, espacios de más y
 * que se les olvide el "IDG-". Lo que NO perdona es cualquier otro carácter:
 * este valor termina metido en una consulta a Stripe, así que se deja pasar
 * solo el alfabeto de arriba y nada más.
 */
export function normalizarNumeroPedido(entrada: string): string | null {
  const limpio = entrada.trim().toUpperCase().replace(/\s+/g, "");
  const sinPrefijo = limpio.startsWith(PREFIJO)
    ? limpio.slice(PREFIJO.length)
    : limpio;

  if (sinPrefijo.length !== LARGO) return null;
  for (const c of sinPrefijo) if (!ALFABETO.includes(c)) return null;

  return PREFIJO + sinPrefijo;
}
