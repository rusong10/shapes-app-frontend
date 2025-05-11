"use client"

import { ShapesTable } from "@/components/ShapesTable";
import { useShapes } from "@/hooks/useShapes";
import { useShapesWS } from "@/hooks/useShapesWS";

export default function Home() {
  const { data: shapes, isLoading, error } = useShapes()
  useShapesWS(!!shapes)

  if (isLoading) return <p>Loading shapes...</p>;
  if (error) return <p>Error loading shapes: {error.message}</p>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          User Portal
        </h1>
        {/* <ThemeToggle /> */}
      </div>


      {!isLoading && !error && (
        <ShapesTable data={shapes} />
      )}
    </div>
  )
}
