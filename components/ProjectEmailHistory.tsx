import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ChevronDown, ChevronUp, Mail, Eye, MousePointer, AlertCircle, Send } from 'lucide-react';

interface ProjectEmailHistoryProps {
  projectId: number;
}

interface EmailHistory {
  id: number;
  destinataire: string;
  statut: string;
  date_envoi?: string;
  date_ouverture?: string;
  date_clic?: string;
  contact_nom?: string;
  contact_prenom?: string;
  campagne_nom?: string;
}

const ProjectEmailHistory: React.FC<ProjectEmailHistoryProps> = ({ projectId }) => {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    delivre: 0,
    ouvert: 0,
    clic: 0,
    openRate: 0,
    clickRate: 0
  });

  useEffect(() => {
    fetchEmailHistory();
  }, [projectId]);

  const fetchEmailHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('envois_email')
        .select(`
          id,
          destinataire,
          statut,
          date_envoi,
          date_ouverture,
          date_clic,
          contact_id,
          campagne_id
        `)
        .eq('projet_id', projectId)
        .in('statut', ['envoye', 'delivre'])  // Only show sent/delivered emails
        .not('date_envoi', 'is', null)  // Only emails with send date
        .order('date_envoi', { ascending: false });  // Most recent first

      if (error) throw error;

      // For now, set empty data since we need to fetch related data separately
      // This will be populated after we fetch contacts and campaigns
      setEmailHistory([]);

      // Calculate statistics from raw data (already filtered to sent/delivered emails)
      const total = data.length;
      const delivre = data.filter(e => e.statut === 'delivre').length;
      const envoye = data.filter(e => e.statut === 'envoye').length;
      const ouvert = data.filter(e => e.statut === 'ouvert').length;
      const clic = data.filter(e => e.statut === 'clic').length;

      // Calculate rates based on delivered emails only (since sent emails haven't been tracked yet)
      const deliveredCount = delivre;
      const openRate = deliveredCount > 0 ? (ouvert / deliveredCount) * 100 : 0;
      const clickRate = deliveredCount > 0 ? (clic / deliveredCount) * 100 : 0;

      setStats({
        total, // Total sent/delivered emails
        delivre,
        ouvert,
        clic,
        openRate,
        clickRate
      });

      // Create formatted data with contact and campaign info
      if (data.length > 0) {
        const formattedData: EmailHistory[] = data.map((item: any) => ({
          id: item.id,
          destinataire: item.destinataire,
          statut: item.statut,
          date_envoi: item.date_envoi,
          date_ouverture: item.date_ouverture,
          date_clic: item.date_clic,
          contact_nom: '',
          contact_prenom: '',
          campagne_nom: ''
        }));

        setEmailHistory(formattedData);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'envoye':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivre':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'ouvert':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'clic':
        return <MousePointer className="h-4 w-4 text-purple-500" />;
      case 'bounce':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Résumé des statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>📧 Suivi des Emails</span>
              <Badge variant="outline" className="text-xs">
                {stats.total} emails
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? 'Masquer' : 'Afficher'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Emails envoyés</div>
              <div className="text-xs text-blue-600">Total traités</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.delivre}</div>
              <div className="text-sm text-green-700">Délivrés</div>
              <div className="text-xs text-green-600">Reçus par destinataire</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.ouvert}</div>
              <div className="text-sm text-yellow-700">Ouverts</div>
              <div className="text-xs text-yellow-600">Consultés par destinataire</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.clic}</div>
              <div className="text-sm text-purple-700">Clics</div>
              <div className="text-xs text-purple-600">Liens cliqués</div>
            </div>
          </div>

          {/* Taux de performance */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux d'ouverture:</span>
              <span className="font-medium">{stats.openRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.openRate} className="h-2" />

            <div className="flex justify-between text-sm">
              <span>Taux de clic:</span>
              <span className="font-medium">{stats.clickRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.clickRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Détail de l'historique */}
      {expanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Détail des Emails Envoyés</span>
              <Badge variant="secondary" className="text-xs">
                Tri chronologique ↓
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emailHistory.map((email, index) => (
                <div key={email.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                  {/* Header with email info and chronological indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        {getStatusIcon(email.statut)}
                        <div>
                          <div className="font-medium text-gray-900">{email.destinataire}</div>
                          {email.contact_prenom && email.contact_nom && (
                            <div className="text-sm text-gray-600">
                              {email.contact_prenom} {email.contact_nom}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(email.statut)}>
                        {email.statut}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(email.date_envoi)}
                      </div>
                      <div className="text-xs text-gray-500">Envoyé</div>
                    </div>
                  </div>

                  {/* Campaign info */}
                  {email.campagne_nom && (
                    <div className="mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        📧 Campagne: {email.campagne_nom}
                      </span>
                    </div>
                  )}

                  {/* Tracking events */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 text-sm">
                    <div className={`p-2 rounded ${email.date_ouverture ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <Eye className={`h-4 w-4 ${email.date_ouverture ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={email.date_ouverture ? 'text-green-700' : 'text-gray-500'}>
                          {email.date_ouverture ? formatDate(email.date_ouverture) : 'Non ouvert'}
                        </span>
                      </div>
                    </div>
                    <div className={`p-2 rounded ${email.date_clic ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <MousePointer className={`h-4 w-4 ${email.date_clic ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className={email.date_clic ? 'text-purple-700' : 'text-gray-500'}>
                          {email.date_clic ? formatDate(email.date_clic) : 'Non cliqué'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {emailHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun email trouvé pour ce projet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectEmailHistory;