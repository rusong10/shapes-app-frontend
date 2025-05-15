import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FetchAPIResponse, Shape, ShapeField } from "@/lib/types";
import * as shapeService from "@/services/shapes";

interface MutationError {
    message: string;
    details?: string | null;
    status?: number;
}

export const useShapes = () => {
    return useQuery<Shape[], Error>({
        queryKey: ["shapes"],
        queryFn: async () => {
            const response = await shapeService.getShapes()
            if (!response.success || !response.data) {
                throw new Error(response.error as string);
            }
            return response.data;
        }
    });
};

export const useCreateShape = () => {
    const queryClient = useQueryClient();
    return useMutation<FetchAPIResponse<Shape>, MutationError, { data: ShapeField; token: string | null }>({
        mutationFn: ({ data, token }) => shapeService.createShape(data, token),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
                queryClient.invalidateQueries({ queryKey: ["shapes"] });
            } else {
                console.error("Create shape reported success false in onSuccess:", response.error);
            }
        },
        onError: (error) => {
            console.error(`Error creating shape: ${error.message}`, error.details);
        },
    });
};

export const useUpdateShape = () => {
    const queryClient = useQueryClient();
    return useMutation<FetchAPIResponse<Shape>, MutationError, { id: number; data: Partial<ShapeField>; token: string | null }>({
        mutationFn: ({ id, data, token }) => shapeService.updateShape(id, data, token),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
                queryClient.invalidateQueries({ queryKey: ["shapes"] });
            }
        },
        onError: (error) => {
            console.error(`Error updating shape: ${error.message}`, error.details);
        },
    });
};

export const useDeleteShape = () => {
    const queryClient = useQueryClient();
    return useMutation<FetchAPIResponse<null>, MutationError, { id: number; token: string | null }>({
        mutationFn: ({ id, token }) => shapeService.deleteShape(id, token),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ["adminShapes"] });
                queryClient.invalidateQueries({ queryKey: ["shapes"] });
            }
        },
        onError: (error) => {
            console.error(`Error deleting shape: ${error.message}`, error.details);
        },
    });
};
