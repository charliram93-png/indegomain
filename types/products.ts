export type SizeStock = {
  size: string;
  stock: number; // unidades disponibles; 0 = agotado
};

export type Product = {
  slug: string;
  name: string;
  images: string[]; // 1 o más fotos (frente, espalda, detalle…). La 1ª es la principal.
  price: number; // precio unitario en MXN (pesos, sin centavos)
  sizes: SizeStock[];
  description?: { en: string; es: string }; // texto corto bilingüe opcional
};

export type CartItem = {
  id: string; // slug + talla, identifica la línea del carrito
  slug: string;
  name: string;
  image: string;
  price: number; // MXN unitario
  size: string;
  quantity: number;
};

/** ¿Todas las tallas están agotadas? */
export const isSoldOut = (p: Product) => p.sizes.every((s) => s.stock <= 0);
