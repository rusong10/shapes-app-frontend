import Cookies from "js-cookie";

interface JWTResult {
    token_type: string;
    exp: number;
    iat: number;
    jti: string;
    user_id: number;
}

export function decodeJWT(token: string): JWTResult {
    const result = JSON.parse(atob(token.split('.')[1]))
    return result;
}

export function setAccessTokenCookie(token: string) {
    const decoded = decodeJWT(token);
    const expires = new Date(decoded.exp * 1000);

    Cookies.set("access_token", token, {
        path: "/admin",
        secure: false,
        sameSite: "lax",
        expires: expires
    });
}

export function removeAccessTokenCookie() {
    Cookies.remove("access_token", { path: "/admin" });
}

export function getAccessTokenCookie() {
    return Cookies.get("access_token");
}
