'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase'

interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageScore: number;
  totalValue: number;
  costPerLead: number;
  roi: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  source: string;
  medium: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  cost: number;
  cpl: number;
  roi: number;
  status: 'active' | 'paused' | 'completed';
}

interface LeadSource {
  source: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  percentage: number;
}

interface TimeSeriesData {
  date: string;
  leads: number;
  conversions: number;
  cost: number;
}

const MOCK_LEAD_METRICS: LeadMetrics = {
  totalLeads: 2847,
  newLeads: 156,
  convertedLeads: 342,
  conversionRate: 12.0,
  averageScore: 7.2,
  totalValue: 125000,
  costPerLead: 8.50,
  roi: 415.2
};

const MOCK_CAMPAIGNS: CampaignPerformance[] = [
  {
    id: '1',
    name: 'Facebook Mutuelle Santé Q1',
    source: 'facebook',
    medium: 'social',
    leads: 1250,
    conversions: 89,
    conversionRate: 7.1,
    cost: 10625,
    cpl: 8.50,
    roi: 415.2,
    status: 'active'
  },
  {
    id: '2',
    name: 'Google Ads Assurance Emprunteur',
    source: 'google',
    medium: 'cpc',
    leads: 890,
    conversions: 67,
    conversionRate: 7.5,
    cost: 7120,
    cpl: 8.00,
    roi: 456.8,
    status: 'active'
  },
  {
    id: '3',
    name: 'Email Newsletter Q1',
    source: 'email',
    medium: 'email',
    leads: 456,
    conversions: 34,
    conversionRate: 7.5,
    cost: 456,
    cpl: 1.00,
    roi: 1250.0,
    status: 'active'
  },
  {
    id: '4',
    name: 'TikTok Mutuelle Senior',
    source: 'tiktok',
    medium: 'social',
    leads: 251,
    conversions: 18,
    conversionRate: 7.2,
    cost: 2510,
    cpl: 10.00,
    roi: 298.4,
    status: 'paused'
  }
];

const MOCK_LEAD_SOURCES: LeadSource[] = [
  { source: 'Facebook', leads: 1250, conversions: 89, conversionRate: 7.1, percentage: 43.9 },
  { source: 'Google Ads', leads: 890, conversions: 67, conversionRate: 7.5, percentage: 31.3 },
  { source: 'Email', leads: 456, conversions: 34, conversionRate: 7.5, percentage: 16.0 },
  { source: 'TikTok', leads: 251, conversions: 18, conversionRate: 7.2, percentage: 8.8 }
];

const MOCK_TIME_SERIES: TimeSeriesData[] = [
  { date: '2024-01-01', leads: 45, conversions: 3, cost: 382.5 },
  { date: '2024-01-02', leads: 52, conversions: 4, cost: 442.0 },
  { date: '2024-01-03', leads: 38, conversions: 3, cost: 323.0 },
  { date: '2024-01-04', leads: 61, conversions: 5, cost: 518.5 },
  { date: '2024-01-05', leads: 48, conversions: 4, cost: 408.0 },
  { date: '2024-01-06', leads: 35, conversions: 2, cost: 297.5 },
  { date: '2024-01-07', leads: 42, conversions: 3, cost: 357.0 }
];

export default function LeadDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedSource, setSelectedSource] = useState('all');
  const [metrics, setMetrics] = useState<LeadMetrics>(MOCK_LEAD_METRICS);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>(MOCK_CAMPAIGNS);
  const [leadSources, setLeadSources] = useState<LeadSource[]>(MOCK_LEAD_SOURCES);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(MOCK_TIME_SERIES);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedSource]);

  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();
    if (period === '7d') start.setDate(end.getDate() - 6);
    if (period === '30d') start.setDate(end.getDate() - 29);
    if (period === '90d') start.setDate(end.getDate() - 89);
    if (period === '1y') start.setFullYear(end.getFullYear() - 1);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      startOfMonth: new Date(end.getFullYear(), end.getMonth(), 1).toISOString(),
    };
  };

  const loadDashboardData = async () => {
    try {
      const { start, end, startOfMonth } = getDateRange(selectedPeriod);

      // Use projects as leads (projects represent business opportunities/leads)
      let leadsQuery = supabase
        .from('projets')
        .select('id, date_creation, origine, statut')
        .gte('date_creation', start)
        .lte('date_creation', end);
      const { data: leads, error: leadsErr } = await leadsQuery;
      if (leadsErr) throw leadsErr;

      // New leads (month to date) - projects created this month
      let newLeadsQuery = supabase
        .from('projets')
        .select('id')
        .gte('date_creation', startOfMonth)
        .lte('date_creation', end);
      const { data: newLeadsData, error: newLeadsErr } = await newLeadsQuery;
      if (newLeadsErr) throw newLeadsErr;

      // Conversions: contracts created in period
      const { data: contracts, error: contractsErr } = await supabase
        .from('contrats')
        .select('id, prime_nette_mensuelle, contrat_date_creation, projet_origine')
        .gte('contrat_date_creation', start)
        .lte('contrat_date_creation', end);
      if (contractsErr) throw contractsErr;

      const totalLeads = leads?.length || 0;
      const newLeads = newLeadsData?.length || 0;
      const convertedLeads = contracts?.length || 0;
      const conversionRate = totalLeads > 0 ? +(convertedLeads / totalLeads * 100).toFixed(1) : 0;
      const averageScore = 7.2; // Use default score since projects don't have score field
      const totalValue = contracts?.reduce((s: number, c: any) => s + ((c.prime_nette_mensuelle || 0) * 12), 0) || 0;
      const costPerLead = 8.50; // Default cost per lead
      const roi = costPerLead > 0 && totalValue > 0 ? +((totalValue / (totalLeads * costPerLead)) * 100).toFixed(1) : 0;

      setMetrics({
        totalLeads,
        newLeads,
        convertedLeads,
        conversionRate,
        averageScore,
        totalValue,
        costPerLead,
        roi,
      });

      // Lead sources breakdown from project origine
      const leadsBySource = new Map<string, { leads: number; conversions: number }>();
      leads?.forEach((l: any) => {
        const src = (l.origine || 'unknown').toLowerCase();
        const agg = leadsBySource.get(src) || { leads: 0, conversions: 0 };
        agg.leads += 1;
        leadsBySource.set(src, agg);
      });

      const totalBySource = Array.from(leadsBySource.entries()).map(([source, vals]) => ({ source, ...vals }));
      const sourceLeadsTotal = totalBySource.reduce((s, r) => s + r.leads, 0) || 1;
      const leadSourcesData: LeadSource[] = totalBySource.map((r) => ({
        source: r.source,
        leads: r.leads,
        conversions: Math.round((convertedLeads * r.leads) / sourceLeadsTotal),
        conversionRate: r.leads > 0 ? +((convertedLeads * r.leads) / sourceLeadsTotal / r.leads * 100).toFixed(1) : 0,
        percentage: +((r.leads / sourceLeadsTotal) * 100).toFixed(1),
      }));
      setLeadSources(leadSourcesData);

      // Campaign performance from project origine
      const byCampaign = new Map<string, { name: string; source: string; medium: string; leads: number }>();
      leads?.forEach((l: any) => {
        const key = l.origine || 'unknown';
        const agg = byCampaign.get(key) || {
          name: l.origine || 'unknown',
          source: (l.origine || 'unknown').toLowerCase(),
          medium: 'organic',
          leads: 0
        };
        agg.leads += 1;
        byCampaign.set(key, agg);
      });

      const campaignsData: CampaignPerformance[] = Array.from(byCampaign.entries()).map(([key, v], idx) => {
        const cost = v.leads * costPerLead;
        const conv = Math.round((convertedLeads * v.leads) / Math.max(1, totalLeads));
        const rate = v.leads > 0 ? +(conv / v.leads * 100).toFixed(1) : 0;
        const cpl = v.leads > 0 ? +(cost / v.leads).toFixed(2) : 0;
        const campRoi = cost > 0 ? +(((totalValue * (v.leads / Math.max(1, totalLeads))) / cost) * 100).toFixed(1) : 0;
        return {
          id: String(idx + 1),
          name: v.name,
          source: v.source,
          medium: v.medium,
          leads: v.leads,
          conversions: conv,
          conversionRate: rate,
          cost,
          cpl,
          roi: campRoi,
          status: 'active',
        };
      });
      setCampaigns(campaignsData);

      // Time series (per day) from projects
      const dayKey = (d: string | Date) => new Date(d).toISOString().slice(0, 10);
      const ts = new Map<string, { leads: number; conversions: number; cost: number }>();
      leads?.forEach((l: any) => {
        const k = dayKey(l.date_creation);
        const agg = ts.get(k) || { leads: 0, conversions: 0, cost: 0 };
        agg.leads += 1;
        agg.cost += costPerLead;
        ts.set(k, agg);
      });
      contracts?.forEach((c: any) => {
        const k = dayKey(c.contrat_date_creation);
        const agg = ts.get(k) || { leads: 0, conversions: 0, cost: 0 };
        agg.conversions += 1;
        ts.set(k, agg);
      });
      const timeSeries: TimeSeriesData[] = Array.from(ts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, leads: v.leads, conversions: v.conversions, cost: v.cost }));
      setTimeSeriesData(timeSeries);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      // Fallback to mock data on error
      setMetrics(MOCK_LEAD_METRICS);
      setLeadSources(MOCK_LEAD_SOURCES);
      setCampaigns(MOCK_CAMPAIGNS);
      setTimeSeriesData(MOCK_TIME_SERIES);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary">En pause</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'google':
        return '🔍';
      case 'email':
        return '📧';
      case 'tiktok':
        return '🎵';
      default:
        return '🌐';
    }
  };

  const renderMetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalLeads)}</div>
          <p className="text-xs text-muted-foreground">
            +{formatNumber(metrics.newLeads)} ce mois
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(metrics.convertedLeads)} conversions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coût par lead</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.costPerLead)}</div>
          <p className="text-xs text-muted-foreground">
            ROI: {metrics.roi}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Score moyen: {metrics.averageScore}/10
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCampaignsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance des campagnes</span>
          <div className="flex space-x-2">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer par source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sources</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Campagne</th>
                <th className="text-left py-3 px-4 font-medium">Source</th>
                <th className="text-center py-3 px-4 font-medium">Leads</th>
                <th className="text-center py-3 px-4 font-medium">Conversions</th>
                <th className="text-center py-3 px-4 font-medium">Taux</th>
                <th className="text-center py-3 px-4 font-medium">Coût</th>
                <th className="text-center py-3 px-4 font-medium">CPL</th>
                <th className="text-center py-3 px-4 font-medium">ROI</th>
                <th className="text-center py-3 px-4 font-medium">Statut</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.medium}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{getSourceIcon(campaign.source)}</span>
                      <span className="capitalize">{campaign.source}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{formatNumber(campaign.leads)}</td>
                  <td className="py-3 px-4 text-center">{formatNumber(campaign.conversions)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-medium">{campaign.conversionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">{formatCurrency(campaign.cost)}</td>
                  <td className="py-3 px-4 text-center">{formatCurrency(campaign.cpl)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${campaign.roi > 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {campaign.roi}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderLeadSourcesChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Répartition des leads par source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leadSources.map((source, index) => (
            <div key={source.source} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{
                  backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                }}></div>
                <div>
                  <div className="font-medium">{source.source}</div>
                  <div className="text-sm text-gray-500">
                    {formatNumber(source.leads)} leads • {source.conversionRate}% conversion
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{source.percentage}%</div>
                <div className="text-sm text-gray-500">
                  {formatNumber(source.conversions)} conversions
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderTimeSeriesChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Évolution des leads dans le temps
          </span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {timeSeriesData.map((data, index) => {
            const maxLeads = Math.max(...timeSeriesData.map(d => d.leads));
            const height = (data.leads / maxLeads) * 100;
            
            return (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 rounded-t" style={{ height: `${height}%` }}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(data.conversions / Math.max(1, data.leads)) * 100}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  <div>{new Date(data.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
                  <div className="font-medium">{data.leads}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Conversions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Leads</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2" />
            <span className="text-sm">Nouveaux leads</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Target className="w-6 h-6 mb-2" />
            <span className="text-sm">Qualifier leads</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="text-sm">Rapports</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm">Planifier</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">Tableau de bord des leads</h1>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtres avancés
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMetricsCards()}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderLeadSourcesChart()}
              {renderQuickActions()}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {renderCampaignsTable()}
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderLeadSourcesChart()}
              <Card>
                <CardHeader>
                  <CardTitle>Performance par canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getSourceIcon(source.source)}</span>
                          <div>
                            <div className="font-medium">{source.source}</div>
                            <div className="text-sm text-gray-500">
                              {formatNumber(source.leads)} leads
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">{source.conversionRate}%</div>
                          <div className="text-sm text-gray-500">conversion</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {renderTimeSeriesChart()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
