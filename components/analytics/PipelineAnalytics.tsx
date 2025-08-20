import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { Contact, Projet, Contrat } from '../../lib/types';

interface PipelineAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function PipelineAnalytics({ projets = [], contrats = [] }: PipelineAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const pipelineAnalytics = useMemo(() => {
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

    const filteredProjets = projets.filter(p => dateFilter(p.date_creation));
    const filteredContrats = contrats.filter(c => dateFilter(c.contrat_date_creation));

    const statutCounts: { [key: string]: any } = {};
    filteredProjets.forEach(projet => {
      const statut = projet.statut || 'Non défini';
      statutCounts[statut] = (statutCounts[statut] || 0) + 1;
    });

    const pipelineOrder = [
      'Nouveau',
      'Projet à traiter',
      'Devis envoyé',
      'Contrat enregistré',
      'Perdu',
    ];

    const funnelData = pipelineOrder
      .map(statut => ({
        name: statut,
        value: statutCounts[statut] || 0,
        fill: getStatusColor(statut)
      }))
      .filter(item => item.value > 0);

    const totalProjets = filteredProjets.length;
    const projetsSignes = filteredContrats.length;
    const tauxConversion = totalProjets > 0 ? (projetsSignes / totalProjets) * 100 : 0;

    return {
      funnelData,
      totalProjets,
      projetsSignes,
      tauxConversion
    };
  }, [projets, dateRange]);

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Nouveau': '#3b82f6',
      'Projet à traiter': '#f59e0b',
      'Devis envoyé': '#8b5cf6',
      'Contrat enregistré': '#10b981',
      'Perdu': '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse du Pipeline Commercial</h2>
          <p className="text-muted-foreground">Suivi des opportunités et entonnoir de conversion</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Projets</p>
                <p className="text-2xl font-bold text-foreground">{pipelineAnalytics.totalProjets}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Contrats Signés</p>
                <p className="text-2xl font-bold text-foreground">{pipelineAnalytics.projetsSignes}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Taux de Conversion</p>
                <p className="text-2xl font-bold text-foreground">{pipelineAnalytics.tauxConversion.toFixed(1)}%</p>
            </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Entonnoir de Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={pipelineAnalytics.funnelData}
                isAnimationActive
              >
                <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
