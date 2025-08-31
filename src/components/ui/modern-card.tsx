import React from 'react'
import { cn } from '../../lib/utils'

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'bordered'
  hover?: boolean
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function ModernCard({
  children,
  className,
  variant = 'default',
  hover = false,
  interactive = false,
  padding = 'md'
}: ModernCardProps) {
  const baseClasses = "rounded-xl transition-all duration-300"
  
  const variantClasses = {
    default: "bg-white border border-slate-200 shadow-sm",
    glass: "glass-morphism border border-white/20 backdrop-blur-xl",
    gradient: "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border border-blue-100/50",
    elevated: "bg-white border border-slate-100 shadow-lg",
    bordered: "bg-white border-2 border-slate-200"
  }
  
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6", 
    lg: "p-8",
    xl: "p-10"
  }
  
  const hoverClasses = hover ? "hover:shadow-xl hover:-translate-y-1" : ""
  const interactiveClasses = interactive ? "cursor-pointer hover-lift" : ""
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        interactiveClasses,
        "animate-scale-in",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ModernCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardHeader({ children, className }: ModernCardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 pb-4", className)}>
      {children}
    </div>
  )
}

interface ModernCardTitleProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

export function ModernCardTitle({ children, className, gradient = false }: ModernCardTitleProps) {
  return (
    <h3 className={cn(
      "text-xl font-semibold leading-tight",
      gradient ? "gradient-text" : "text-slate-900",
      className
    )}>
      {children}
    </h3>
  )
}

interface ModernCardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardDescription({ children, className }: ModernCardDescriptionProps) {
  return (
    <p className={cn("text-sm text-slate-600", className)}>
      {children}
    </p>
  )
}

interface ModernCardContentProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardContent({ children, className }: ModernCardContentProps) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  )
}

interface ModernCardFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardFooter({ children, className }: ModernCardFooterProps) {
  return (
    <div className={cn("flex items-center pt-4", className)}>
      {children}
    </div>
  )
}

// Composant de statistique moderne
interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatCard({
  title,
  value,
  change,
  icon,
  description,
  variant = 'default'
}: StatCardProps) {
  const variantColors = {
    default: 'from-blue-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-pink-600'
  }

  return (
    <ModernCard variant="glass" hover className="relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variantColors[variant]} opacity-5`} />
      
      <ModernCardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              {change && (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    change.type === 'increase'
                      ? 'bg-green-100 text-green-800'
                      : change.type === 'decrease'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                  {Math.abs(change.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-slate-500 mt-2">{description}</p>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${variantColors[variant]} shadow-lg`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}

// Composant de fonctionnalité moderne
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  action?: React.ReactNode
  onClick?: () => void
}

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  action,
  onClick
}: FeatureCardProps) {
  return (
    <ModernCard 
      variant="gradient" 
      hover 
      interactive={!!onClick}
      onClick={onClick}
      className="group relative"
    >
      <ModernCardHeader>
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl gradient-primary shadow-lg group-hover:shadow-xl transition-all duration-300">
            <div className="text-white">{icon}</div>
          </div>
          {badge && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ModernCardTitle gradient>{title}</ModernCardTitle>
        <ModernCardDescription>{description}</ModernCardDescription>
      </ModernCardHeader>
      
      {action && (
        <ModernCardFooter>
          {action}
        </ModernCardFooter>
      )}
    </ModernCard>
  )
}
