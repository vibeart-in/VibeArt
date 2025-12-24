"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

type NodeOperationsContextType = {
  addNode: (type: string, options?: Record<string, unknown>) => string;
  duplicateNode: (id: string) => void;
};

const NodeOperationsContext = createContext<NodeOperationsContextType | null>(null);

export const useNodeOperations = () => {
  const context = useContext(NodeOperationsContext);
  if (!context) {
    throw new Error("useNodeOperations must be used within a NodeOperationsProvider");
  }
  return context;
};

type NodeOperationsProviderProps = {
  addNode: (type: string, options?: Record<string, unknown>) => string;
  duplicateNode: (id: string) => void;
  children: ReactNode;
};

export const NodeOperationsProvider = ({
  addNode,
  duplicateNode,
  children,
}: NodeOperationsProviderProps) => {
  const value = useMemo(() => ({ addNode, duplicateNode }), [addNode, duplicateNode]);
  return <NodeOperationsContext.Provider value={value}>{children}</NodeOperationsContext.Provider>;
};
