import React, { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

// custom components
import { Shape, ShapesTableProps } from "@/lib/types";
import ShapesIcon from "./ShapesIcon";

// shadcn
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function ShapesTable({
    data = [],
    isAdmin = false,
    onEdit,
    onDelete,
    isSubmitting = false,
    isLoading = false
}: ShapesTableProps) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    const baseColumns: ColumnDef<Shape>[] = [
        // Name column
        {
            accessorKey: "name",
            header: "Name",
        },
        // Shape & Color column
        {
            id: "shapecolor",
            header: "Shape & Color",
            cell: ({ row }) => {
                const shape = row.original;
                return <ShapesIcon shape={shape.shape} color={shape.color} />;
            },
        },
        // Timestamp column
        {
            id: "timestamp",
            header: "Timestamp",
            cell: ({ row }) => {
                const shape = row.original;
                const createdDate = new Date(shape.created_at);
                const updatedDate = new Date(shape.updated_at);

                // Check if the shape was updated (with a small threshold to account for initial creation)
                const thresholdMilliseconds = 1000; // 1 second
                const isUpdated = Math.abs(updatedDate.getTime() - createdDate.getTime()) > thresholdMilliseconds;

                // Use updated date if available, otherwise use created date
                const dateToShow = isUpdated ? updatedDate : createdDate;
                const formattedDate = dateToShow.toLocaleString();

                return (
                    <span>
                        {formattedDate}
                        {isUpdated && <span className="text-xs text-muted-foreground ml-1">(edited)</span>}
                    </span>
                );
            },
        },
    ];

    // Add actions column for admin view
    const adminColumns: ColumnDef<Shape>[] = [
        ...baseColumns,
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const shape = row.original;

                return (
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {/* Edit button */}
                                <DropdownMenuItem onClick={() => onEdit && onEdit(shape)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {/* Delete button */}
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete confirmation dialog */}
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the shape named "{shape.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete && onDelete(shape.id)}
                                    disabled={isSubmitting}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isSubmitting ? 'Deleting...' : 'Yes, delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        },
    ];

    const columns = isAdmin ? adminColumns : baseColumns;

    // Table setup
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    if (isLoading) {
        return (
            <div className="w-full py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No shapes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Only show pagination if we have data */}
            {(data?.length || 0) > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            data?.length || 0
                        )}{" "}
                        of {data?.length || 0} entries
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}