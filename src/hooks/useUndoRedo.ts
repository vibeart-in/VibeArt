import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";

export const useUndoRedo = () => {
  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    const newState = { nodes: getNodes(), edges: getEdges() };

    setPast((p) => {
      // Don't save duplicate snapshots
      const lastPast = p[p.length - 1];
      if (
        lastPast &&
        lastPast.nodes.length === newState.nodes.length &&
        JSON.stringify(lastPast.nodes) === JSON.stringify(newState.nodes) &&
        JSON.stringify(lastPast.edges) === JSON.stringify(newState.edges)
      ) {
        return p;
      }

      return [...p.slice(-50), newState]; // keeping last 50 states
    });
    setFuture([]);
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const currentState = { nodes: getNodes(), edges: getEdges() };
    const newPast = [...past];
    const previousState = newPast.pop();

    if (previousState) {
      setFuture((f) => [...f, currentState]);
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setPast(newPast);
    }
  }, [past, getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const currentState = { nodes: getNodes(), edges: getEdges() };
    const newFuture = [...future];
    const nextState = newFuture.pop();

    if (nextState) {
      setPast((p) => [...p, currentState]);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setFuture(newFuture);
    }
  }, [future, getNodes, getEdges, setNodes, setEdges]);

  return { takeSnapshot, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
};
