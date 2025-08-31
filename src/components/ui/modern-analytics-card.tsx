import React from 'react'
import { cn } from '../../lib/utils'
import { LucideIcon } from 'lucide-react'
import { OptimizedLoader } from './optimized-loader'

interface ModernAnalyticsCardProps {
  title: string
  subtitle?: string
  value?: string | number
  change?: {
    value: number
    type: 'positive' | 'negative' | 'neutral'
    label?: string
  }
  icon?: LucideIcon
  iconColor?: string
  children?: React.ReactNode
  className?: string
  variant?: 'stat' | 'chart' | 'content'
  isLoading?: boolean
  onClick?: () => void
  gradient?: boolean
}

export function ModernAnalyticsCard({
  title,
  subtitle,
  value,
  change,
  icon: Icon,
  iconColor = 'premun-gradient-primary',
  children,
  className,
  variant = 'content',
  isLoading = false,
  onClick,
  gradient = false
}: ModernAnalyticsCardProps) {
  
  const cardClasses = cn(
    "premun-card premun-optimize-rendering",
    {
      "premun-card-interactive cursor-pointer": onClick,
      "premun-stat-card": variant === 'stat',
      "premun-chart-container": variant === 'chart',
      "premun-analytics-hero": gradient
    },
    className
  )

  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="space-y-4">
          <div className="premun-skeleton h-6 w-1/3 rounded"></div>
          {variant === 'stat' && (
            <>
              <div className="premun-skeleton h-8 w-1/2 rounded"></div>
              <div className="premun-skeleton h-4 w-1/4 rounded"></div>
            </>
          )}
          {variant === 'chart' && (
            <div className="premun-skeleton h-64 w-full rounded"></div>
          )}
          {variant === 'content' && (
            <>
              <div className="premun-skeleton h-4 w-full rounded"></div>
              <div className="premun-skeleton h-4 w-2/3 rounded"></div>
              <div className="premun-skeleton h-20 w-full rounded"></div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {Icon && (
            <div className={cn(
              "p-2 rounded-xl shadow-sm premun-hover-lift",
              iconColor
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {change && (
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium",
            {
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": change.type === 'positive',
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": change.type === 'negative',
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400": change.type === 'neutral'
            }
          )}>
            <span className={cn(
              "text-xs",
              {
                "text-green-600": change.type === 'positive',
                "text-red-600": change.type === 'negative',
                "text-gray-600": change.type === 'neutral'
              }
            )}>
              {change.type === 'positive' ? '↗' : change.type === 'negative' ? '↘' : '→'}
            </span>
            <span>{Math.abs(change.value)}%</span>
            {change.label && <span className="ml-1">{change.label}</span>}
          </div>
        )}
      </div>

      {/* Valeur principale pour les stats */}
      {variant === 'stat' && value && (
        <div className="mb-4">
          <div className="text-3xl font-bold premun-gradient-text">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
      )}

      {/* Contenu de la carte */}
      {children && (
        <div className={cn(
          "premun-lazy-load",
          {
            "premun-chart-wrapper": variant === 'chart'
          }
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

// Composant spécialisé pour les métriques importantes
export function HeroMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  className
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; positive: boolean }
  icon?: LucideIcon
  className?: string
}) {
  return (
    <ModernAnalyticsCard
      title={title}
      subtitle={subtitle}
      value={value}
      icon={Icon}
      variant="stat"
      gradient={true}
      change={trend ? {
        value: trend.value,
        type: trend.positive ? 'positive' : 'negative'
      } : undefined}
      className={cn("premun-fade-in", className)}
    />
  )
}

// Grid responsive pour les cartes analytics
export function AnalyticsGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("premun-grid-responsive", className)}>
      {children}
    </div>
  )
}

// Section avec animation staggered
export function AnimatedSection({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div 
      className={cn("premun-slide-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
