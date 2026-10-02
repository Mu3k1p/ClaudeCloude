"use client";

import { Check, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMyList } from "@/hooks/useLibrary";
import type { Content } from "@/lib/types";

export function MyListButton({
  item,
  appearance = "button",
  size = "lg",
  className,
}: {
  item: Content;
  appearance?: "button" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const list = useMyList();
  const inList = list.has(item.id);
  const label = inList ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`;

  const icon = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={inList ? "in" : "out"}
        initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
        transition={{ duration: 0.22 }}
        className="inline-flex"
      >
        {inList ? <Check strokeWidth={1.75} className={inList ? "text-accent" : undefined} /> : <Plus strokeWidth={1.75} />}
      </motion.span>
    </AnimatePresence>
  );

  if (appearance === "icon") {
    return (
      <IconButton
        label={label}
        size={size}
        tone="outline"
        aria-pressed={inList}
        onClick={() => list.toggle(item)}
        className={className}
      >
        {icon}
      </IconButton>
    );
  }
  return (
    <Button
      variant="secondary"
      size={size}
      icon={icon}
      aria-pressed={inList}
      aria-label={label}
      onClick={() => list.toggle(item)}
      className={className}
    >
      {inList ? "In My List" : "My List"}
    </Button>
  );
}
