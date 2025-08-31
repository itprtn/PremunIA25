
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BrevoAnalyticsDashboard } from './BrevoAnalyticsDashboard';
import { EmailMonitoringTab } from './EmailMonitoringTab';
import { supabase } from '../lib/supabase';
import {
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface BrevoTrackingInterfaceProps {
  projectId?: number;
}

interface EmailEvent {
  id: number;
  destinataire: string;
  sujet: string;
  statut: string;
  date_envoi?: string;
  date_ouverture?: string;
  date_clic?: string;
  date_bounce?: string;
  campagne_nom?: string;
  contact_nom?: string;
  contact_prenom?: string;
  tracking_id?: string;
}

interface Campaign {
  id: number;
  nom_campagne: string;
  statut: string;
  date_creation: string;
  nombre_envoyes?: number;
  nombre_echecs?: number;
}

export function BrevoTrackingInterface({ projectId }: BrevoTrackingInterfaceProps) {
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [currentView, setCurrentView] = useState('realtime');

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    filterEvents();
  }, [emailEvents, searchTerm, statusFilter, campaignFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadEmailEvents(), loadCampaigns()]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailEvents = async () => {
    try {
      let query = supabase
        .from('envois_email')
        .select(`
          id,
          destinataire,
          sujet,
          statut,
          date_envoi,
          date_ouverture,
          date_clic,
          date_bounce,
          tracking_id,
          contact:contact_id (nom, prenom),
          campagne:campagne_id (nom_campagne)
        `)
        .order('date_envoi', { ascending: false })
        .limit(100);

      if (projectId) {
        query = query.eq('projet_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData: EmailEvent[] = (data || []).map((item: any) => ({
        id: item.id,
        destinataire: item.destinataire,
        sujet: item.sujet || 'Sans sujet',
        statut: item.statut,
        date_envoi: item.date_envoi,
        date_ouverture: item.date_ouverture,
        date_clic: item.date_clic,
        date_bounce: item.date_bounce,
        tracking_id: item.tracking_id,
        contact_nom: item.contact?.nom || item.contact?.[0]?.nom,
        contact_prenom: item.contact?.prenom || item.contact?.[0]?.prenom,
        campagne_nom: item.campagne?.nom_campagne || item.campagne?.[0]?.nom_campagne
      }));

      setEmailEvents(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des événements email:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      let query = supabase
        .from('envois_groupes')
        .select('id, nom_campagne, statut, date_creation, nombre_envoyes, nombre_echecs')
        .order('date_creation', { ascending: false });

      if (projectId) {
        query = query.eq('projet_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
    }
  };

  const filterEvents = () => {
    let filtered = emailEvents;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.contact_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.contact_prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.statut === statusFilter);
    }

    // Filtre par campagne
    if (campaignFilter !== 'all') {
      filtered = filtered.filter(event => event.campagne_nom === campaignFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'envoye':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delivre':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ouvert':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'clic':
        return <MousePointer className="h-4 w-4 text-purple-500" />;
      case 'bounce':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'envoye':
        return 'bg-blue-100 text-blue-800';
      case 'delivre':
        return 'bg-green-100 text-green-800';
      case 'ouvert':
        return 'bg-yellow-100 text-yellow-800';
      case 'clic':
        return 'bg-purple-100 text-purple-800';
      case 'bounce':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const exportToCSV = () => {
    const csvData = filteredEvents.map(event => ({
      'Email destinataire': event.destinataire,
      'Sujet': event.sujet,
      'Statut': event.statut,
      'Contact': `${event.contact_prenom || ''} ${event.contact_nom || ''}`.trim(),
      'Campagne': event.campagne_nom || '',
      'Date envoi': formatDate(event.date_envoi),
      'Date ouverture': formatDate(event.date_ouverture),
      'Date clic': formatDate(event.date_clic),
      'Date bounce': formatDate(event.date_bounce)
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tracking-brevo.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            title: "Total",
            value: emailEvents.length,
            icon: <Mail className="h-5 w-5" />,
            color: "bg-blue-500"
          },
          {
            title: "Délivrés",
            value: emailEvents.filter(e => e.statut === 'delivre').length,
            icon: <CheckCircle className="h-5 w-5" />,
            color: "bg-green-500"
          },
          {
            title: "Ouverts",
            value: emailEvents.filter(e => e.statut === 'ouvert').length,
            icon: <Eye className="h-5 w-5" />,
            color: "bg-yellow-500"
          },
          {
            title: "Clics",
            value: emailEvents.filter(e => e.statut === 'clic').length,
            icon: <MousePointer className="h-5 w-5" />,
            color: "bg-purple-500"
          },
          {
            title: "Bounces",
            value: emailEvents.filter(e => e.statut === 'bounce').length,
            icon: <XCircle className="h-5 w-5" />,
            color: "bg-red-500"
          }
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interface principale avec onglets */}
      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="realtime">Temps réel</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <TabsContent value="realtime" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par email, sujet, contact..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="envoye">Envoyé</SelectItem>
                    <SelectItem value="delivre">Délivré</SelectItem>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="clic">Clic</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes campagnes</SelectItem>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.nom_campagne}>
                        {campaign.nom_campagne}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des événements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Événements email ({filteredEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(event.statut)}
                        <div>
                          <div className="font-medium">{event.destinataire}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {event.sujet}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(event.statut)}>
                        {event.statut}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        {event.contact_nom && (
                          <span>
                            👤 {event.contact_prenom} {event.contact_nom}
                          </span>
                        )}
                        {event.campagne_nom && (
                          <span>
                            📧 {event.campagne_nom}
                          </span>
                        )}
                      </div>
                      <div className="text-xs">
                        {formatDate(event.date_envoi)}
                      </div>
                    </div>

                    {/* Détails des événements */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3 text-yellow-500" />
                        <span>{formatDate(event.date_ouverture)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="h-3 w-3 text-purple-500" />
                        <span>{formatDate(event.date_clic)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span>{formatDate(event.date_bounce)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun événement trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <BrevoAnalyticsDashboard projectId={projectId} />
        </TabsContent>

        <TabsContent value="monitoring">
          <EmailMonitoringTab campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.nom_campagne}</CardTitle>
                    <Badge
                      className={
                        campaign.statut === "en_cours"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {campaign.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-600">
                          {campaign.nombre_envoyes || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Envoyés</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-semibold text-red-600">
                          {campaign.nombre_echecs || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Échecs</div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Créée le {new Date(campaign.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}