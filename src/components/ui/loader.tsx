import React from 'react'
import { cn } from '../../lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'ring'
  className?: string
  text?: string
}

export function Loader({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce',
                size === 'sm' ? 'w-2 h-2' : 
                size === 'md' ? 'w-3 h-3' : 
                size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn('text-gray-600 font-medium animate-pulse', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
        <div className={cn(
          'bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn('text-gray-600 font-medium animate-pulse', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'ring') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        {text && (
          <p className={cn('text-gray-600 font-medium animate-pulse', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  // Default variant - modern spinner
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
        {/* Animated gradient ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #2563eb 90deg, transparent 360deg)',
            borderRadius: '50%',
            WebkitMask: 'radial-gradient(circle, transparent 65%, black 66%)',
            mask: 'radial-gradient(circle, transparent 65%, black 66%)'
          }}
        ></div>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse',
            size === 'sm' ? 'w-1 h-1' : 
            size === 'md' ? 'w-1.5 h-1.5' : 
            size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
          )}></div>
        </div>
      </div>
      {text && (
        <p className={cn('text-gray-600 font-medium animate-pulse', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Composant de loading pour les pages entières
export function PageLoader({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="text-center">
        <Loader variant="ring" size="xl" text={text} />
      </div>
    </div>
  )
}

// Composant de loading pour les sections
export function SectionLoader({ text = "Chargement...", className }: { text?: string, className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Loader variant="dots" size="md" text={text} />
    </div>
  )
}
