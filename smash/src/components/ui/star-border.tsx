import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"
import { motion } from "framer-motion"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "div">({
  as,
  className,
  color = "#F36E21",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "div"

  return (
    <Component 
      className={cn(
        "relative inline-block overflow-hidden",
        className
      )} 
      {...props}
    >
      {/* Rotating border */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, ${color} 0deg, transparent 60deg, transparent 300deg, ${color} 360deg)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-1 rounded-full bg-gradient-to-r from-[#F36E21] to-[#ff8f4d]">
        <span className="text-white text-sm font-impact tracking-wider">
          {children}
        </span>
      </div>
    </Component>
  )
}
