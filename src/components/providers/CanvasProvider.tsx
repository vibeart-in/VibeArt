"use client";

import { createContext, useContext, ReactNode } from "react";
import { CanvasProject } from "@/src/types/BaseType";

interface CanvasContextType {
  project: CanvasProject | null;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({
  children,
  project,
}: {
  children: ReactNode;
  project: CanvasProject | null;
}) {
  return <CanvasContext.Provider value={{ project }}>{children}</CanvasContext.Provider>;
}

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
