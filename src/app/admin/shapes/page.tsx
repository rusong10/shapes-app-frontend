"use client";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

// custom hooks
import { useShapesWS } from "@/hooks/useShapesWS";
import { useShapes, useCreateShape, useDeleteShape, useUpdateShape } from "@/hooks/useShapes";

//custom components
import { useAuth } from "@/context/AuthContext";
import { ShapesTable } from "@/components/ShapesTable";
import { Shape, ShapeField } from "@/lib/types";

// shadcn
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function AdminDashboardPage() {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedShape, setSelectedShape] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { logout, accessToken } = useAuth();

    const { data: shapes, isLoading, error } = useShapes();
    useShapesWS(!!shapes);

    const { control, register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ShapeField>({
        defaultValues: {
            name: "",
            shape: "circle",
            color: "#000000",
        }
    });

    const createShape = useCreateShape();
    const updateShape = useUpdateShape();
    const deleteShape = useDeleteShape();

    const handleOpenEditDialog = (data: Shape) => {
        setFormError(null);
        setIsEditDialogOpen(true);
        setSelectedShape(data.id);
        setValue("name", data.name);
        setValue("shape", data.shape);
        setValue("color", data.color);
    };

    const handleOpenCreateDialog = () => {
        setFormError(null);
        reset({
            name: "",
            shape: "circle",
            color: "#000000",
        });
        setIsCreateDialogOpen(true);
    };

    const handleCreateShape: SubmitHandler<ShapeField> = async (data: ShapeField) => {
        setIsSubmitting(true);
        setFormError(null);

        try {
            const result = await createShape.mutateAsync({
                data: {
                    name: data.name,
                    color: data.color,
                    shape: data.shape,
                },
                token: accessToken,
            });

            if (result && !result.success) {
                setFormError(typeof result.error === "string" ? result.error : "Failed to create shape");
                setIsSubmitting(false);
                return;
            }

            setIsCreateDialogOpen(false);
        } catch (err: any) {
            setFormError(err?.message || "Failed to create shape");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditShape: SubmitHandler<ShapeField> = async (data: ShapeField) => {
        if (selectedShape == null) {
            setFormError("No shape selected");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const result = await updateShape.mutateAsync({
                id: selectedShape,
                data: {
                    name: data.name,
                    color: data.color,
                    shape: data.shape,
                },
                token: accessToken,
            });

            if (result && !result.success) {
                setFormError(typeof result.error === "string" ? result.error : "Failed to update shape");
                setIsSubmitting(false);
                return;
            }

            setIsEditDialogOpen(false);
        } catch (err: any) {
            setFormError(err?.message || "Failed to update shape");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteShape = async (id: number) => {
        setDeleteError(null);
        try {
            const result = await deleteShape.mutateAsync({
                id,
                token: accessToken
            });

            if (result && !result.success) {
                setDeleteError(typeof result.error === "string" ? result.error : "Failed to delete shape");
            }
        } catch (err: any) {
            setDeleteError(err?.message || "Failed to delete shape");
        }
    };

    if (isLoading) return <p>Loading shapes...</p>;
    if (error) return <p>Error loading shapes: {error.message}</p>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 ">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    Admin Dashboard
                </h1>
                <div className="flex items-center space-x-3">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" onClick={handleOpenCreateDialog}>Add New Entry</Button>
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
                                        <Input id="create-color"
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
                                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Entry'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Log out</Button>
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
                isSubmitting={isSubmitting}
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
                                <Input id="edit-name"
                                    maxLength={20} className="col-span-3"
                                    disabled={isSubmitting}
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
                                            disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                <Button type="button" variant="outline"
                                    disabled={isSubmitting}
                                >Cancel</Button>
                            </DialogClose>
                            <Button type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
