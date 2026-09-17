/*
 * Cortex AnimatedButton — Cyber-Brutalist Interaction System
 *
 * Locked behaviors:
 * - Hover sweep (signal line animation)
 * - Cobalt glow on active state
 * - Arrow translation
 * - Magnetic movement (desktop only, subtle)
 * - Press state feedback
 * - Hard edges (no border-radius)
 */

import { ArrowRight } from "lucide-react";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";

type AnimatedButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
  showArrow?: boolean;
  magnetic?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function AnimatedButton({
  children,
  variant = "primary",
  size = "default",
  showArrow = true,
  magnetic = false,
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled || !buttonRef.current) return;

    // Magnetic effect only on desktop (viewport > 1024px)
    if (window.innerWidth < 1024) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle magnetic pull (max 8px)
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;

    setMagneticOffset({
      x: Math.max(-8, Math.min(8, deltaX)),
      y: Math.max(-8, Math.min(8, deltaY)),
    });
  };

  const handleMouseLeave = () => {
    if (magnetic) {
      setMagneticOffset({ x: 0, y: 0 });
    }
  };

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:shadow-[0_0_24px_rgba(36,87,230,0.4)] active:shadow-[0_0_32px_rgba(36,87,230,0.6)]",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-foreground border border-border hover:border-primary hover:text-primary",
  };

  const sizeClasses = {
    default: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-base",
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        cortex-animated-button
        group
        relative
        inline-flex
        items-center
        justify-center
        gap-3
        font-semibold
        uppercase
        tracking-wider
        overflow-hidden
        transition-all
        duration-300
        ease-out
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        transform: magnetic
          ? `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`
          : undefined,
        transition: magnetic
          ? "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease, color 0.3s ease"
          : undefined,
      }}
    >
      {/* Sweep line animation (left to right on hover) */}
      <span
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-white/10
          to-transparent
          translate-x-[-100%]
          group-hover:translate-x-[100%]
          transition-transform
          duration-700
          ease-out
          pointer-events-none
        "
      />

      {/* Signal line (bottom edge) */}
      <span
        className="
          absolute
          bottom-0
          left-0
          h-[2px]
          w-0
          bg-primary
          group-hover:w-full
          transition-all
          duration-500
          ease-out
        "
      />

      {/* Content */}
      <span className="relative z-10 font-mono text-[10px] tracking-[0.15em]">
        {children}
      </span>

      {/* Arrow with translation */}
      {showArrow && (
        <ArrowRight
          className="
            relative
            z-10
            w-4
            h-4
            transition-transform
            duration-300
            ease-out
            group-hover:translate-x-1
            group-active:translate-x-2
          "
        />
      )}

      {/* Press state indicator */}
      <span
        className="
          absolute
          inset-0
          bg-primary/20
          opacity-0
          group-active:opacity-100
          transition-opacity
          duration-100
          pointer-events-none
        "
      />
    </button>
  );
}
