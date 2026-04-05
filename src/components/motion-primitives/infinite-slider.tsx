"use client";

import { ReactNode } from "react";

export function InfiniteSlider({ children, speed = 40, speedOnHover = 20, gap = 112 }: { children: ReactNode; speed?: number; speedOnHover?: number; gap?: number }) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-scroll gap-[112px] hover:animate-scroll-slow">
        {children}
        {children}
      </div>
    </div>
  );
}
