import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sha256 } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;

  // Error genérico y discreto para AMBOS casos (contraseña incorrecta o panel sin
  // configurar), para no revelar el estado interno a quien intente entrar.
  if (!expected || !password || password !== expected) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  const token = await sha256(expected);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}
