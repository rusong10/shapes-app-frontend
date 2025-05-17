"use client"

import React, { useCallback, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

// custom components
import { useAuth } from "@/context/AuthContext"
import { MutationError, useCreateShape, useDeleteShape, useShapes, useUpdateShape } from "@/hooks/useShapes";

// shadcn
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Shape, ShapeForm } from "@/lib/types/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShapesTable } from "@/components/ShapesTable";
import { useShapesSocket } from "@/hooks/useShapesSocket";

export default function AdminDashboard() {
    const { logout } = useAuth()
    const { data: shapes, isLoading } = useShapes();
    const { } = useShapesSocket(!!shapes);

    const [selectedShape, setSelectedShape] = useState<number | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ShapeForm>({
        defaultValues: {
            name: "",
            shape: "circle",
            color: "#CECECE",
        }
    });

    const createShape = useCreateShape();
    const updateShape = useUpdateShape();
    const deleteShape = useDeleteShape();

    const handleOpenEditDialog = (data: Shape) => {
        setFormError(null);
        setIsEditDialogOpen(true);
        setSelectedShape(data.id);
        reset(data)
    };

    const handleOpenCreateDialog = useCallback(() => {
        setFormError(null);
        reset({
            name: "",
            shape: "circle",
            color: "#000000",
        });
        setIsCreateDialogOpen(true);
    }, [reset]);

    const handleCreateShape: SubmitHandler<ShapeForm> = async (data: ShapeForm) => {
        setLoading(true);
        setFormError(null);

        try {
            await createShape.mutateAsync({ data });
            setIsCreateDialogOpen(false);
        } catch (error) {
            if (typeof error === "object" && error && "detail" in error) {
                setFormError((error as MutationError).detail);
            } else {
                setFormError("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditShape: SubmitHandler<ShapeForm> = async (data: ShapeForm) => {
        setLoading(true);
        setFormError(null);

        if (!selectedShape) {
            return
        }

        try {
            await updateShape.mutateAsync({ id: selectedShape, data: data });
            setIsEditDialogOpen(false);
        } catch (error) {
            if (typeof error === "object" && error && "detail" in error) {
                setFormError((error as MutationError).detail);
            } else {
                setFormError("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteShape = async (id: number) => {
        setLoading(true);
        setDeleteError(null);

        try {
            await deleteShape.mutateAsync({ id: id });
        } catch (error) {
            if (typeof error === "object" && error && "detail" in error) {
                setDeleteError((error as MutationError).detail);
            } else {
                setDeleteError("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 ">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    Admin Dashboard
                </h1>

                <div className="flex items-center space-x-3">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="default" onClick={handleOpenCreateDialog}>Add New Entry</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Entry</DialogTitle>
                                <DialogDescription>
                                    Enter the details for the new shape entry. Click save when done.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit(handleCreateShape)}>
                                <div className="grid gap-4 py-4 pb-10">
                                    <div className="grid grid-cols-4 items-center gap-2">
                                        <Label htmlFor="create-name" className="text-right">Name</Label>
                                        <Input
                                            id="create-name"
                                            maxLength={20}
                                            className="col-span-3"
                                            {...register('name', { required: 'Name is required' })}
                                        />
                                        {errors.name && (
                                            <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-2">
                                        <Label htmlFor="create-shape" className="text-right">Shape</Label>
                                        <Controller
                                            control={control}
                                            name="shape"
                                            rules={{ required: "Shape is required" }}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger id="create-shape" className="col-span-3">
                                                        <SelectValue placeholder="Select shape" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="circle">Circle</SelectItem>
                                                        <SelectItem value="square">Square</SelectItem>
                                                        <SelectItem value="triangle">Triangle</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.shape && (
                                            <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.shape.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-2">
                                        <Label htmlFor="create-color" className="text-right">Color</Label>
                                        <Input
                                            id="create-color"
                                            type='color'
                                            className="col-span-3"
                                            {...register("color", {
                                                required: "Color is required",
                                                pattern: {
                                                    value: /^#[0-9A-F]{6}$/i,
                                                    message: "Invalid hex color code"
                                                }
                                            })}
                                        />
                                        {errors.color && (
                                            <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.color.message}</p>
                                        )}
                                    </div>

                                    {formError && (
                                        <p className="row-span-3 text-sm text-red-600 text-center">{formError}</p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" disabled={loading}
                                        >Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create entry'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">Log out</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be logged out.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={logout}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Log out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <ThemeToggle />
                </div>
            </div>

            {deleteError && (
                <p className="text-sm text-red-600 text-center mb-4">{deleteError}</p>
            )}

            <ShapesTable
                data={shapes}
                isAdmin={true}
                onEdit={handleOpenEditDialog}
                onDelete={handleDeleteShape}
                isSubmitting={loading}
                isLoading={isLoading}
            />

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit</DialogTitle>
                        <DialogDescription className="truncate">
                            Modify the details for this entry. Click save when done.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(handleEditShape)}>
                        <div className="grid gap-4 py-4 pb-10">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input
                                    id="edit-name"
                                    maxLength={20} className="col-span-3"
                                    disabled={loading}
                                    {...register('name', { required: 'Name is required' })}
                                />
                                {errors.name && (
                                    <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-shape" className="text-right">Shape</Label>
                                <Controller
                                    control={control}
                                    name="shape"
                                    rules={{ required: "Shape is required" }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                            disabled={loading}
                                        >
                                            <SelectTrigger id="edit-shape" className="col-span-3">
                                                <SelectValue placeholder="Select shape" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="circle">Circle</SelectItem>
                                                <SelectItem value="square">Square</SelectItem>
                                                <SelectItem value="triangle">Triangle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.shape && (
                                    <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.shape.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-color" className="text-right">Color</Label>
                                <Input id="edit-color"
                                    type='color'
                                    className="col-span-3"
                                    disabled={loading}
                                    {...register("color", {
                                        required: "Color is required",
                                        pattern: {
                                            value: /^#[0-9A-F]{6}$/i,
                                            message: "Invalid hex color code"
                                        }
                                    })}
                                />
                                {errors.color && (
                                    <p className="col-end-5 col-span-3 text-red-600 text-sm italic">{errors.color.message}</p>
                                )}
                            </div>

                            {formError && (
                                <p className="row-span-3 text-sm text-red-600 text-center">{formError}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}