import React from 'react'
import { cn } from '../../lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  children?: React.ReactNode
  className?: string
  actions?: React.ReactNode
  badge?: {
    text: string
    variant?: 'default' | 'success' | 'warning' | 'info'
  }
  stats?: Array<{
    label: string
    value: string | number
    trend?: {
      value: number
      positive: boolean
    }
  }>
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'premun-gradient-primary',
  children,
  className,
  actions,
  badge,
  stats
}: PageHeaderProps) {
  return (
    <div className={cn("premun-analytics-hero premun-fade-in", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Titre et description */}
        <div className="text-center lg:text-left flex-1">
          <div className="flex items-center justify-center lg:justify-start mb-4">
            {Icon && (
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mr-3 premun-hover-lift",
                iconColor
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <h1 className="text-4xl font-bold premun-gradient-text">
                {title}
              </h1>
              {badge && (
                <Badge 
                  className={cn(
                    "px-3 py-1",
                    {
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300": badge.variant === 'success',
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300": badge.variant === 'info',
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300": badge.variant === 'warning',
                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300": badge.variant === 'default' || !badge.variant
                    }
                  )}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>
          
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl lg:mx-0 mx-auto">
              {subtitle}
            </p>
          )}
          
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-center lg:justify-end gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/20">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center premun-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="text-2xl font-bold premun-gradient-text">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                {stat.trend && (
                  <span className={cn(
                    "text-sm font-medium",
                    stat.trend.positive ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.trend.positive ? '↗' : '↘'} {Math.abs(stat.trend.value)}%
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Version simplifiée pour les pages sans statistiques
export function SimplePageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={Icon}
      actions={actions}
      className={className}
    />
  )
}

// Version avec métriques pour le dashboard
export function DashboardPageHeader({
  title,
  subtitle,
  icon,
  stats,
  actions,
  className
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  stats: Array<{
    label: string
    value: string | number
    trend?: { value: number; positive: boolean }
  }>
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      stats={stats}
      actions={actions}
      className={className}
    />
  )
}
