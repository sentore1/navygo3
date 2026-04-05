"use client";

export function ProgressiveBlur({ className, direction, blurIntensity = 1 }: { className?: string; direction: "left" | "right"; blurIntensity?: number }) {
  return (
    <div 
      className={className}
      style={{
        background: direction === "left" 
          ? `linear-gradient(to right, rgba(255,255,255,${blurIntensity}), transparent)`
          : `linear-gradient(to left, rgba(255,255,255,${blurIntensity}), transparent)`
      }}
    />
  );
}
