import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-zinc-800/50 bg-[#1a1a1a] text-white',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export { Card } 