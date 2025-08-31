import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Contact, Projet, Contrat } from '../../lib/types';

interface ProductAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function ProductAnalytics({ projets = [], contrats = [] }: ProductAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const productAnalytics = useMemo(() => {
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

    const productPerformance: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      const produit = contrat.contrat_produit || 'Non spécifié';
      if (!productPerformance[produit]) {
        productPerformance[produit] = {
          contrats: 0,
          primeTotal: 0,
          commissionTotal: 0,
        };
      }
      
      productPerformance[produit].contrats++;
      productPerformance[produit].primeTotal += contrat.prime_brute_annuelle || 0;
      productPerformance[produit].commissionTotal += contrat.commissionnement_annee1 || 0;
    });

    const topProduits = Object.entries(productPerformance)
      .map(([nom, data]: [string, any]) => ({ nom, ...data }))
      .sort((a, b) => b.primeTotal - a.primeTotal);

    const companyPerformance: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
        const compagnie = contrat.contrat_compagnie || 'Non spécifiée';
        if(!companyPerformance[compagnie]) {
            companyPerformance[compagnie] = {
                contrats: 0,
                primeTotal: 0,
            }
        }
        companyPerformance[compagnie].contrats++;
        companyPerformance[compagnie].primeTotal += contrat.prime_brute_annuelle || 0;
    });

    const topCompanies = Object.entries(companyPerformance)
        .map(([nom, data]: [string, any]) => ({ nom, ...data}))
        .sort((a,b) => b.primeTotal - a.primeTotal);


    return {
      topProduits,
      topCompanies,
      totalContrats: filteredContrats.length
    };
  }, [contrats, dateRange]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse Produits & Compagnies</h2>
          <p className="text-muted-foreground">Performance par produit et compagnie</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Top Produits par Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productAnalytics.topProduits.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" />
                <YAxis />
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                <Bar dataKey="primeTotal" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Répartition par Compagnie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productAnalytics.topCompanies.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="primeTotal"
                  nameKey="nom"
                >
                  {productAnalytics.topCompanies.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
