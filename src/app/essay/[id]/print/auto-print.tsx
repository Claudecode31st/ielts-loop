"use client";
import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Small delay so fonts / layout paint first
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
