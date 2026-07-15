"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const directions = {
  up: { y: 20, x: 0 },
  left: { y: 0, x: 20 },
  right: { y: 0, x: -20 },
  none: { y: 0, x: 0 },
} as const;

/**
 * Fades + slides content into view as it scrolls into the viewport.
 * Runs once per element (won't re-trigger on scroll-back). Falls back to a
 * plain opacity fade with no movement when the user prefers reduced motion.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  direction?: keyof typeof directions;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const offset = directions[direction];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : offset.y,
      x: shouldReduceMotion ? 0 : offset.x,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0.2 : 0.55, ease: "easeOut", delay },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
