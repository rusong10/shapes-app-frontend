import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value;

    if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login" && !accessToken) {
        return NextResponse.redirect(new URL("/admin/login", request.nextUrl))
    }

    if (request.nextUrl.pathname === ("/admin/login") && accessToken) {
        return NextResponse.redirect(new URL("/admin", request.nextUrl))
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
};