export interface Shape {
    id: number;
    name: string;
    shape: "circle" | "square" | "triangle";
    color: string;
    created_at: string;
    updated_at: string;
}

export interface ShapeField {
    name: string;
    shape: "circle" | "square" | "triangle";
    color: string;
}