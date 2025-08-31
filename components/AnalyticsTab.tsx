import React, { useState, Suspense } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Users, Mail, Calendar, Target, BarChart3, Calculator, TrendingUp
} from "lucide-react"
import { ModernAnalyticsCard, AnalyticsGrid, AnimatedSection, HeroMetricCard } from './ui/modern-analytics-card'
import { OptimizedLoader, ChartSkeleton } from './ui/optimized-loader'

// Import statique temporaire pour éviter les erreurs de lazy loading
import { CommercialAnalytics } from './CommercialAnalytics'
import { OriginAnalytics } from './analytics/OriginAnalytics'
import { BrevoAnalyticsDashboard } from './BrevoAnalyticsDashboard'
import { CommissionsAnalyticsTab } from './CommissionsAnalyticsTab'

interface AnalyticsTabProps {
  stats: any
  campaigns: any[]
  clients: any[]
  analyticsData: any
  contacts: any[]
  projets: any[]
  contrats: any[]
}


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function AnalyticsTab({ 
  stats, 
  campaigns, 
  clients, 
  analyticsData, 
  contacts, 
  projets, 
  contrats 
}: AnalyticsTabProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")

  return (
    <div className="space-y-10">
      {/* Métriques principales - Style minimaliste */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {(stats.totalRevenue || 0).toLocaleString()} €
          </div>
          <div className="text-sm text-slate-600">Revenus totaux</div>
          <div className="text-xs text-green-600 mt-1">+15.2%</div>
        </div>
        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {(stats.conversionRate || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-600">Taux de conversion</div>
          <div className="text-xs text-green-600 mt-1">+8.5%</div>
        </div>
        <div className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats.totalProjets || 0}
          </div>
          <div className="text-sm text-slate-600">Projets actifs</div>
          <div className="text-xs text-green-600 mt-1">+12.3%</div>
        </div>
      </div>

      {/* Onglets minimalistes */}
      <div className="w-full">
        <Tabs defaultValue="origins" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger 
              value="origins" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="text-sm">Origines</span>
            </TabsTrigger>
            <TabsTrigger 
              value="commercial" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="text-sm">Commercial</span>
            </TabsTrigger>
            <TabsTrigger 
              value="commissions" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="text-sm">Commissions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="text-sm">Campagnes</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="origins" className="mt-6">
            <OriginAnalytics 
              originData={analyticsData.originAnalytics || []}
              commercialData={analyticsData.commercialAnalytics || []}
            />
          </TabsContent>

          <TabsContent value="commercial" className="mt-6">
            <CommercialAnalytics
              contacts={contacts}
              projets={projets}
              contrats={contrats}
            />
          </TabsContent>

          <TabsContent value="commissions" className="mt-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Commissions</h3>
              <CommissionsAnalyticsTab />
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Campagnes</h3>
              <BrevoAnalyticsDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
