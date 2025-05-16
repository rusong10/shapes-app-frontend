const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default Object.freeze({
    LOGIN: `${API_BASE_URL}/api/accounts/login/`,
    LOGOUT: `${API_BASE_URL}/api/accounts/logout/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/accounts/token/refresh/`,
    TOKEN_VERIFY: `${API_BASE_URL}/api/accounts/token/verify/`,
    SHAPES: `${API_BASE_URL}/api/shapes/`,
    SHAPE_BY_ID: (id: number) => `${API_BASE_URL}/api/shapes/${id}/`
});
