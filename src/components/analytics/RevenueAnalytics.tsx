import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface RevenueAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function RevenueAnalytics({ projets = [], contrats = [] }: RevenueAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const revenueAnalytics = useMemo(() => {
    const today = new Date();
    const dateFilter = (dateStr: string | undefined) => {
      if (dateRange === 'all') return true;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case '7d': return daysDiff <= 7;
        case '30d': return daysDiff <= 30;
        case '90d': return daysDiff <= 90;
        case '1y': return daysDiff <= 365;
        default: return true;
      }
    };

    const filteredContrats = contrats.filter(c => dateFilter(c.contrat_date_creation));

    const revenueByCommercial: { [key: string]: any } = {};
    
    filteredContrats.forEach(contrat => {
      const projet = projets.find(p => p.projet_id === contrat.projet_id);
      const commercial = projet?.commercial || 'Non attribué';

      if (!revenueByCommercial[commercial]) {
        revenueByCommercial[commercial] = {
          contrats: 0,
          primeTotal: 0,
          commissionAnnee1: 0,
        };
      }
      
      revenueByCommercial[commercial].contrats++;
      revenueByCommercial[commercial].primeTotal += contrat.prime_brute_annuelle || 0;
      revenueByCommercial[commercial].commissionAnnee1 += contrat.commissionnement_annee1 || 0;
    });

    const monthlyRevenue: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      if (contrat.contrat_date_creation) {
        const date = new Date(contrat.contrat_date_creation);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = { month: monthKey, primes: 0, commissions: 0 };
        }
        
        monthlyRevenue[monthKey].primes += contrat.prime_brute_annuelle || 0;
        monthlyRevenue[monthKey].commissions += contrat.commissionnement_annee1 || 0;
      }
    });

    const monthlyData = Object.values(monthlyRevenue).sort((a: any, b: any) => a.month.localeCompare(b.month));
    const totalPrimes = filteredContrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0);
    const totalCommissions = filteredContrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0);

    return {
      revenueByCommercial: Object.entries(revenueByCommercial).map(([nom, data]: [string, any]) => ({ nom, ...data }))
        .sort((a, b) => b.commissionAnnee1 - a.commissionAnnee1),
      monthlyData,
      globalMetrics: {
        totalPrimes,
        totalCommissions,
        nbContrats: filteredContrats.length
      }
    };
  }, [contrats, projets, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse des Revenus</h2>
          <p className="text-muted-foreground">Primes et commissions sur la période sélectionnée</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Afficher tout</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">3 derniers mois</SelectItem>
            <SelectItem value="1y">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Nombre de Contrats</p>
                <p className="text-2xl font-bold text-foreground">{revenueAnalytics.globalMetrics.nbContrats}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-bold text-foreground">€{revenueAnalytics.globalMetrics.totalCommissions.toLocaleString()}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Nombre de Contrats</p>
                <p className="text-2xl font-bold text-foreground">{revenueAnalytics.globalMetrics.nbContrats}</p>
            </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Évolution Mensuelle des Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueAnalytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
              <Line type="monotone" dataKey="primes" stroke="#3b82f6" name="Primes" strokeWidth={2} />
              <Line type="monotone" dataKey="commissions" stroke="#10b981" name="Commissions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
