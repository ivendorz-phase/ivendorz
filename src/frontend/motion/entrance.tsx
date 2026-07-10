"use client";

// Entrance wrappers (Motion Standard §2) — for CLIENT surfaces that choreograph their own
// entrances (wizards, reveal-on-action panels). Server-rendered surfaces use the CSS utilities
// instead (`iv-stagger-rise` / `iv-stagger-fade` / `animate-iv-*`) — do not add "use client"
// to a Server Component just to use these.
import * as React from "react";
import { m } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "./tokens";
import { staggerContainer, staggerItem } from "./variants";

export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Extra entrance delay in seconds — clamped to MOTION_STAGGER.cap (Motion Standard §4.4). */
  delay?: number;
}

/** Standard single-element entrance: fade + 6px rise, 200ms easeOut. */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION_DURATION.base,
        ease: MOTION_EASE.out,
        delay: Math.min(delay, MOTION_STAGGER.cap),
      }}
    >
      {children}
    </m.div>
  );
}

export interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

/** Parent for a staggered entrance — wrap each child in `StaggerItem` with its index. */
export function Stagger({ children, className }: StaggerProps) {
  return (
    <m.div className={className} initial="hidden" animate="visible" variants={staggerContainer}>
      {children}
    </m.div>
  );
}

export interface StaggerItemProps extends StaggerProps {
  /** The item's position in the list — drives the capped stagger delay (§4.4). */
  index?: number;
}

/** One staggered child — delay = min(index × step, cap), enforced in `staggerItem`. */
export function StaggerItem({ children, className, index = 0 }: StaggerItemProps) {
  return (
    <m.div className={className} custom={index} variants={staggerItem}>
      {children}
    </m.div>
  );
}
