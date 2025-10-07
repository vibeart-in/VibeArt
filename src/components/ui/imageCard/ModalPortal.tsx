"use client";
import { createPortal } from "react-dom";
import { ReactNode, useEffect, useState } from "react";

interface ModalPortalProps {
  children: ReactNode;
}

export default function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Render portal only after mount (to avoid SSR mismatch)
  if (!mounted) return null;

  return createPortal(children, document.body);
}
