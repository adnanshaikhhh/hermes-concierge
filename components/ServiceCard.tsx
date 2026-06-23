"use client";

import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Clock } from "lucide-react";

export type Service = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  estimated_minutes: number;
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="gradient-border-card h-full">
      <div className="gradient-border-card-inner flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-[#f0f4ff]">{service.name}</h3>
          <span className="badge-mono rounded border border-[#2a4080] bg-[#3b6fe8]/10 px-2 py-0.5 text-[#3b6fe8]">
            {formatPrice(service.price_cents)}
          </span>
        </div>
        <p className="mb-6 flex-1 text-sm leading-relaxed text-[#8b9dc3]">
          {service.description}
        </p>
        <div className="flex items-center justify-between border-t border-[#1e2d4a] pt-4">
          <div className="flex items-center gap-1.5 text-xs text-[#4a5980]">
            <Clock className="h-3.5 w-3.5" />
            <span>~{service.estimated_minutes} min delivery</span>
          </div>
          <Link
            href={`/order/${service.id}`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#3b6fe8] px-2.5 text-[0.8rem] font-medium text-white transition hover:bg-[#4a7ef0]"
          >
            Order →
          </Link>
        </div>
      </div>
    </div>
  );
}
