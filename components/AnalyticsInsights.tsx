import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface EmailActivity {
  id: number;
  destinataire: string;
  statut: string;
  date_envoi?: string;
  date_ouverture?: string;
  date_clic?: string;
  campagne_id?: number;
}

interface CampaignPerformance {
  id: number;
  nom_campagne: string;
  nombre_destinataires: number;
  nombre_envoyes: number;
  statut: string;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface AnalyticsData {
  totalCampaigns: number;
  totalEmails: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  recentActivity: EmailActivity[];
  topPerformingCampaigns: CampaignPerformance[];
}

const AnalyticsInsights: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Récupérer les statistiques globales
      const { data: campaigns, error: campaignsError } = await supabase
        .from('envois_groupes')
        .select('*')
        .not('brevo_campaign_id', 'is', null);

      if (campaignsError) throw campaignsError;

      // Récupérer les statistiques des emails
      const { data: emails, error: emailsError } = await supabase
        .from('envois_email')
        .select('*');

      if (emailsError) throw emailsError;

      // Calculer les statistiques
      const totalCampaigns = campaigns?.length || 0;
      const totalEmails = emails?.length || 0;
      const totalDelivered = emails?.filter(e => e.statut === 'delivre').length || 0;
      const totalOpened = emails?.filter(e => e.statut === 'ouvert').length || 0;
      const totalClicked = emails?.filter(e => e.statut === 'clic').length || 0;
      const totalBounced = emails?.filter(e => e.statut === 'bounce').length || 0;

      // Calculer les taux
      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
      const bounceRate = totalEmails > 0 ? (totalBounced / totalEmails) * 100 : 0;

      // Campagnes les plus performantes
      const topPerformingCampaigns = campaigns?.map(campaign => {
        const campaignEmails = emails?.filter(e => e.campagne_id === campaign.id) || [];
        const campaignDelivered = campaignEmails.filter(e => e.statut === 'delivre').length;
        const campaignOpened = campaignEmails.filter(e => e.statut === 'ouvert').length;
        const campaignClicked = campaignEmails.filter(e => e.statut === 'clic').length;

        return {
          ...campaign,
          delivered: campaignDelivered,
          opened: campaignOpened,
          clicked: campaignClicked,
          openRate: campaignDelivered > 0 ? (campaignOpened / campaignDelivered) * 100 : 0,
          clickRate: campaignDelivered > 0 ? (campaignClicked / campaignDelivered) * 100 : 0
        };
      }).sort((a, b) => b.openRate - a.openRate).slice(0, 5) || [];

      // Activité récente (emails avec dates)
      const recentActivity = emails
        ?.filter(e => e.date_envoi || e.date_ouverture || e.date_clic)
        .sort((a, b) => {
          const dateA = new Date(a.date_envoi || a.date_ouverture || a.date_clic || 0);
          const dateB = new Date(b.date_envoi || b.date_ouverture || b.date_clic || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10) || [];

      setAnalytics({
        totalCampaigns,
        totalEmails,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        openRate,
        clickRate,
        bounceRate,
        recentActivity,
        topPerformingCampaigns
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics & Insights</h1>
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Analytics & Insights</h1>
        <p className="text-gray-600">Statistiques détaillées de vos campagnes email Brevo</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campagnes Totales</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Campagnes Brevo importées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Ouverture</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalOpened} ouvertures sur {analytics.totalDelivered} délivrés
            </p>
            <Progress value={analytics.openRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Clic</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalClicked} clics sur {analytics.totalDelivered} délivrés
            </p>
            <Progress value={analytics.clickRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Bounce</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalBounced} bounces sur {analytics.totalEmails} envoyés
            </p>
            <Progress value={analytics.bounceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Campagnes les plus performantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Campagnes les Plus Performantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformingCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <h4 className="font-medium truncate">{campaign.nom_campagne}</h4>
                    </div>
                    <div className="text-sm text-gray-600">
                      {campaign.delivered} délivrés • {campaign.opened} ouverts • {campaign.clicked} clics
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {campaign.openRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Taux ouverture</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activity.statut === 'delivre' ? 'default' :
                          activity.statut === 'ouvert' ? 'secondary' :
                          activity.statut === 'clic' ? 'outline' :
                          'destructive'
                        }
                      >
                        {activity.statut}
                      </Badge>
                      <span className="text-sm text-gray-600 truncate">
                        {activity.destinataire}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.date_envoi && `Envoyé: ${new Date(activity.date_envoi).toLocaleDateString()}`}
                      {activity.date_ouverture && `Ouvert: ${new Date(activity.date_ouverture).toLocaleDateString()}`}
                      {activity.date_clic && `Cliqué: ${new Date(activity.date_clic).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Répartition des Statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Délivrés</span>
                <span className="font-medium">{analytics.totalDelivered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ouverts</span>
                <span className="font-medium">{analytics.totalOpened}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clics</span>
                <span className="font-medium">{analytics.totalClicked}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bounces</span>
                <span className="font-medium text-red-600">{analytics.totalBounced}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Performance Globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ouvertures</span>
                  <span>{analytics.openRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.openRate} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Clics</span>
                  <span>{analytics.clickRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.clickRate} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Qualité</span>
                  <span>{(100 - analytics.bounceRate).toFixed(1)}%</span>
                </div>
                <Progress value={100 - analytics.bounceRate} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Emails:</span>
                <span className="font-medium">{analytics.totalEmails}</span>
              </div>
              <div className="flex justify-between">
                <span>Taux de délivrabilité:</span>
                <span className="font-medium">
                  {analytics.totalEmails > 0 ? ((analytics.totalDelivered / analytics.totalEmails) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Conversion clic:</span>
                <span className="font-medium">
                  {analytics.totalOpened > 0 ? ((analytics.totalClicked / analytics.totalOpened) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Campagnes actives:</span>
                <span className="font-medium">{analytics.totalCampaigns}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsInsights;