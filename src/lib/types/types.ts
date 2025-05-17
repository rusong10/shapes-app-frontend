export type APIResponse<T = object> = {
    status: number;
    detail: string;
} & Partial<T>;

export interface AdminUser {
    id: number;
    username: string;
    is_staff: boolean;
}

export interface LoginResult {
    access: string;
    user: AdminUser;
}

export interface RefreshTokenResult {
    access: string;
}

export interface MeResult {
    user: AdminUser;
}

export interface Shape {
    id: number;
    name: string;
    shape: "circle" | "square" | "triangle";
    color: string;
    created_at: string;
    updated_at: string;
}

export interface ShapeForm {
    name: string;
    shape: "circle" | "square" | "triangle";
    color: string;
}

export interface GetShapesResult {
    shapes: Shape[];
}

export interface CreateShapeResult {
    shape: Shape;
}

export interface UpdateShapeResult {
    shape: Shape;
}

export interface LoginCredentials {
    username: string;
    password: string;
}