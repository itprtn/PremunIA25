
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { useAuth } from './auth-provider'
import {
  LayoutDashboard,
  Mail,
  Workflow,
  FolderOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Globe,
  Shield,
  Cpu
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { name: 'Campagnes', href: '/campaigns', icon: Mail, badge: null },
  { name: 'Projets', href: '/projects', icon: FolderOpen, badge: null },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, badge: 'Nouveau' },
  { name: 'Email Templates', href: '/email-templates', icon: FileText, badge: null },
  { name: 'Lead Generation', href: '/lead-generation', icon: Target, badge: 'IA' },
  { name: 'Paramètres', href: '/settings', icon: Settings, badge: null },
]

export function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden z-40 premun-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 glass-morphism shadow-2xl transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/20">
            <div className="flex flex-col animate-slide-down">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg hover-lift">
                  <div className="relative">
                    <Cpu className="w-5 h-5 text-white" />
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold gradient-text leading-tight">
                    Premun IA
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-slate-600 font-medium">by</span>
                    <span className="text-xs font-semibold text-slate-700">MEKNI Hamdi</span>
                    <Shield className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden hover:bg-white/20 rounded-xl transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center space-x-2 px-2 mb-3">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
              </div>
            </div>
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              // Couleurs distinctives vibrantes pour chaque bouton
              const getButtonStyles = () => {
                if (isActive) {
                  return 'gradient-primary text-white shadow-lg hover:shadow-xl'
                }
                return 'text-slate-700 hover:bg-white/60 hover:text-slate-900 hover:shadow-md'
              }
              
              return (
                <div 
                  key={item.name}
                  className="transform transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`
                      w-full justify-start space-x-3 rounded-xl transition-all duration-300 hover-lift relative group
                      ${getButtonStyles()}
                    `}
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    <span className="font-medium flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200
                        ${
                          item.badge === 'IA' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : item.badge === 'Nouveau' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-2 animate-bounce-gentle" />
                    )}
                    {/* Effet de shine au hover */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12" />
                    )}
                  </Button>
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600">Système actif</span>
              </div>
              <div className="text-xs text-slate-500">CRM connecté et opérationnel</div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover-lift"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile only */}
        <header className="bg-white border-b border-slate-200 lg:hidden">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">MH</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-slate-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
