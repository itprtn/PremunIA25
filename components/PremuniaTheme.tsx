import React from 'react'

// Configuration de la charte graphique Premunia
export const PREMUNIA_THEME = {
  colors: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Orange principal
      600: '#ea580c', // Orange foncé
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Bleu secondaire
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Jaune accent
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    }
  },
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    secondary: 'from-blue-500 to-blue-600',
    accent: 'from-yellow-400 to-orange-500',
    hero: 'from-orange-50 to-orange-100',
    card: 'from-white to-gray-50',
    footer: 'from-gray-900 to-gray-800'
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  },
  borderRadius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      serif: 'Georgia, Cambria, serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    },
    fontWeight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    }
  },
  spacing: {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8'
  },
  animations: {
    transition: 'transition-all duration-200',
    hover: 'hover:scale-105 hover:shadow-lg',
    focus: 'focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
  }
}

// Composants de base avec le thème Premunia
export const PremuniaButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  [key: string]: any
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: `bg-gradient-to-r ${PREMUNIA_THEME.gradients.primary} text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500`,
    secondary: `bg-gradient-to-r ${PREMUNIA_THEME.gradients.secondary} text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500`,
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-500',
    ghost: 'text-orange-600 hover:bg-orange-50 focus:ring-orange-500'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const PremuniaCard = ({ 
  children, 
  className = '', 
  ...props 
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const PremuniaInput = ({ 
  className = '', 
  ...props 
}: {
  className?: string
  [key: string]: any
}) => {
  return (
    <input 
      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${className}`}
      {...props}
    />
  )
}

export const PremuniaBadge = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
  [key: string]: any
}) => {
  const variants = {
    primary: 'bg-orange-100 text-orange-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

// Hook pour utiliser le thème
export const usePremuniaTheme = () => {
  return PREMUNIA_THEME
}

// Composant de contexte pour le thème (optionnel)
export const PremuniaThemeProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  return (
    <div className="premunia-theme">
      {children}
    </div>
  )
}

// Styles CSS globaux pour le thème
export const PremuniaGlobalStyles = () => {
  return (
    <style jsx global>{`
      .premunia-theme {
        --color-primary-50: #fff7ed;
        --color-primary-100: #ffedd5;
        --color-primary-200: #fed7aa;
        --color-primary-300: #fdba74;
        --color-primary-400: #fb923c;
        --color-primary-500: #f97316;
        --color-primary-600: #ea580c;
        --color-primary-700: #c2410c;
        --color-primary-800: #9a3412;
        --color-primary-900: #7c2d12;
        
        --color-secondary-50: #eff6ff;
        --color-secondary-100: #dbeafe;
        --color-secondary-200: #bfdbfe;
        --color-secondary-300: #93c5fd;
        --color-secondary-400: #60a5fa;
        --color-secondary-500: #3b82f6;
        --color-secondary-600: #2563eb;
        --color-secondary-700: #1d4ed8;
        --color-secondary-800: #1e40af;
        --color-secondary-900: #1e3a8a;
      }
      
      .premunia-theme .btn-primary {
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      
      .premunia-theme .btn-primary:hover {
        background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
      }
      
      .premunia-theme .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
        transition: all 0.2s ease;
      }
      
      .premunia-theme .card:hover {
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .premunia-theme .input {
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        transition: all 0.2s ease;
      }
      
      .premunia-theme .input:focus {
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        outline: none;
      }
      
      .premunia-theme .gradient-bg {
        background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100));
      }
      
      .premunia-theme .text-gradient {
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `}</style>
  )
}
