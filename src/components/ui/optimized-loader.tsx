import React from 'react'
import { cn } from '../../lib/utils'

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  text?: string
}

export function OptimizedLoader({ 
  size = 'md', 
  variant = 'spinner',
  className,
  text
}: OptimizedLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("premun-skeleton rounded-lg", className)} />
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className={cn("premun-gradient-primary rounded-full", sizeClasses[size], "animate-bounce")} style={{ animationDelay: '0ms' }} />
        <div className={cn("premun-gradient-primary rounded-full", sizeClasses[size], "animate-bounce")} style={{ animationDelay: '150ms' }} />
        <div className={cn("premun-gradient-primary rounded-full", sizeClasses[size], "animate-bounce")} style={{ animationDelay: '300ms' }} />
        {text && <span className="text-sm text-muted-foreground ml-3">{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("premun-gradient-primary rounded-full", sizeClasses[size], "animate-pulse")} />
        {text && <span className="text-sm text-muted-foreground ml-3">{text}</span>}
      </div>
    )
  }

  // Spinner par défaut - optimisé
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 premun-gradient-primary rounded-full opacity-20"></div>
        <div className="absolute inset-0 premun-gradient-primary rounded-full animate-spin border-2 border-transparent border-t-current"></div>
      </div>
      {text && <span className="text-sm text-muted-foreground ml-3">{text}</span>}
    </div>
  )
}

// Composant pour les états de chargement de cartes
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("premun-card p-6 space-y-4", className)}>
      <div className="premun-skeleton h-6 w-1/3 rounded"></div>
      <div className="premun-skeleton h-4 w-full rounded"></div>
      <div className="premun-skeleton h-4 w-2/3 rounded"></div>
      <div className="premun-skeleton h-20 w-full rounded"></div>
    </div>
  )
}

// Composant pour les états de chargement de tableaux
export function TableSkeleton({ rows = 5, columns = 4, className }: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn("premun-card p-6", className)}>
      <div className="premun-skeleton h-6 w-1/4 rounded mb-6"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="premun-skeleton h-4 flex-1 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour les graphiques
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("premun-chart-container", className)}>
      <div className="premun-skeleton h-6 w-1/3 rounded mb-6"></div>
      <div className="premun-skeleton h-64 w-full rounded"></div>
    </div>
  )
}
