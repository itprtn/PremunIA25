import {
  // Navigation & Layout
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
  
  // CRM & Business
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  Building,
  Building2,
  Briefcase,
  FolderOpen,
  Folder,
  FileText,
  File,
  FilePlus,
  FileSearch,
  Archive,
  
  // Communication
  Mail,
  MailOpen,
  Send,
  MessageSquare,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Video,
  Mic,
  
  // Analytics & Reports
  BarChart3,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  
  // Status & Feedback
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  CalendarDays,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  Share,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  
  // Technology & AI
  Cpu,
  Brain,
  Bot,
  Sparkles,
  Wand2,
  Rocket,
  Globe,
  Cloud,
  Database,
  Server,
  Code,
  Terminal,
  
  // Security & Privacy
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  
  // Social & External
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  
  // Media & Files
  Image,
  Camera,
  Video as VideoIcon,
  Music,
  Headphones,
  Printer,
  
  // Money & Commerce
  DollarSign,
  Euro,
  CreditCard,
  Wallet,
  ShoppingCart,
  Package,
  
  // Time & Calendar
  Clock3,
  Timer,
  Hourglass,
  Stopwatch,
  
  // Connectivity
  Wifi,
  WifiOff,
  Bluetooth,
  Link,
  Unlink,
  QrCode,
  
  // Utilities
  Palette,
  Brush,
  Pipette,
  Ruler,
  Grid,
  List,
  
  // Navigation arrows
  Navigation,
  Compass,
  Map,
  MapPin,
  
  // Notifications
  Bell,
  BellOff,
  BellRing,
  
  // Power & Control
  Power,
  PowerOff,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  
  // Weather & Environment
  Sun,
  Moon,
  Star,
  Cloud as CloudIcon,
  
  // Tools
  Wrench,
  Hammer,
  Scissors,
  
  // Shapes & Symbols
  Circle,
  Square,
  Triangle,
  Heart,
  Diamond,
  
  // Misc
  Gift,
  Award,
  Badge,
  Flag,
  Bookmark,
  Tag,
  Tags,
  Hash,
  AtSign,
  Percent,
  LogOut,
  LogIn
} from 'lucide-react'

// Export all icons organized by category
export const NavigationIcons = {
  Dashboard: LayoutDashboard,
  Menu,
  Close: X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
}

export const CRMIcons = {
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  Building,
  Building2,
  Briefcase,
  FolderOpen,
  Folder,
  FileText,
  File,
  FilePlus,
  FileSearch,
  Archive,
}

export const CommunicationIcons = {
  Mail,
  MailOpen,
  Send,
  MessageSquare,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Video,
  Mic,
}

export const AnalyticsIcons = {
  BarChart3,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
}

export const StatusIcons = {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  CalendarDays,
}

export const ActionIcons = {
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  Share,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
}

export const TechnologyIcons = {
  Cpu,
  Brain,
  Bot,
  Sparkles,
  Wand2,
  Rocket,
  Globe,
  Cloud,
  Database,
  Server,
  Code,
  Terminal,
}

export const SecurityIcons = {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
}

export const SocialIcons = {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
}

export const MediaIcons = {
  Image,
  Camera,
  Video: VideoIcon,
  Music,
  Headphones,
  Printer,
}

export const CommerceIcons = {
  DollarSign,
  Euro,
  CreditCard,
  Wallet,
  ShoppingCart,
  Package,
}

export const TimeIcons = {
  Clock3,
  Timer,
  Hourglass,
  Stopwatch,
}

export const ConnectivityIcons = {
  Wifi,
  WifiOff,
  Bluetooth,
  Link,
  Unlink,
  QrCode,
}

export const UtilityIcons = {
  Palette,
  Brush,
  Pipette,
  Ruler,
  Grid,
  List,
}

export const NotificationIcons = {
  Bell,
  BellOff,
  BellRing,
}

export const AuthIcons = {
  LogOut,
  LogIn,
}

// Composant d'icône avec variantes de style pour Premun IA
interface IconProps {
  icon: any
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Icon({ 
  icon: IconComponent, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: IconProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const variantClasses = {
    default: 'text-slate-600',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    gradient: 'gradient-text'
  }

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    />
  )
}

// Composant d'icône avec badge
interface BadgedIconProps extends IconProps {
  badge?: string | number
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger'
}

export function BadgedIcon({ 
  badge, 
  badgeVariant = 'primary',
  ...iconProps 
}: BadgedIconProps) {
  const badgeColors = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  return (
    <div className="relative inline-block">
      <Icon {...iconProps} />
      {badge && (
        <span className={`
          absolute -top-2 -right-2 ${badgeColors[badgeVariant]} 
          text-white text-xs font-bold rounded-full 
          min-w-5 h-5 flex items-center justify-center
          animate-pulse
        `}>
          {badge}
        </span>
      )}
    </div>
  )
}

// Export des icônes les plus utilisées pour un accès rapide
export {
  LayoutDashboard,
  Users,
  Mail,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Target,
  Sparkles,
  Shield,
  Cpu,
  TrendingUp,
  Globe
}
