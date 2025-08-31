import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Building,
  RefreshCw,
  Users,
  Euro,
  MapPin,
  Globe,
  Facebook,
  Smartphone,
  Monitor,
  Award,
  Activity,
  Target,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Interface pour les données de contrats
interface ContractData {
  contrat_id?: string;
  prime_brute_mensuelle?: number;
  commissionnement_annee1?: number;
  commissionnement_autres_annees?: number;
  projet_provenance?: string;
  projet_statut?: string;
  contrat_statut?: string;
  contact_code_postal?: string;
  contact_ville?: string;
  contrat_compagnie?: string;
  projet?: {
    projet_id?: string;
    commercial?: string;
    compagnie?: string;
    date_creation?: string;
  };
  projets?: {
    projet_id?: string;
    commercial?: string;
    date_creation?: string;
    date_souscription?: string;
    origine?: string;
  };
}

// Interface pour les métriques de commissions
interface CommissionMetrics {
  total_commissions_annee1: number;
  total_commissions_recurrentes: number;
  total_primes_brutes: number;
  nombre_total_contrats: number;
  commission_moyenne_par_mois: number;

  commissions_par_commercial: Record<string, {
    commission_annee1: number;
    commission_recurrente: number;
    nombre_contrats: number;
    taux_commission_moyen: number;
    primes_totales: number;
  }>;

  commissions_par_compagnie: Record<string, {
    commission_annee1: number;
    commission_recurrente: number;
    nombre_contrats: number;
    taux_commission_moyen: number;
    primes_totales: number;
  }>;

  commissions_par_origine: Record<string, {
    commission_annee1: number;
    commission_recurrente: number;
    nombre_contrats: number;
    pourcentage: number;
  }>;

  commissions_par_departement: Record<string, {
    commission_annee1: number;
    commission_recurrente: number;
    nombre_contrats: number;
    pourcentage: number;
    compagnies: Record<string, {
      nombre_contrats: number;
      commission_annee1: number;
      commission_recurrente: number;
    }>;
  }>;
}

// Interface pour les métriques détaillées par département
interface DepartmentMetrics {
  departement: string;
  nombre_contrats: number;
  commission_annee1: number;
  commission_recurrente: number;
  pourcentage_contrats: number;
  pourcentage_commissions: number;
  compagnies_top: Array<{
    nom: string;
    nombre_contrats: number;
    commission_annee1: number;
  }>;
  origines_top: Array<{
    nom: string;
    nombre_contrats: number;
    commission_annee1: number;
  }>;
}


// Interface pour les statistiques de commissions
interface CommissionStats {
  total_commissions_mensuelles: number;
  total_commissions_annuelles: number;
  total_commissions_recurrentes: number;
  commissions_par_compagnie: Record<string, {
    commission_mensuelle: number;
    commission_annuelle: number;
    nombre_contrats: number;
    taux_commission: number;
    prime_totale_mensuelle: number;
    prime_totale_annuelle: number;
  }>;
  commissions_par_commercial: Record<string, {
    commission_mensuelle: number;
    commission_annuelle: number;
    nombre_contrats: number;
    taux_commission: number;
  }>;
  taux_conversion_mensuel: number;
  nombre_total_contrats: number;
  date_derniere_mise_a_jour: string;
}


export const CommissionsAnalyticsTab: React.FC = () => {
  // États principaux
  const [metrics, setMetrics] = useState<CommissionMetrics | null>(null);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [rawContrats, setRawContrats] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [selectedCommercial, setSelectedCommercial] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedDepartement, setSelectedDepartement] = useState<string>('all');

  // Fonction utilitaire pour formater la monnaie
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Fonction pour obtenir le taux de commission par défaut
  const getCommissionRate = (commercial: string): number => {
    if (commercial.includes('SNOUSSI ZOUH')) return 0.306;
    if (commercial.includes('Radhia MAATOUG')) return 0.274;
    if (commercial.includes('Qualite premunia')) return 0.263;
    if (commercial.includes('KHRIBI Mariem')) return 0.279;
    if (commercial.includes('HADIR SFAR')) return 0.332;
    if (commercial.includes('Gestion PREM')) return 0.287;
    if (commercial.includes('DAHMANI Mouna')) return 0.269;
    if (commercial.includes('CHAOUABI CH')) return 0.300;
    if (commercial.includes('0') || commercial === '') return 0.087;
    return 0.03;
  };

  // Fonction pour normaliser le taux de commission depuis la base de données
  const normalizeCommissionRate = (rawRate: number | null | undefined, commercial: string): number => {
    if (!rawRate || rawRate === 0) {
      return getCommissionRate(commercial);
    }

    // Si la valeur > 1, c'est probablement un pourcentage (30 pour 30%)
    // Si la valeur <= 1, c'est probablement déjà un décimal (0.3 pour 30%)
    if (rawRate > 1) {
      return rawRate / 100; // Convertir 30% en 0.3
    } else {
      return rawRate; // Déjà en format décimal
    }
  };

  // Fonction pour normaliser les origines selon les nouvelles règles
  const normalizeOrigin = (origine: string): string => {
    const origineLower = origine.toLowerCase();

    // Facebook (regrouper fb, facebook, site)
    if (origineLower.includes('fb') || origineLower.includes('facebook') || origineLower.includes('site')) {
      return 'Facebook';
    }

    // TikTok (garder tel quel)
    if (origineLower.includes('tiktok') || origineLower.includes('tik')) {
      return 'TikTok';
    }

    // Prescription (nouveau groupe pour les prescriptions médicales)
    if (origineLower.includes('prescription') || origineLower.includes('medecin') || origineLower.includes('docteur') ||
        origineLower.includes('hopital') || origineLower.includes('clinique') || origineLower.includes('pharmacie')) {
      return 'Prescription';
    }

    // Backoffice (toutes les autres origines)
    return 'Backoffice';
  };

  // Fonction principale de calcul des métriques
  const calculateCommissionMetrics = (contrats: ContractData[]): CommissionMetrics => {
    const cancelledStatuses = ['annulé', 'annule', 'perdu', 'refusé', 'résilié'];

    let totalCommissionsAnnee1 = 0;
    let totalCommissionsRecurrentes = 0;
    let totalPrimesBrutes = 0;
    let nombreTotalContrats = 0;

    const commissionsParCommercial: Record<string, {
      commission_annee1: number;
      commission_recurrente: number;
      nombre_contrats: number;
      taux_commission_moyen: number;
      primes_totales: number;
    }> = {};

    const commissionsParCompagnie: Record<string, {
      commission_annee1: number;
      commission_recurrente: number;
      nombre_contrats: number;
      taux_commission_moyen: number;
      primes_totales: number;
    }> = {};

    const commissionsParOrigine: Record<string, {
      commission_annee1: number;
      commission_recurrente: number;
      nombre_contrats: number;
      pourcentage: number;
    }> = {};

    const commissionsParDepartement: Record<string, {
      commission_annee1: number;
      commission_recurrente: number;
      nombre_contrats: number;
      pourcentage: number;
      compagnies: Record<string, {
        nombre_contrats: number;
        commission_annee1: number;
        commission_recurrente: number;
      }>;
    }> = {};

    contrats.forEach((contrat) => {
      const statutProjet = contrat.projet_statut || contrat.contrat_statut || 'N/A';
      const statutLower = statutProjet.toLowerCase();

      // Ignorer les contrats annulés pour les métriques principales
      const isCancelled = cancelledStatuses.some(status =>
        statutLower.includes(status)
      );

      if (isCancelled || statutProjet === 'N/A') {
        return;
      }

      const compagnie = contrat.contrat_compagnie || contrat.projet?.compagnie || 'N/A';
      const commercial = contrat.projet?.commercial || contrat.projets?.commercial || 'N/A';
      const origineRaw = contrat.projet_provenance || contrat.projets?.origine || 'Non spécifié';
      const origine = normalizeOrigin(origineRaw); // Normaliser l'origine
      const codePostal = contrat.contact_code_postal;
      const ville = contrat.contact_ville?.toLowerCase();

      // Déterminer le département
      let departement = 'Métropole';
      if (codePostal) {
        if (codePostal.startsWith('974')) departement = 'La Réunion';
        else if (codePostal.startsWith('972')) departement = 'Martinique';
        else if (codePostal.startsWith('973')) departement = 'Guyane';
        else if (codePostal.startsWith('971')) departement = 'Guadeloupe';
        else if (codePostal.startsWith('976')) departement = 'Mayotte';
        else if (codePostal.startsWith('987')) departement = 'Polynésie Française';
        else if (codePostal.startsWith('988')) departement = 'Nouvelle-Calédonie';
      }

      const primeMensuelle = contrat.prime_brute_mensuelle || 0;
      const tauxCommissionAnnee1 = normalizeCommissionRate(contrat.commissionnement_annee1, commercial);
      const tauxCommissionRecurrente = normalizeCommissionRate(contrat.commissionnement_autres_annees, commercial);

      if (primeMensuelle <= 0) return;

      // Calcul des commissions selon la formule fournie (montant annuel)
      const commissionMensuelle = (primeMensuelle * tauxCommissionAnnee1) * 0.875;
      const commissionRecurrenteMensuelle = (primeMensuelle * tauxCommissionRecurrente) * 0.875;
      const commissionAnnee1 = commissionMensuelle * 12; // Montant annuel année 1
      const commissionRecurrente = commissionRecurrenteMensuelle * 12; // Montant annuel récurrent

      // Log pour vérifier les calculs
      if (commissionAnnee1 > 0) {
        console.log(`CALCUL COMMISSION [${commercial}] - Prime: ${primeMensuelle}€, Taux: ${(tauxCommissionAnnee1 * 100).toFixed(1)}%, Mensuelle: ${commissionMensuelle.toFixed(2)}€, Annuelle: ${commissionAnnee1.toFixed(2)}€`);
      }

      // Accumuler les totaux
      totalCommissionsAnnee1 += commissionAnnee1;
      totalCommissionsRecurrentes += commissionRecurrente;
      totalPrimesBrutes += primeMensuelle;
      nombreTotalContrats++;

      // Par commercial
      if (!commissionsParCommercial[commercial]) {
        commissionsParCommercial[commercial] = {
          commission_annee1: 0,
          commission_recurrente: 0,
          nombre_contrats: 0,
          taux_commission_moyen: 0,
          primes_totales: 0
        };
      }
      commissionsParCommercial[commercial].commission_annee1 += commissionAnnee1;
      commissionsParCommercial[commercial].commission_recurrente += commissionRecurrente;
      commissionsParCommercial[commercial].nombre_contrats++;
      commissionsParCommercial[commercial].primes_totales += primeMensuelle;
      commissionsParCommercial[commercial].taux_commission_moyen = tauxCommissionAnnee1;

      // Par compagnie
      if (!commissionsParCompagnie[compagnie]) {
        commissionsParCompagnie[compagnie] = {
          commission_annee1: 0,
          commission_recurrente: 0,
          nombre_contrats: 0,
          taux_commission_moyen: 0,
          primes_totales: 0
        };
      }
      commissionsParCompagnie[compagnie].commission_annee1 += commissionAnnee1;
      commissionsParCompagnie[compagnie].commission_recurrente += commissionRecurrente;
      commissionsParCompagnie[compagnie].nombre_contrats++;
      commissionsParCompagnie[compagnie].primes_totales += primeMensuelle;
      commissionsParCompagnie[compagnie].taux_commission_moyen = tauxCommissionAnnee1;

      // Par origine
      if (!commissionsParOrigine[origine]) {
        commissionsParOrigine[origine] = {
          commission_annee1: 0,
          commission_recurrente: 0,
          nombre_contrats: 0,
          pourcentage: 0
        };
      }
      commissionsParOrigine[origine].commission_annee1 += commissionAnnee1;
      commissionsParOrigine[origine].commission_recurrente += commissionRecurrente;
      commissionsParOrigine[origine].nombre_contrats++;

      // Par département
      if (!commissionsParDepartement[departement]) {
        commissionsParDepartement[departement] = {
          commission_annee1: 0,
          commission_recurrente: 0,
          nombre_contrats: 0,
          pourcentage: 0,
          compagnies: {}
        };
      }

      // Ajouter les données de compagnie par département
      if (!commissionsParDepartement[departement].compagnies[compagnie]) {
        commissionsParDepartement[departement].compagnies[compagnie] = {
          nombre_contrats: 0,
          commission_annee1: 0,
          commission_recurrente: 0
        };
      }
      commissionsParDepartement[departement].compagnies[compagnie].nombre_contrats++;
      commissionsParDepartement[departement].compagnies[compagnie].commission_annee1 += commissionAnnee1;
      commissionsParDepartement[departement].compagnies[compagnie].commission_recurrente += commissionRecurrente;
      commissionsParDepartement[departement].commission_annee1 += commissionAnnee1;
      commissionsParDepartement[departement].commission_recurrente += commissionRecurrente;
      commissionsParDepartement[departement].nombre_contrats++;
    });

    // Calculer les pourcentages
    const totalOrigines = Object.values(commissionsParOrigine).reduce((sum, orig) => sum + orig.commission_annee1, 0);
    Object.keys(commissionsParOrigine).forEach(origine => {
      commissionsParOrigine[origine].pourcentage = totalOrigines > 0 ? (commissionsParOrigine[origine].commission_annee1 / totalOrigines) * 100 : 0;
    });

    const totalDepartements = Object.values(commissionsParDepartement).reduce((sum, dept) => sum + dept.commission_annee1, 0);
    Object.keys(commissionsParDepartement).forEach(dept => {
      commissionsParDepartement[dept].pourcentage = totalDepartements > 0 ? (commissionsParDepartement[dept].commission_annee1 / totalDepartements) * 100 : 0;
    });

    // Calculer la commission moyenne par mois (sur les mois réels disponibles)
    const moisUniques = new Set<string>();
    contrats.forEach((contrat) => {
      const dateSouscription = contrat.projets?.date_souscription || contrat.projet?.date_creation;
      if (dateSouscription) {
        const date = new Date(dateSouscription);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        moisUniques.add(monthKey);
      }
    });
    const nombreMois = moisUniques.size;
    const commissionMoyenneParMois = nombreMois > 0 ? totalCommissionsAnnee1 / nombreMois : 0;

    return {
      total_commissions_annee1: totalCommissionsAnnee1,
      total_commissions_recurrentes: totalCommissionsRecurrentes,
      total_primes_brutes: totalPrimesBrutes,
      nombre_total_contrats: nombreTotalContrats,
      commission_moyenne_par_mois: commissionMoyenneParMois,
      commissions_par_commercial: commissionsParCommercial,
      commissions_par_compagnie: commissionsParCompagnie,
      commissions_par_origine: commissionsParOrigine,
      commissions_par_departement: commissionsParDepartement
    };
  };


  // Fonctions utilitaires pour les filtres
  const getUniqueCommercials = (contrats: ContractData[]): string[] => {
    const commercials = new Set<string>();
    contrats.forEach(contrat => {
      const commercial = contrat.projet?.commercial || contrat.projets?.commercial;
      if (commercial && commercial !== 'N/A') {
        commercials.add(commercial);
      }
    });
    return Array.from(commercials).sort();
  };

  const formatMonth = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const getUniqueMonths = (contrats: ContractData[]): string[] => {
    const months = new Set<string>();
    contrats.forEach(contrat => {
      const dateSouscription = contrat.projets?.date_souscription ||
                               contrat.projet?.date_creation;
      if (dateSouscription) {
        const date = new Date(dateSouscription);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse(); // Plus récent en premier
  };

  const getUniqueOrigins = (): string[] => {
    return ['Facebook', 'Backoffice', 'Prescription', 'TikTok'];
  };

  const getUniqueDepartements = (contrats: ContractData[]): string[] => {
    const departements = new Set<string>();
    contrats.forEach(contrat => {
      const codePostal = contrat.contact_code_postal;
      let departement = 'Métropole';
      if (codePostal) {
        if (codePostal.startsWith('974')) departement = 'La Réunion';
        else if (codePostal.startsWith('972')) departement = 'Martinique';
        else if (codePostal.startsWith('973')) departement = 'Guyane';
        else if (codePostal.startsWith('971')) departement = 'Guadeloupe';
        else if (codePostal.startsWith('976')) departement = 'Mayotte';
        else if (codePostal.startsWith('987')) departement = 'Polynésie Française';
        else if (codePostal.startsWith('988')) departement = 'Nouvelle-Calédonie';
      }
      departements.add(departement);
    });
    return Array.from(departements).sort();
  };

  // Fonction pour appliquer les filtres
  const applyFilters = (contrats: ContractData[]): ContractData[] => {
    let filteredContrats = contrats;

    // Filtrer par commercial
    if (selectedCommercial !== 'all') {
      filteredContrats = filteredContrats.filter(contrat => {
        const commercial = contrat.projet?.commercial || contrat.projets?.commercial || 'N/A';
        return commercial === selectedCommercial;
      });
    }

    // Filtrer par mois
    if (selectedMonth !== 'all') {
      filteredContrats = filteredContrats.filter(contrat => {
        const dateSouscription = contrat.projets?.date_souscription ||
                                 contrat.projet?.date_creation;
        if (dateSouscription) {
          const date = new Date(dateSouscription);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return monthKey === selectedMonth;
        }
        return false;
      });
    }

    // Filtrer par origine
    if (selectedOrigin !== 'all') {
      filteredContrats = filteredContrats.filter(contrat => {
        const origineRaw = contrat.projet_provenance || contrat.projets?.origine || 'Non spécifié';
        const origine = normalizeOrigin(origineRaw);
        return origine === selectedOrigin;
      });
    }

    // Filtrer par département
    if (selectedDepartement !== 'all') {
      filteredContrats = filteredContrats.filter(contrat => {
        const codePostal = contrat.contact_code_postal;
        let departement = 'Métropole';
        if (codePostal) {
          if (codePostal.startsWith('974')) departement = 'La Réunion';
          else if (codePostal.startsWith('972')) departement = 'Martinique';
          else if (codePostal.startsWith('973')) departement = 'Guyane';
          else if (codePostal.startsWith('971')) departement = 'Guadeloupe';
          else if (codePostal.startsWith('976')) departement = 'Mayotte';
          else if (codePostal.startsWith('987')) departement = 'Polynésie Française';
          else if (codePostal.startsWith('988')) departement = 'Nouvelle-Calédonie';
        }
        return departement === selectedDepartement;
      });
    }

    return filteredContrats;
  };

  // Fonction pour charger les données
  const loadCommissionData = async () => {
    setLoading(true);
    try {
      // Récupérer tous les contrats de la table contrats
      const { data: contrats, error } = await supabase
        .from('contrats')
        .select(`
          *,
          projets(
            projet_id,
            commercial,
            date_creation,
            date_souscription,
            origine
          )
        `);

      if (error) {
        console.error('Erreur chargement contrats:', error);
        setError('Erreur lors du chargement des données');
        return;
      }

      if (contrats && contrats.length > 0) {
        setRawContrats(contrats);
        const filteredContrats = applyFilters(contrats);
        const calculatedMetrics = calculateCommissionMetrics(filteredContrats);
        setMetrics(calculatedMetrics);
      } else {
        setError('Aucune donnée trouvée');
      }
    } catch (error) {
      console.error('Erreur générale:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Effets
  useEffect(() => {
    loadCommissionData();
  }, []);

  // Recharger les données quand les filtres changent
  useEffect(() => {
    if (rawContrats.length > 0) {
      const filteredContrats = applyFilters(rawContrats);
      const calculatedMetrics = calculateCommissionMetrics(filteredContrats);
      setMetrics(calculatedMetrics);
    }
  }, [selectedCommercial, selectedMonth, selectedOrigin, selectedDepartement, rawContrats]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard Commercial</h2>
          <p className="text-muted-foreground">Analyses complètes des commissions et performances</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCommissionData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {rawContrats.length > 0 && (
        <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-gray-600" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre Commercial */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Commercial</label>
                <Select value={selectedCommercial} onValueChange={setSelectedCommercial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les commerciaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les commerciaux</SelectItem>
                    {getUniqueCommercials(rawContrats).map(commercial => (
                      <SelectItem key={commercial} value={commercial}>
                        {commercial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre Mois */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mois</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les mois</SelectItem>
                    {getUniqueMonths(rawContrats).map(month => (
                      <SelectItem key={month} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre Origine */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Origine</label>
                <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les origines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les origines</SelectItem>
                    {getUniqueOrigins().map(origin => (
                      <SelectItem key={origin} value={origin}>
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre Département */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Département</label>
                <Select value={selectedDepartement} onValueChange={setSelectedDepartement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les départements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {getUniqueDepartements(rawContrats).map(departement => (
                      <SelectItem key={departement} value={departement}>
                        {departement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs principaux */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-glow border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Année 1</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Commissions Année 1</p>
                <p className="text-3xl font-black text-blue-600">{formatCurrency(metrics.total_commissions_annee1)}</p>
                <p className="text-sm text-muted-foreground mt-2">Sur {metrics.nombre_total_contrats} contrats actifs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800">Récurrent</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Commissions Récurrentes</p>
                <p className="text-3xl font-black text-green-600">{formatCurrency(metrics.total_commissions_recurrentes)}</p>
                <p className="text-sm text-muted-foreground mt-2">Années suivantes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow border-purple-200 bg-gradient-to-br from-purple-50 to-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                 <Target className="h-6 w-6 text-white" />
               </div>
               <Badge className="bg-purple-100 text-purple-800">Performance</Badge>
             </div>
             <div>
               <p className="text-sm font-medium text-muted-foreground mb-2">Commission Moyenne/Mois</p>
               <p className="text-3xl font-black text-purple-600">{formatCurrency(metrics.commission_moyenne_par_mois)}</p>
               <p className="text-sm text-muted-foreground mt-2">Par mois d'activité</p>
             </div>
           </CardContent>
         </Card>

          <Card className="card-glow border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-100 text-orange-800">Contrats</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Contrats Actifs</p>
                <p className="text-3xl font-black text-orange-600">{metrics.nombre_total_contrats}</p>
                <p className="text-sm text-muted-foreground mt-2">En portefeuille</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Sections détaillées */}
      {metrics && (
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="companies">Par Compagnie</TabsTrigger>
            <TabsTrigger value="commercials">Par Commercial</TabsTrigger>
            <TabsTrigger value="origins">Par Origine</TabsTrigger>
            <TabsTrigger value="departments">Par Département</TabsTrigger>
          </TabsList>

          {/* Onglet Compagnies */}
          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Performance par Compagnie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.commissions_par_compagnie)
                    .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                    .map(([compagnie, data]) => (
                      <div key={compagnie} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{compagnie}</h3>
                          <Badge variant="outline">{data.nombre_contrats} contrat{data.nombre_contrats > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Commission Année 1</p>
                            <p className="font-bold text-blue-600">{formatCurrency(data.commission_annee1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission Récurrente</p>
                            <p className="font-bold text-green-600">{formatCurrency(data.commission_recurrente)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taux Commission</p>
                            <p className="font-bold text-purple-600">{(data.taux_commission_moyen * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commerciaux */}
          <TabsContent value="commercials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Performance par Commercial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.commissions_par_commercial)
                    .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                    .map(([commercial, data]) => (
                      <div key={commercial} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-white">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{commercial}</h3>
                          <Badge variant="outline">{data.nombre_contrats} contrat{data.nombre_contrats > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Commission Année 1</p>
                            <p className="font-bold text-green-600">{formatCurrency(data.commission_annee1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission Récurrente</p>
                            <p className="font-bold text-blue-600">{formatCurrency(data.commission_recurrente)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taux Commission</p>
                            <p className="font-bold text-purple-600">{(data.taux_commission_moyen * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Origines */}
          <TabsContent value="origins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Performance par Origine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.commissions_par_origine)
                    .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                    .map(([origine, data]) => (
                      <div key={origine} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-white">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{origine}</h3>
                          <Badge variant="outline">{data.nombre_contrats} contrat{data.nombre_contrats > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Commission Année 1</p>
                            <p className="font-bold text-purple-600">{formatCurrency(data.commission_annee1)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission Récurrente</p>
                            <p className="font-bold text-blue-600">{formatCurrency(data.commission_recurrente)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pourcentage</p>
                            <p className="font-bold text-green-600">{data.pourcentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Départements */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Performance par Département
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* KPIs généraux par département */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(metrics.commissions_par_departement)
                      .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                      .map(([departement, data]) => (
                        <Card key={departement} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-lg text-orange-800">{departement}</h3>
                              <Badge variant="outline" className="border-orange-300 text-orange-700">
                                {data.nombre_contrats} contrat{data.nombre_contrats > 1 ? 's' : ''}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Commission Année 1</span>
                                <span className="font-bold text-blue-600">{formatCurrency(data.commission_annee1)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Commission Récurrente</span>
                                <span className="font-bold text-green-600">{formatCurrency(data.commission_recurrente)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">% du total</span>
                                <span className="font-bold text-purple-600">{data.pourcentage.toFixed(1)}%</span>
                              </div>
                            </div>

                            {/* Compagnies dans ce département */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-2">Top Compagnies:</p>
                              <div className="space-y-1">
                                {Object.entries(data.compagnies)
                                  .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                                  .slice(0, 3)
                                  .map(([compagnie, compagnieData]) => (
                                    <div key={compagnie} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600 truncate" title={compagnie}>
                                        {compagnie.length > 15 ? compagnie.substring(0, 15) + '...' : compagnie}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-blue-600 font-medium">{compagnieData.nombre_contrats}</span>
                                        <span className="text-green-600">{formatCurrency(compagnieData.commission_annee1)}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* Résumé global des départements */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Résumé par Département</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Département</th>
                              <th className="text-right p-2 font-medium">Contrats</th>
                              <th className="text-right p-2 font-medium">Commission A1</th>
                              <th className="text-right p-2 font-medium">Commission Rec.</th>
                              <th className="text-right p-2 font-medium">% Total</th>
                              <th className="text-left p-2 font-medium">Top Compagnie</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(metrics.commissions_par_departement)
                              .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)
                              .map(([departement, data]) => {
                                const topCompagnie = Object.entries(data.compagnies)
                                  .sort(([,a], [,b]) => b.commission_annee1 - a.commission_annee1)[0];
                                return (
                                  <tr key={departement} className="border-b hover:bg-gray-50">
                                    <td className="p-2 font-medium">{departement}</td>
                                    <td className="p-2 text-right">{data.nombre_contrats}</td>
                                    <td className="p-2 text-right font-medium text-blue-600">
                                      {formatCurrency(data.commission_annee1)}
                                    </td>
                                    <td className="p-2 text-right font-medium text-green-600">
                                      {formatCurrency(data.commission_recurrente)}
                                    </td>
                                    <td className="p-2 text-right">{data.pourcentage.toFixed(1)}%</td>
                                    <td className="p-2 text-left">
                                      {topCompagnie ? (
                                        <div>
                                          <div className="font-medium text-sm">{topCompagnie[0]}</div>
                                          <div className="text-xs text-gray-500">
                                            {topCompagnie[1].nombre_contrats} ctr - {formatCurrency(topCompagnie[1].commission_annee1)}
                                          </div>
                                        </div>
                                      ) : 'N/A'}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}

      {/* Messages d'état */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Chargement des données...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};