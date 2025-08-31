import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Calculator,
  TrendingUp,
  Building,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  Download,
  Settings,
  Play
} from 'lucide-react';
import { CommissionService } from '../../lib/commission-service';
import type {
  CommissionCalculation,
  CommissionStats,
  CommissionConfig
} from '../../lib/types';

export const CommissionsTab: React.FC = () => {
  const [calculations, setCalculations] = useState<CommissionCalculation[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCompagnie, setSelectedCompagnie] = useState<string>('');
  const [cotisationInput, setCotisationInput] = useState<string>('');
  const [testResult, setTestResult] = useState<CommissionCalculation | null>(null);
  const [error, setError] = useState<string>('');

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les configurations
      const configsList = CommissionService.getAllCommissionConfigs();
      setConfigs(configsList);

      // Charger les statistiques (simulation pour l'instant)
      const mockStats: CommissionStats = {
        total_commissions_mensuelles: 0,
        total_commissions_annuelles: 0,
        total_commissions_recurrentes: 0,
        commissions_par_compagnie: {},
        commissions_par_commercial: {},
        evolution_mensuelle: {},
        taux_reussite_calculs: 0
      };
      setStats(mockStats);

      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCalculation = () => {
    if (!selectedCompagnie || !cotisationInput) {
      setError('Veuillez sélectionner une compagnie et saisir une cotisation');
      return;
    }

    const cotisation = parseFloat(cotisationInput.replace(',', '.'));
    if (isNaN(cotisation) || cotisation <= 0 || cotisation > 10000) {
      setError('Cotisation invalide (doit être entre 0.01 et 10,000€)');
      return;
    }

    // Validation supplémentaire contre les injections
    if (cotisationInput.includes('<') || cotisationInput.includes('>') || cotisationInput.includes('script')) {
      setError('Caractères non autorisés dans la cotisation');
      return;
    }

    try {
      const result = CommissionService.calculateCommissionForContract(
        selectedCompagnie,
        cotisation
      );

      if (result) {
        setTestResult(result);
        setError('');
      } else {
        setError('Impossible de calculer la commission pour cette configuration');
      }
    } catch (err) {
      setError('Erreur lors du calcul');
      console.error('Erreur calcul:', err);
    }
  };

  const handleFullCalculation = async () => {
    setLoading(true);
    setProgress(0);
    setError('');

    try {
      // Simulation du calcul complet
      const mockCalculations: CommissionCalculation[] = [];
      let processed = 0;
      const total = 50; // Simulation de 50 calculs

      for (let i = 0; i < total; i++) {
        // Simuler un calcul
        const mockResult: CommissionCalculation = {
          id: `calc_${i}`,
          projet_id: Math.floor(i / 5) + 1,
          compagnie: ['SPVIE', 'APRIL', 'NÉOLIANE'][i % 3],
          cotisation_mensuelle: 100 + Math.random() * 200,
          cotisation_annuelle: 0,
          commission_mensuelle: 0,
          commission_annuelle: 0,
          commission_annuelle_avec_retenue: 0,
          commission_recurrente: 0,
          commission_recurrente_avec_retenue: 0,
          type_commission: 'Précompte',
          date_calcul: new Date().toISOString(),
          statut: 'calculé',
          erreurs: [],
          metadata: {}
        };

        // Calculer les vraies valeurs
        const realResult = CommissionService.calculateCommissionForContract(
          mockResult.compagnie,
          mockResult.cotisation_mensuelle
        );

        if (realResult) {
          mockResult.cotisation_annuelle = realResult.cotisation_annuelle;
          mockResult.commission_mensuelle = realResult.commission_mensuelle;
          mockResult.commission_annuelle = realResult.commission_annuelle;
          mockResult.commission_annuelle_avec_retenue = realResult.commission_annuelle_avec_retenue;
          mockResult.commission_recurrente = realResult.commission_recurrente;
          mockResult.commission_recurrente_avec_retenue = realResult.commission_recurrente_avec_retenue;
          mockResult.type_commission = realResult.type_commission;
        }

        mockCalculations.push(mockResult);

        processed++;
        setProgress(Number((processed / total) * 100));

        // Petite pause pour voir la progression
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setCalculations(mockCalculations);

      // Mettre à jour les statistiques
      const newStats: CommissionStats = {
        total_commissions_mensuelles: mockCalculations.reduce((sum, calc) => sum + calc.commission_mensuelle, 0),
        total_commissions_annuelles: mockCalculations.reduce((sum, calc) => sum + calc.commission_annuelle_avec_retenue, 0),
        total_commissions_recurrentes: mockCalculations.reduce((sum, calc) => sum + calc.commission_recurrente_avec_retenue, 0),
        commissions_par_compagnie: {},
        commissions_par_commercial: {},
        evolution_mensuelle: {},
        taux_reussite_calculs: 100
      };

      // Grouper par compagnie
      mockCalculations.forEach(calc => {
        if (!newStats.commissions_par_compagnie[calc.compagnie]) {
          newStats.commissions_par_compagnie[calc.compagnie] = {
            nombre_contrats: 0,
            total_commissions: 0,
            moyenne_commission: 0
          };
        }
        newStats.commissions_par_compagnie[calc.compagnie].nombre_contrats++;
        newStats.commissions_par_compagnie[calc.compagnie].total_commissions += calc.commission_mensuelle;
      });

      // Calculer les moyennes
      Object.keys(newStats.commissions_par_compagnie).forEach(compagnie => {
        const compagnieStats = newStats.commissions_par_compagnie[compagnie];
        compagnieStats.moyenne_commission = compagnieStats.total_commissions / compagnieStats.nombre_contrats;
      });

      setStats(newStats);

    } catch (err) {
      setError('Erreur lors du calcul complet');
      console.error('Erreur calcul complet:', err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'calculé':
        return <Badge variant="default" className="bg-green-100 text-green-800">Calculé</Badge>;
      case 'erreur':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commissions</h2>
          <p className="text-muted-foreground">
            Calcul automatique et gestion des commissions par compagnie d'assurance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            onClick={handleFullCalculation}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Calculer Tout
          </Button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Barre de progression */}
      {loading && progress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calcul en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets principaux */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="configs">Configuration</TabsTrigger>
        </TabsList>

        {/* Tableau de Bord */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions Mensuelles</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.total_commissions_mensuelles) : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions Annuelles</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.total_commissions_annuelles) : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avec retenue (87.5%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compagnies</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compagnies configurées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? `${stats.taux_reussite_calculs}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculs réussis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques par compagnie */}
          {stats && Object.keys(stats.commissions_par_compagnie).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Compagnie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.commissions_par_compagnie).map(([compagnie, data]: [string, any]) => (
                    <div key={compagnie} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{compagnie}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.nombre_contrats} contrat{data.nombre_contrats > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(data.total_commissions)}</div>
                        <div className="text-sm text-muted-foreground">
                          Moy: {formatCurrency(data.moyenne_commission)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Calculateur */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculateur de Commission</CardTitle>
              <p className="text-sm text-muted-foreground">
                Testez le calcul de commissions pour une compagnie spécifique
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compagnie">Compagnie d'Assurance</Label>
                  <Select value={selectedCompagnie} onValueChange={setSelectedCompagnie}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une compagnie" />
                    </SelectTrigger>
                    <SelectContent>
                      {configs.map(config => (
                        <SelectItem key={config.compagnie} value={config.compagnie}>
                          {config.compagnie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cotisation">Cotisation Mensuelle (€)</Label>
                  <Input
                    id="cotisation"
                    type="number"
                    step="0.01"
                    placeholder="150.50"
                    value={cotisationInput}
                    onChange={(e) => setCotisationInput(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleTestCalculation}
                className="w-full"
                disabled={!selectedCompagnie || !cotisationInput}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculer la Commission
              </Button>

              {/* Résultat du test */}
              {testResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Résultat du Calcul</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cotisation mensuelle:</span>
                      <div className="font-medium">{formatCurrency(testResult.cotisation_mensuelle)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cotisation annuelle:</span>
                      <div className="font-medium">{formatCurrency(testResult.cotisation_annuelle)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commission mensuelle:</span>
                      <div className="font-medium">{formatCurrency(testResult.commission_mensuelle)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commission annuelle:</span>
                      <div className="font-medium">{formatCurrency(testResult.commission_annuelle)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commission avec retenue:</span>
                      <div className="font-medium">{formatCurrency(testResult.commission_annuelle_avec_retenue)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type de commission:</span>
                      <div className="font-medium">{testResult.type_commission}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Résultats */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Résultats des Calculs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {calculations.length} calculs effectués
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {calculations.length > 0 ? (
                <div className="space-y-4">
                  {calculations.slice(0, 10).map((calc, index) => (
                    <div key={calc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <div className="font-medium">Projet #{calc.projet_id}</div>
                          <div className="text-sm text-muted-foreground">{calc.compagnie}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(calc.statut)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(calc.commission_mensuelle)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(calc.commission_annuelle_avec_retenue)} annuel
                        </div>
                      </div>
                    </div>
                  ))}

                  {calculations.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... et {calculations.length - 10} autres calculs
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun calcul effectué</p>
                  <p className="text-sm">Lancez un calcul pour voir les résultats ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Compagnies</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestion des taux de commission par compagnie d'assurance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configs.map(config => (
                  <div key={config.compagnie} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{config.compagnie}</div>
                      <div className="text-sm text-muted-foreground">
                        Année 1: {config.taux_annee1}% | Récurrent: {config.taux_recurrent}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={config.type_commission === 'Précompte' ? 'default' : 'secondary'}>
                        {config.type_commission}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
