import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {

  const auth = request.headers.get("authorization")

  const valid =
    "Basic " + Buffer.from("admin:drop123").toString("base64")

  if (auth !== valid) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/product/:path*", "/test-landing/:path*"],
}