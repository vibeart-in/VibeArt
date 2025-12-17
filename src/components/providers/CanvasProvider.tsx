"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { CanvasProject } from "@/src/types/BaseType";

interface CanvasContextType {
  project: CanvasProject | null;
  isDraggingEdge: boolean;
  setIsDraggingEdge: (isDragging: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({
  children,
  project,
}: {
  children: ReactNode;
  project: CanvasProject | null;
}) {
  const [isDraggingEdge, setIsDraggingEdge] = useState(false);

  return (
    <CanvasContext.Provider value={{ project, isDraggingEdge, setIsDraggingEdge }}>
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
