"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DockProps {
  className?: string
  items: {
    icon: LucideIcon
    label: string
    onClick?: () => void
    active?: boolean
  }[]
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  active?: boolean
  className?: string
}

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ icon: Icon, label, onClick, active, className }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative group h-14 w-11 flex items-center justify-center",
          "text-neutral-900",
          className
        )}
      >
        <span
          className={cn(
            "absolute size-8 rounded-md",
            active ? "bg-neutral-200" : "bg-transparent"
          )}
          aria-hidden
        />
        <Icon className="relative size-6 stroke-[1.75]" />
        <span
          className={cn(
            "absolute top-full left-1/2 -translate-x-1/2 mt-2",
            "px-2.5 py-1 rounded-md text-xs font-medium",
            "bg-white text-neutral-900 border border-neutral-200 shadow-sm",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity whitespace-nowrap pointer-events-none"
          )}
        >
          {label}
        </span>
      </motion.button>
    )
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full flex items-center justify-center p-2",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center -space-x-0.5 px-7 py-4 rounded-2xl",
            "bg-white border border-neutral-200/90",
            "shadow-[0_8px_30px_rgba(16,24,32,0.08)]"
          )}
        >
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock }
