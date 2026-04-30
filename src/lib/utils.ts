import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBandColor(band: number): string {
  if (band >= 7) return "text-green-600";
  if (band >= 6) return "text-amber-500";
  return "text-red-500";
}

export function getBandBgColor(band: number): string {
  if (band >= 7) return "bg-green-100 text-green-800";
  if (band >= 6) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function getBandBarColor(band: number): string {
  if (band >= 7) return "bg-green-500";
  if (band >= 6) return "bg-amber-500";
  return "bg-red-500";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
