
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Facebook, Globe, Smartphone } from 'lucide-react'

interface OriginAnalyticsProps {
  originData: Array<{
    origine: string
    total: number
    converted: number
    conversionRate: number
    revenue: number
  }>
  commercialData: Array<{
    commercial: string
    projets: number
    contrats: number
    conversionRate: number
    revenue: number
  }>
}

const ORIGIN_COLORS = {
  'Premunia': '#8B5CF6',
  'Facebook': '#3B82F6', 
  'TikTok': '#EF4444',
  'Google': '#10B981',
  'Instagram': '#F59E0B',
  'LinkedIn': '#6366F1',
  'Non spécifié': '#6B7280'
}

const getOriginIcon = (origine: string) => {
  switch (origine.toLowerCase()) {
    case 'facebook':
      return <Facebook className="w-5 h-5" />
    case 'tiktok':
      return <Smartphone className="w-5 h-5" />
    case 'premunia':
      return <Globe className="w-5 h-5" />
    default:
      return <Target className="w-5 h-5" />
  }
}

export function OriginAnalytics({ originData, commercialData }: OriginAnalyticsProps) {
  const totalRevenue = originData.reduce((sum, item) => sum + item.revenue, 0)
  const totalLeads = originData.reduce((sum, item) => sum + item.total, 0)
  const globalConversionRate = totalLeads > 0 ? 
    (originData.reduce((sum, item) => sum + item.converted, 0) / totalLeads) * 100 : 0

  const chartData = originData.map(item => ({
    ...item,
    fill: ORIGIN_COLORS[item.origine as keyof typeof ORIGIN_COLORS] || ORIGIN_COLORS['Non spécifié']
  }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux Conversion Global</p>
                <p className="text-2xl font-bold">{globalConversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Total</p>
                <p className="text-2xl font-bold">{(totalRevenue / 1000).toFixed(0)}k€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origines Actives</p>
                <p className="text-2xl font-bold">{originData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Origin Chart */}
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Chiffre d'Affaires par Origine</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="origine" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${Number(value).toLocaleString()}€` : value,
                    name === 'revenue' ? 'Chiffre d\'Affaires' : name
                  ]}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rate by Origin */}
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Taux de Conversion par Origine</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="origine" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taux de Conversion']}
                />
                <Bar dataKey="conversionRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Origin Performance */}
      <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Performance Détaillée par Origine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {originData.map((origin, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getOriginIcon(origin.origine)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{origin.origine}</h3>
                      <p className="text-sm text-muted-foreground">
                        {origin.total} leads • {origin.converted} conversions
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={`${
                      origin.conversionRate > globalConversionRate 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {origin.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-xl font-bold">{origin.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-xl font-bold">{origin.converted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CA</p>
                    <p className="text-xl font-bold">{origin.revenue.toLocaleString()}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commercial Performance */}
      <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Performance Commerciale</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commercialData.map((commercial, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{commercial.commercial}</h3>
                    <p className="text-sm text-muted-foreground">
                      {commercial.projets} projets • {commercial.contrats} contrats signés
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {commercial.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Projets</p>
                    <p className="text-xl font-bold">{commercial.projets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contrats</p>
                    <p className="text-xl font-bold">{commercial.contrats}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux Conv.</p>
                    <p className="text-xl font-bold">{commercial.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CA</p>
                    <p className="text-xl font-bold">{commercial.revenue.toLocaleString()}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
