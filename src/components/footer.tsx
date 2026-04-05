"use client";
import Link from "next/link";
import { Instagram, Target } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <footer className="bg-white relative overflow-hidden">

      <div className="container py-10 md:py-16 relative z-10">
        <div className="flex justify-center items-center -mb-8 relative">
          <div 
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black text-center cursor-pointer transition-all duration-300 relative"
            onMouseMove={handleMouseMove}
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #6b7280 0%, #374151 50%, #111827 100%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              NAVYGOAL
            </span>
          </div>
        </div>

        <div className="flex justify-end mb-4 relative z-20">
          <nav className="flex space-x-4">
            {[
              { name: "Contact", href: "/contact" },
              { name: "Privacy", href: "/privacy" },
              { name: "Terms", href: "/terms" },
              { name: "Pricing", href: "/pricing" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs text-muted-foreground hover:text-foreground relative z-30"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8">
          <div className="text-xs text-muted-foreground mb-4 md:mb-0 flex items-center">
            <Target className="h-3 w-3 mr-2 text-primary" />
            <span> {currentYear} NavyGoal. All rights reserved. by </span>
            <a href="https://instagram.com/abrohz" className="ml-1 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-green-600">@abrohz</a>
          </div>

          <div className="flex space-x-4">
            <a
              href="https://instagram.com/navygoal"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
