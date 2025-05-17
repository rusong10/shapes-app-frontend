"use client"

import { useShapes } from "@/hooks/useShapes";
import { ShapesTable } from "@/components/ShapesTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useShapesSocket } from "@/hooks/useShapesSocket";

export default function Home() {
  const { data: shapes, isLoading } = useShapes()
  const { } = useShapesSocket(!!shapes)

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          User Portal
        </h1>
        <ThemeToggle />
      </div>

      <ShapesTable data={shapes} isLoading={isLoading} />
    </div>
  )
}
