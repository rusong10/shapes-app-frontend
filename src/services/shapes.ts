import api from "@/config/api";
import { FetchAPI } from "@/utils/fetchAPI";
import { FetchAPIResponse, Shape, ShapeField } from "@/lib/types";

export const getShapes = (): Promise<FetchAPIResponse<Shape[]>> => {
    return FetchAPI({
        url: api.SHAPES,
        method: "GET",
    });
};

export const createShape = (data: ShapeField, token: string | null): Promise<FetchAPIResponse<Shape>> => {
    return FetchAPI<Shape>({
        url: api.SHAPES,
        method: "POST",
        body: data,
        token: token,
        requiresAuth: true,
    });
};

export const updateShape = (id: number, data: Partial<ShapeField>, token: string | null): Promise<FetchAPIResponse<Shape>> => {
    return FetchAPI<Shape>({
        url: api.SHAPE_BY_ID(id), // e.g., `/shapes/${id}/`
        method: "PATCH", // Or PUT
        body: data,
        token: token,
        requiresAuth: true,
    });
};

export const deleteShape = (id: number, token: string | null): Promise<FetchAPIResponse<null>> => {
    return FetchAPI<null>({
        url: api.SHAPE_BY_ID(id),
        method: "DELETE",
        token: token,
        requiresAuth: true,
        requiresCSRF: true,
    });
};
