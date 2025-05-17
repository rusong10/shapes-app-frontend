import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createShape, deleteShape, getShapes, updateShape } from "@/utils/api";
import { APIResponse, CreateShapeResult, Shape, ShapeForm, UpdateShapeResult } from "@/lib/types/types";

export interface MutationError {
    detail: string;
    status: number;
}

export const useShapes = () => {
    return useQuery<Shape[], Error>({
        queryKey: ["shapes"],
        queryFn: async () => {
            const response = await getShapes()

            if (response.status !== 200) {
                throw new Error(response.detail);
            }

            if (!response.shapes) {
                throw new Error("No shapes found in response");
            }

            return response.shapes;
        }
    });
};

export const useCreateShape = () => {
    const queryClient = useQueryClient();
    return useMutation<APIResponse<CreateShapeResult>, MutationError, { data: ShapeForm }>({
        mutationFn: ({ data }) => createShape(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
            queryClient.invalidateQueries({ queryKey: ["shapes"] });
        },
        onError: (error) => {
            console.error("Error creating shape:", error.detail);
        },
    });
};

export const useUpdateShape = () => {
    const queryClient = useQueryClient();
    return useMutation<APIResponse<UpdateShapeResult>, MutationError, { id: number; data: Partial<ShapeForm>; }>({
        mutationFn: ({ id, data }) => updateShape(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
            queryClient.invalidateQueries({ queryKey: ["shapes"] });
        },
        onError: (error) => {
            console.error("Error updating shape:", error.detail);
        },
    });
};

export const useDeleteShape = () => {
    const queryClient = useQueryClient();
    return useMutation<APIResponse, MutationError, { id: number }>({
        mutationFn: ({ id }) => deleteShape(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
            queryClient.invalidateQueries({ queryKey: ["shapes"] });
        },
        onError: (error) => {
            console.error("Error deleting shape:", error.detail);
        },
    });
};
