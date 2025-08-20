import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { Contact, Projet, Contrat } from '../../lib/types';

interface PipelineAnalyticsAdvancedProps {
  projets: Projet[];
  contrats: Contrat[];
  contacts: Contact[];
}

export function PipelineAnalyticsAdvanced({ projets = [], contrats = [], contacts = [] }: PipelineAnalyticsAdvancedProps) {
  const [dateRange, setDateRange] = useState('all');
  const [commercialFilter, setCommercialFilter] = useState('all');

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

    const commercialFilterFn = (projet: Projet) => {
      return commercialFilter === 'all' || projet.commercial === commercialFilter;
    };

    const filteredProjets = projets.filter(p => dateFilter(p.date_creation) && commercialFilterFn(p));
    const filteredContrats = contrats.filter(c => dateFilter(c.contrat_date_creation));

    // Pipeline stages avec mapping des statuts
    const pipelineStages = [
      { stage: 'Nouveau', statuts: ['Nouveau', 'Contact initial'], color: '#3b82f6' },
      { stage: 'Qualification', statuts: ['Qualification', 'Analyse'], color: '#f59e0b' },
      { stage: 'Proposition', statuts: ['Devis envoyé', 'Proposition'], color: '#8b5cf6' },
      { stage: 'Négociation', statuts: ['Négociation', 'En cours'], color: '#ef4444' },
      { stage: 'Closing', statuts: ['Signature', 'Finalisation'], color: '#10b981' },
      { stage: 'Gagné', statuts: ['Terminé', 'Signé', 'Actif'], color: '#059669' },
      { stage: 'Perdu', statuts: ['Perdu', 'Annulé', 'Refusé'], color: '#dc2626' }
    ];

    // Calcul des métriques par étape
    const stageData = pipelineStages.map(stage => {
      const stageProjects = filteredProjets.filter(p => 
        stage.statuts.some(statut => 
          p.statut?.toLowerCase().includes(statut.toLowerCase())
        )
      );
      
      const stageValue = stageProjects.reduce((sum, p) => {
        const contrat = filteredContrats.find(c => c.projet_id === p.projet_id);
        return sum + (contrat?.prime_brute_annuelle || 0);
      }, 0);

      return {
        stage: stage.stage,
        count: stageProjects.length,
        value: stageValue,
        color: stage.color,
        projects: stageProjects
      };
    });

    // Funnel data pour le graphique
    const funnelData = stageData
      .filter(stage => stage.count > 0 && !['Perdu'].includes(stage.stage))
      .map(stage => ({
        name: stage.stage,
        value: stage.count,
        fill: stage.color
      }));

    // Évolution mensuelle
    const monthlyEvolution = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthProjects = filteredProjets.filter(p => {
        if (!p.date_creation) return false;
        const projectDate = new Date(p.date_creation);
        return projectDate.getFullYear() === date.getFullYear() && 
               projectDate.getMonth() === date.getMonth();
      });

      const monthContracts = filteredContrats.filter(c => {
        if (!c.contrat_date_creation) return false;
        const contractDate = new Date(c.contrat_date_creation);
        return contractDate.getFullYear() === date.getFullYear() && 
               contractDate.getMonth() === date.getMonth();
      });

      monthlyEvolution.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        nouveauxProjets: monthProjects.length,
        contratsSignes: monthContracts.length,
        revenus: monthContracts.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)
      });
    }

    // Performance par commercial
    const commercialPerformance = Array.from(new Set(filteredProjets.map(p => p.commercial).filter(Boolean)))
      .map(commercial => {
        const commercialProjects = filteredProjets.filter(p => p.commercial === commercial);
        const commercialContracts = filteredContrats.filter(c => 
          commercialProjects.some(p => p.projet_id === c.projet_id)
        );
        
        return {
          commercial,
          projets: commercialProjects.length,
          contrats: commercialContracts.length,
          revenus: commercialContracts.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0),
          tauxConversion: commercialProjects.length > 0 ? 
            (commercialContracts.length / commercialProjects.length) * 100 : 0
        };
      })
      .sort((a, b) => b.revenus - a.revenus);

    // Métriques globales
    const totalProjets = filteredProjets.length;
    const projetsSignes = filteredContrats.length;
    const tauxConversionGlobal = totalProjets > 0 ? (projetsSignes / totalProjets) * 100 : 0;
    const revenuTotal = filteredContrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0);
    const revenuMoyen = projetsSignes > 0 ? revenuTotal / projetsSignes : 0;

    // Durée moyenne de conversion
    const dureeConversion = filteredContrats
      .filter(c => c.contrat_date_creation)
      .map(c => {
        const projet = filteredProjets.find(p => p.projet_id === c.projet_id);
        if (!projet?.date_creation) return null;
        
        const debut = new Date(projet.date_creation);
        const fin = new Date(c.contrat_date_creation!);
        return Math.floor((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
      })
      .filter(Boolean);
    
    const dureeMoyenne = dureeConversion.length > 0 ? 
      dureeConversion.reduce((sum, d) => sum + (d as number), 0) / dureeConversion.length : 0;

    return {
      stageData,
      funnelData,
      monthlyEvolution,
      commercialPerformance,
      metrics: {
        totalProjets,
        projetsSignes,
        tauxConversionGlobal,
        revenuTotal,
        revenuMoyen,
        dureeMoyenne
      }
    };
  }, [projets, contrats, dateRange, commercialFilter]);

  const commercials = useMemo(() => {
    return Array.from(new Set(projets.map(p => p.commercial).filter(Boolean))).sort();
  }, [projets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pipeline Analytics Avancé</h2>
          <p className="text-muted-foreground">Analyse détaillée de votre entonnoir commercial</p>
        </div>
        <div className="flex gap-4">
          <Select value={commercialFilter} onValueChange={setCommercialFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les commerciaux</SelectItem>
              {commercials.map(commercial => (
                <SelectItem key={commercial} value={commercial}>{commercial}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute période</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">3 derniers mois</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Projets</div>
            <div className="text-2xl font-bold text-foreground">{pipelineAnalytics.metrics.totalProjets}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Contrats Signés</div>
            <div className="text-2xl font-bold text-foreground">{pipelineAnalytics.metrics.projetsSignes}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Taux Conversion</div>
            <div className="text-2xl font-bold text-foreground">{pipelineAnalytics.metrics.tauxConversionGlobal.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">CA Total</div>
            <div className="text-2xl font-bold text-foreground">€{(pipelineAnalytics.metrics.revenuTotal / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Durée Moy.</div>
            <div className="text-2xl font-bold text-foreground">{Math.round(pipelineAnalytics.metrics.dureeMoyenne)}j</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entonnoir de conversion */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Entonnoir de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip formatter={(value) => [`${value} projets`, 'Nombre']} />
                <Funnel
                  dataKey="value"
                  data={pipelineAnalytics.funnelData}
                  isAnimationActive
                >
                  <LabelList position="center" fill="#fff" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par étape */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Répartition Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={pipelineAnalytics.stageData.filter(s => s.count > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ stage, count }) => `${stage}: ${count}`}
                >
                  {pipelineAnalytics.stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution mensuelle */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Évolution Mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineAnalytics.monthlyEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="nouveauxProjets" fill="#3b82f6" name="Nouveaux Projets" />
              <Bar dataKey="contratsSignes" fill="#10b981" name="Contrats Signés" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance par commercial */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Performance Commerciale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineAnalytics.commercialPerformance.map((commercial, index) => (
              <div key={commercial.commercial} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{commercial.commercial}</div>
                    <div className="text-sm text-muted-foreground">
                      {commercial.projets} projets • {commercial.contrats} contrats
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">€{(commercial.revenus / 1000).toFixed(0)}k</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {commercial.tauxConversion.toFixed(1)}%
                    </div>
                    <Progress 
                      value={commercial.tauxConversion} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détail par étape */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Détail Pipeline par Étape</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineAnalytics.stageData.filter(s => s.count > 0).map((stage) => (
              <div key={stage.stage} className="p-4 border rounded-lg" style={{ borderColor: stage.color }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium" style={{ color: stage.color }}>
                    {stage.stage}
                  </div>
                  <Badge variant="outline">{stage.count}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Valeur: €{(stage.value / 1000).toFixed(0)}k
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Moy: €{stage.count > 0 ? ((stage.value / stage.count) / 1000).toFixed(1) : 0}k/projet
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}