import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function relativeTime(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    processing: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    complete: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    revision_requested: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    revision_processing: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    revision_complete: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    failed: "text-red-400 border-red-400/30 bg-red-400/10",
  };
  return map[status] || "text-slate-400 border-slate-400/30 bg-slate-400/10";
}

export function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type ServiceLite = {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  estimated_minutes?: number;
};

export type CheckoutPayload = {
  serviceId?: string;
  title?: string;
  brief?: string;
  context?: string;
  specialInstructions?: string;
};
