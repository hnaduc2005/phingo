"use client"

import React from "react"
import { motion } from "framer-motion"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface FloatingImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  containerClassName?: string;
}

export function FloatingImage({ alt, containerClassName, className, ...props }: FloatingImageProps) {
  return (
    <motion.div
      className={cn("relative z-10 w-full h-full", containerClassName)}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="absolute inset-0 -z-10 bg-brand-gold/20 blur-3xl rounded-full transform scale-75" />
      <Image 
        alt={alt}
        className={cn("drop-shadow-2xl object-contain", className)}
        {...props}
      />
    </motion.div>
  )
}
