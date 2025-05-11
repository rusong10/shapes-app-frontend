const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default Object.freeze({
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/auth/token/refresh/`,
    TOKEN_VERIFY: `${API_BASE_URL}/api/auth/token/verify/`,
    SHAPES: `${API_BASE_URL}/api/shapes/`,
    SHAPE_BY_ID: (id: number) => `${API_BASE_URL}/api/shapes/${id}/`
});
