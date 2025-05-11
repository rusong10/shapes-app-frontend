import { Shape } from "./shapes";

export interface ShapesTableProps {
    data: Shape[] | undefined;
    isAdmin?: boolean;
    onEdit?: (shape: Shape) => void;
    onDelete?: (id: number) => void;
    isSubmitting?: boolean;
    isLoading?: boolean;
}