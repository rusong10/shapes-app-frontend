import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
    const accessToken = req.cookies.get("accessToken")?.value;
    return !!accessToken;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const loggedIn = isAuthenticated(req);

    if (pathname === "/login" && loggedIn) {
        return NextResponse.redirect(new URL("/admin/shapes", req.url));
    }

    if (
        pathname.startsWith("/admin") &&
        pathname !== "/login" &&
        !loggedIn
    ) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/admin/:path*"],
};
