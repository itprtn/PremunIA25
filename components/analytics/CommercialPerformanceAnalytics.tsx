import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Contact, Projet, Contrat } from '../../lib/types';

interface CommercialPerformanceAnalyticsProps {
  contacts: Contact[];
  projets: Projet[];
  contrats: Contrat[];
}

export function CommercialPerformanceAnalytics({ contacts = [], projets = [], contrats = [] }: CommercialPerformanceAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const performanceAnalytics = useMemo(() => {
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

    const commercialData: { [key: string]: any } = {};

    filteredProjets.forEach(projet => {
      const commercial = projet.commercial || 'Non attribué';
      if (!commercialData[commercial]) {
        commercialData[commercial] = {
          projets: 0,
          contrats: 0,
          chiffreAffaires: 0,
          commissions: 0,
          projetsParStatut: {}
        };
      }
      commercialData[commercial].projets++;
      const statut = projet.statut || 'Non défini';
      commercialData[commercial].projetsParStatut[statut] = (commercialData[commercial].projetsParStatut[statut] || 0) + 1;
    });

    filteredContrats.forEach(contrat => {
        const projet = projets.find(p => p.projet_id === contrat.projet_id);
        if (projet) {
            const commercial = projet.commercial || 'Non attribué';
            if (commercialData[commercial]) {
                commercialData[commercial].contrats++;
                commercialData[commercial].chiffreAffaires += contrat.prime_brute_annuelle || 0;
                commercialData[commercial].commissions += contrat.commissionnement_annee1 || 0;
            }
        }
    });

    const leaderboard = Object.entries(commercialData).map(([nom, data]: [string, any]) => {
      const tauxConversion = data.projets > 0 ? (data.contrats / data.projets) * 100 : 0;
      const caMoyenParContrat = data.contrats > 0 ? data.chiffreAffaires / data.contrats : 0;
      const score = (data.chiffreAffaires / 1000) + (data.contrats * 10) + tauxConversion;
      
      return {
        nom,
        ...data,
        tauxConversion,
        caMoyenParContrat,
        score: Math.round(score)
      };
    }).sort((a, b) => b.score - a.score);

    const globalMetrics = {
      totalCommerciaux: Object.keys(commercialData).length,
      topPerformer: leaderboard[0]?.nom || 'N/A',
      totalCA: leaderboard.reduce((sum, c) => sum + c.chiffreAffaires, 0),
      totalContrats: leaderboard.reduce((sum, c) => sum + c.contrats, 0)
    };

    return { leaderboard, globalMetrics };
  }, [projets, contrats, dateRange]);

  const radarData = useMemo(() => {
    return performanceAnalytics.leaderboard.slice(0, 5).map(c => ({
      subject: c.nom,
      A: c.chiffreAffaires / 1000, // CA in K€
      B: c.tauxConversion,
      C: c.contrats,
      fullMark: 100
    }));
  }, [performanceAnalytics]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance des Commerciaux</h2>
          <p className="text-muted-foreground">Analyse de la performance individuelle et d'équipe.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                <p className="text-2xl font-bold text-foreground">{performanceAnalytics.globalMetrics.topPerformer}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires Total</p>
                <p className="text-2xl font-bold text-foreground">€{performanceAnalytics.globalMetrics.totalCA.toLocaleString()}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Contrats Signés</p>
                <p className="text-2xl font-bold text-foreground">{performanceAnalytics.globalMetrics.totalContrats}</p>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Commerciaux Actifs</p>
                <p className="text-2xl font-bold text-foreground">{performanceAnalytics.globalMetrics.totalCommerciaux}</p>
            </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Classement des Commerciaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceAnalytics.leaderboard.map((commercial, index) => (
              <div key={commercial.nom} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-foreground">{commercial.nom}</h4>
                  </div>
                  <Badge>Score: {commercial.score}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{commercial.projets}</div>
                    <div className="text-xs text-muted-foreground">Projets</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{commercial.contrats}</div>
                    <div className="text-xs text-muted-foreground">Contrats</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{commercial.tauxConversion.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Conversion</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">€{commercial.chiffreAffaires.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Chiffre d'Affaires</div>
                  </div>
                </div>
                <Progress value={commercial.tauxConversion} className="mt-3 h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
            <CardHeader>
                <CardTitle>Chiffre d'Affaires par Commercial</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceAnalytics.leaderboard}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nom" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                        <Bar dataKey="chiffreAffaires" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="card-glow">
            <CardHeader>
                <CardTitle>Profil de Performance (Top 5)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
