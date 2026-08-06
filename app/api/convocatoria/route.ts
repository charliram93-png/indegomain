import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { CONVOCATORIA } from "@/config/convocatoria";

/**
 * LA CONVOCATORIA — recibe lo que manda la gente
 * ----------------------------------------------
 * Ver `config/convocatoria.ts` para el porqué del diseño. En corto: hoy no hay
 * base de datos ni servicio de correo, así que el buzón es CLOUDINARY, que ya
 * está en uso para las fotos.
 *
 * CADA ENVÍO DEJA:
 *   · un `.txt` con nombre, contacto y mensaje — este es el registro, y existe
 *     SIEMPRE, aunque no hayan adjuntado nada;
 *   · el archivo adjunto, si lo hubo, con el MISMO nombre base para que en la
 *     Media Library queden pegados uno junto al otro.
 *
 * Los dos van con los mismos `context` (nombre/contacto) y la etiqueta
 * `convocatoria`, así se pueden filtrar desde Cloudinary.
 *
 * SIN LLAVES NO HAY BUZÓN. Si faltan `CLOUDINARY_API_KEY` o
 * `CLOUDINARY_API_SECRET` esto responde 503 y la página ofrece el Linktree.
 * Es la falla segura: preferimos decir "no se pudo" a tragarnos el envío de
 * alguien y que crea que llegó.
 */

export const runtime = "nodejs";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "dij60ghdf";

/** ¿Están puestas las llaves? Se revisa en cada llamada, no al importar. */
function configurado(): boolean {
  return Boolean(
    process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

let listo = false;
function configurar() {
  if (listo) return;
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  listo = true;
}

/*
  FRENO CONTRA SPAM. Igual que en `app/api/order/route.ts`: vive en la memoria
  del servidor, se pierde en cada despliegue y no se comparte entre instancias.
  Es un tope tosco, no una defensa seria — el día que esto reciba spam de
  verdad hace falta algo con estado compartido (o un captcha).
*/
const intentos = new Map<string, { n: number; desde: number }>();
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;

function demasiadosIntentos(ip: string): boolean {
  const ahora = Date.now();
  const registro = intentos.get(ip);

  if (!registro || ahora - registro.desde > VENTANA_MS) {
    intentos.set(ip, { n: 1, desde: ahora });
    if (intentos.size > 5000) {
      for (const [k, v] of intentos) {
        if (ahora - v.desde > VENTANA_MS) intentos.delete(k);
      }
    }
    return false;
  }

  registro.n += 1;
  return registro.n > MAX_POR_VENTANA;
}

/**
 * Deja un valor listo para viajar como `context` de Cloudinary: TODO EN UN
 * RENGLÓN y recortado.
 *
 * El `context` es una lista `clave=valor|clave=valor`. Los `=` y `|` que traiga
 * el texto los escapa el propio SDK, pero los SALTOS DE LÍNEA no: un mensaje de
 * varios párrafos deja el metadato ilegible en la Media Library. Por eso aquí
 * se aplasta todo a un renglón.
 *
 * Nada se pierde por recortar: el mensaje completo, con sus saltos de línea, va
 * en el `.txt` que se sube aparte.
 */
function paraContexto(valor: string, max = 400): string {
  return valor.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Nombre de archivo legible y sin sorpresas: solo letras, números y guiones. */
function slug(valor: string): string {
  return (
    valor
      .normalize("NFD")
      // `NFD` separa cada letra acentuada en letra + acento suelto, y esto
      // borra los acentos sueltos: "Muñoz" -> "munoz", no "mu-oz".
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "anonimo"
  );
}

/** `20260806-1712` — para que la carpeta se lea en orden cronológico. */
function sello(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(
    d.getHours()
  )}${p(d.getMinutes())}`;
}

/** Sube un buffer a Cloudinary. El SDK solo trae callbacks, esto lo vuelve promesa. */
function subir(
  buffer: Buffer,
  opciones: Record<string, unknown>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opciones, (error, res) => {
      if (error || !res) reject(error ?? new Error("Cloudinary no devolvió nada"));
      else resolve(res);
    });
    stream.end(buffer);
  });
}

const malaPeticion = (motivo: string) =>
  NextResponse.json({ error: motivo }, { status: 400 });

export async function POST(request: Request) {
  if (!CONVOCATORIA.activa) {
    return NextResponse.json({ error: "cerrada" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";

  if (demasiadosIntentos(ip)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return malaPeticion("form_invalida");
  }

  /*
    TRAMPA PARA ROBOTS. El campo `sitio` está escondido con CSS, o sea que una
    persona nunca lo ve ni lo llena; los robots que rellenan todo lo que
    encuentran, sí. Si viene con algo, se responde 200 como si todo hubiera
    salido bien —para no enseñarle al robot dónde falló— y no se guarda nada.
  */
  if (String(form.get("sitio") ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const nombre = String(form.get("nombre") ?? "").trim();
  const contacto = String(form.get("contacto") ?? "").trim();
  const mensaje = String(form.get("mensaje") ?? "").trim();

  if (!nombre || !contacto || !mensaje) return malaPeticion("faltan_campos");
  if (nombre.length > 120 || contacto.length > 200 || mensaje.length > 4000) {
    return malaPeticion("muy_largo");
  }

  // El archivo es OPCIONAL. Un input vacío llega como un File de 0 bytes.
  const crudo = form.get("archivo");
  const archivo = crudo instanceof File && crudo.size > 0 ? crudo : null;

  if (archivo) {
    const permitidos: readonly string[] = CONVOCATORIA.formatos;
    if (!permitidos.includes(archivo.type)) return malaPeticion("formato");
    if (archivo.size > CONVOCATORIA.maxMB * 1024 * 1024) {
      return malaPeticion("muy_pesado");
    }
  }

  if (!configurado()) {
    console.error(
      "Convocatoria: faltan CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET."
    );
    return NextResponse.json({ error: "sin_buzon" }, { status: 503 });
  }
  configurar();

  const base = `${sello()}-${slug(nombre)}`;
  const contexto = {
    nombre: paraContexto(nombre, 120),
    contacto: paraContexto(contacto, 200),
    mensaje: paraContexto(mensaje, 900),
  };
  const comunes = {
    folder: CONVOCATORIA.carpeta,
    tags: ["convocatoria"],
    context: contexto,
    // Que no reescriba un envío anterior si dos personas se llaman igual y
    // escriben en el mismo minuto: Cloudinary le pega un sufijo al nombre.
    unique_filename: true,
    overwrite: false,
  };

  try {
    // 1. El registro en texto. Va SIEMPRE, y lleva el mensaje COMPLETO (el
    //    `context` va recortado a 900 caracteres, aquí no se pierde nada).
    const texto = [
      `Fecha:    ${new Date().toISOString()}`,
      `Nombre:   ${nombre}`,
      `Contacto: ${contacto}`,
      `Adjunto:  ${archivo ? archivo.name : "(ninguno)"}`,
      "",
      mensaje,
      "",
    ].join("\n");

    await subir(Buffer.from(texto, "utf8"), {
      ...comunes,
      resource_type: "raw",
      public_id: `${base}.txt`,
    });

    // 2. El adjunto, si lo hubo. Mismo nombre base para que queden juntos.
    if (archivo) {
      const buffer = Buffer.from(await archivo.arrayBuffer());
      await subir(buffer, {
        ...comunes,
        // `auto` deja que Cloudinary decida entre imagen y archivo crudo: un
        // PDF no es una imagen y con `image` fijo se rechazaría.
        resource_type: "auto",
        public_id: base,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    // El detalle se queda del lado del servidor: al visitante solo le sirve
    // saber que no se pudo y por dónde más escribirnos.
    console.error(
      "Convocatoria:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "fallo" }, { status: 502 });
  }
}
