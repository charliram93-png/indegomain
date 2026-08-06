import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
      DE DÓNDE SE ACEPTAN IMÁGENES. Esta lista es un permiso, no una
      configuración de adorno: `/_next/image` va a traer y servir CUALQUIER
      imagen de los dominios que estén aquí, así que solo deben estar los que
      se usan de verdad.

      Se quitó `png.pngtree.com` (6-ago-2026): era un banco de imágenes que se
      usó de relleno mientras no había fotos, y ya no queda ninguna. Mientras
      estuvo en la lista, el optimizador aceptaba servir lo que fuera de ahí.
    */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;