import { supabase } from './supabase';
import type {
  CommissionCalculation,
  CommissionConfig,
  CommissionStats,
  Contrat,
  Projet
} from './types';

/**
 * Service de calcul de commissions - Version refactorisée du système Google Sheets
 * Architecture modulaire et scalable pour le CRM
 */
export class CommissionService {
  private static readonly RETENTION_RATE = 0.875; // 87.5%
  public static readonly BATCH_SIZE = 50;

  /**
   * Configuration des taux de commission par compagnie d'assurance
   * Basé sur la logique métier originale
   */
  private static readonly COMMISSION_CONFIGS: Record<string, CommissionConfig> = {
    "SPVIE": {
      compagnie: "SPVIE",
      taux_annee1: 40.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "HARMONIE MUTUELLE": {
      compagnie: "HARMONIE MUTUELLE",
      taux_annee1: 15.00,
      taux_recurrent: 15.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "AS SOLUTIONS": {
      compagnie: "AS SOLUTIONS",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "SOLLY AZAR": {
      compagnie: "SOLLY AZAR",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "NÉOLIANE": {
      compagnie: "NÉOLIANE",
      taux_annee1: 43.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ZENIOO": {
      compagnie: "ZENIOO",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "APRIL": {
      compagnie: "APRIL",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ALPTIS": {
      compagnie: "ALPTIS",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ENTORIA": {
      compagnie: "ENTORIA",
      taux_annee1: 20.00,
      taux_recurrent: 20.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "AVA": {
      compagnie: "AVA",
      taux_annee1: 10.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "COVERITY": {
      compagnie: "COVERITY",
      taux_annee1: 20.00,
      taux_recurrent: 20.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "MALAKOFF HUMANIS": {
      compagnie: "MALAKOFF HUMANIS",
      taux_annee1: 15.00,
      taux_recurrent: 15.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ASAF&AFPS": {
      compagnie: "ASAF&AFPS",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "JOKER ASSURANCES": {
      compagnie: "JOKER ASSURANCES",
      taux_annee1: 20.00,
      taux_recurrent: 20.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "APICIL": {
      compagnie: "APICIL",
      taux_annee1: 17.00,
      taux_recurrent: 17.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ECA CAPITAL SENIOR": {
      compagnie: "ECA CAPITAL SENIOR",
      taux_annee1: 40.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ECA SÉRENISSIME": {
      compagnie: "ECA SÉRENISSIME",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "ECA Autres": {
      compagnie: "ECA Autres",
      taux_annee1: 30.00,
      taux_recurrent: 10.00,
      type_commission: "Précompte",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "CNP": {
      compagnie: "CNP",
      taux_annee1: 10.00,
      taux_recurrent: 10.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    },
    "FMA": {
      compagnie: "FMA",
      taux_annee1: 17.00,
      taux_recurrent: 17.00,
      type_commission: "Linéaire",
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    }
  };

  /**
   * Calcule les commissions pour un contrat spécifique
   */
  static calculateCommissionForContract(
    compagnie: string,
    cotisationMensuelle: number,
    projetId?: number,
    contactId?: number,
    contratId?: string
  ): CommissionCalculation | null {
    try {
      // Nettoyer et valider la cotisation
      const cotisationStr = String(cotisationMensuelle).replace(/[€\s]/g, '').replace(',', '.');
      const cotisation = parseFloat(cotisationStr);

      if (isNaN(cotisation) || cotisation <= 0) {
        console.warn(`Cotisation invalide pour la compagnie ${compagnie}: ${cotisationMensuelle}`);
        return null;
      }

      // Normaliser le nom de la compagnie
      const compagnieKey = compagnie.toUpperCase().trim();
      const config = this.COMMISSION_CONFIGS[compagnieKey];

      if (!config || !config.actif) {
        console.warn(`Configuration non trouvée pour la compagnie: ${compagnie}`);
        return null;
      }

      // Calculs de base
      const cotisationAnnuelle = cotisation * 12;
      const commissionMensuelle = cotisation * (config.taux_annee1 / 100);
      const commissionAnnuelle = cotisationAnnuelle * (config.taux_annee1 / 100);
      const commissionAnnuelleAvecRetenue = commissionAnnuelle * this.RETENTION_RATE;
      const commissionRecurrente = cotisationAnnuelle * (config.taux_recurrent / 100);
      const commissionRecurrenteAvecRetenue = commissionRecurrente * this.RETENTION_RATE;

      // Créer le résultat
      const result: CommissionCalculation = {
        id: Date.now(),
        projet_id: projetId || 0,
        contact_id: contactId,
        contrat_id: contratId,
        compagnie,
        cotisation_mensuelle: cotisation,
        cotisation_annuelle: cotisationAnnuelle,
        commission_mensuelle: commissionMensuelle,
        commission_annuelle: commissionAnnuelle,
        commission_annuelle_avec_retenue: commissionAnnuelleAvecRetenue,
        commission_recurrente: commissionRecurrente,
        commission_recurrente_avec_retenue: commissionRecurrenteAvecRetenue,
        type_commission: config.type_commission,
        created_at: new Date().toISOString(),
        statut: 'calculé',
        erreurs: [],
        metadata: {
          taux_annee1: config.taux_annee1,
          taux_recurrent: config.taux_recurrent,
          retention_appliquee: this.RETENTION_RATE,
          version_calcul: '2.0.0'
        }
      };

      return result;

    } catch (error) {
      console.error(`Erreur lors du calcul de commission pour ${compagnie}:`, error);
      return {
        id: Date.now(),
        projet_id: projetId || 0,
        contact_id: contactId,
        contrat_id: contratId,
        compagnie,
        cotisation_mensuelle: 0,
        cotisation_annuelle: 0,
        commission_mensuelle: 0,
        commission_annuelle: 0,
        commission_annuelle_avec_retenue: 0,
        commission_recurrente: 0,
        commission_recurrente_avec_retenue: 0,
        type_commission: 'Précompte',
        created_at: new Date().toISOString(),
        statut: 'erreur',
        erreurs: [error instanceof Error ? error.message : 'Erreur inconnue'],
        metadata: {}
      };
    }
  }

  /**
   * Calcule les commissions pour tous les contrats d'un projet
   */
  static async calculateCommissionsForProject(projetId: number): Promise<CommissionCalculation[]> {
    try {
      // Récupérer le projet avec ses contrats
      const { data: projet, error: projetError } = await supabase
        .from('projets')
        .select(`
          projet_id,
          contact_id,
          contact:contact_id (
            identifiant,
            raison_sociale,
            email
          )
        `)
        .eq('projet_id', projetId)
        .single();

      if (projetError || !projet) {
        throw new Error(`Projet non trouvé: ${projetId}`);
      }

      // Récupérer les contrats associés
      const { data: contrats, error: contratsError } = await supabase
        .from('contrats')
        .select('*')
        .eq('projet_id', projetId);

      if (contratsError) {
        throw new Error(`Erreur récupération contrats: ${contratsError.message}`);
      }

      const results: CommissionCalculation[] = [];

      // Calculer les commissions pour chaque contrat
      for (const contrat of contrats || []) {
        if (contrat.contrat_compagnie && contrat.prime_brute_mensuelle) {
          const calculation = this.calculateCommissionForContract(
            contrat.contrat_compagnie,
            contrat.prime_brute_mensuelle,
            projetId,
            projet.contact_id,
            contrat.id
          );

          if (calculation) {
            results.push(calculation);
          }
        }
      }

      return results;

    } catch (error) {
      console.error(`Erreur calcul commissions projet ${projetId}:`, error);
      throw error;
    }
  }

  /**
   * Calcule les commissions pour tous les projets par lot
   */
  static async calculateAllCommissions(options: {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
  } = {}): Promise<CommissionCalculation[]> {
    const batchSize = options.batchSize || this.BATCH_SIZE;

    try {
      // Récupérer tous les projets avec des contrats
      const { data: projets, error: projetsError } = await supabase
        .from('projets')
        .select('projet_id, contact_id')
        .not('projet_id', 'is', null);

      if (projetsError) {
        throw new Error(`Erreur récupération projets: ${projetsError.message}`);
      }

      const allResults: CommissionCalculation[] = [];
      const totalProjects = projets?.length || 0;

      // Traiter par lots
      for (let i = 0; i < totalProjects; i += batchSize) {
        const batch = projets?.slice(i, i + batchSize) || [];

        const batchPromises = batch.map(projet =>
          this.calculateCommissionsForProject(projet.projet_id)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            allResults.push(...result.value);
          } else {
            console.error('Erreur dans le lot:', result.reason);
          }
        }

        // Callback de progression
        if (options.onProgress) {
          options.onProgress(Math.min(i + batchSize, totalProjects), totalProjects);
        }
      }

      return allResults;

    } catch (error) {
      console.error('Erreur calcul toutes les commissions:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde les calculs de commissions en base
   */
  static async saveCommissionCalculations(calculations: CommissionCalculation[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('commission_calculations')
        .upsert(calculations, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Erreur sauvegarde commissions: ${error.message}`);
      }

    } catch (error) {
      console.error('Erreur sauvegarde calculs de commissions:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de commissions
   */
  static async getCommissionStats(): Promise<CommissionStats> {
    try {
      const { data: calculations, error } = await supabase
        .from('commission_calculations')
        .select('*')
        .eq('statut', 'calculé');

      if (error) {
        throw new Error(`Erreur récupération statistiques: ${error.message}`);
      }

      // Calculer les statistiques
      const stats: CommissionStats = {
        total_commissions_mensuelles: 0,
        total_commissions_annuelles: 0,
        total_commissions_recurrentes: 0,
        commissions_par_compagnie: {},
        commissions_par_commercial: {},
        evolution_mensuelle: {},
        taux_reussite_calculs: 0
      };

      for (const calc of calculations || []) {
        stats.total_commissions_mensuelles += calc.commission_mensuelle || 0;
        stats.total_commissions_annuelles += calc.commission_annuelle_avec_retenue || 0;
        stats.total_commissions_recurrentes += calc.commission_recurrente_avec_retenue || 0;

        // Par compagnie
        if (!stats.commissions_par_compagnie[calc.compagnie]) {
          stats.commissions_par_compagnie[calc.compagnie] = {
            nombre_contrats: 0,
            total_commissions: 0,
            moyenne_commission: 0
          };
        }
        stats.commissions_par_compagnie[calc.compagnie].nombre_contrats++;
        stats.commissions_par_compagnie[calc.compagnie].total_commissions += calc.commission_mensuelle || 0;
      }

      // Calculer les moyennes
      Object.keys(stats.commissions_par_compagnie).forEach(compagnie => {
        const compagnieStats = stats.commissions_par_compagnie[compagnie];
        compagnieStats.moyenne_commission = compagnieStats.total_commissions / compagnieStats.nombre_contrats;
      });

      return stats;

    } catch (error) {
      console.error('Erreur récupération statistiques commissions:', error);
      throw error;
    }
  }

  /**
   * Récupère la configuration des commissions pour une compagnie
   */
  static getCommissionConfig(compagnie: string): CommissionConfig | null {
    const compagnieKey = compagnie.toUpperCase().trim();
    return this.COMMISSION_CONFIGS[compagnieKey] || null;
  }

  /**
   * Liste toutes les configurations de commissions actives
   */
  static getAllCommissionConfigs(): CommissionConfig[] {
    return Object.values(this.COMMISSION_CONFIGS).filter(config => config.actif);
  }

  /**
   * Valide les données d'entrée pour le calcul de commissions
   */
  static validateCommissionInput(compagnie: string, cotisation: number): {
    isValid: boolean;
    errors: string[]
  } {
    const errors: string[] = [];

    if (!compagnie || typeof compagnie !== 'string') {
      errors.push('Le nom de la compagnie est requis');
    }

    if (typeof cotisation !== 'number' || isNaN(cotisation) || cotisation <= 0) {
      errors.push('La cotisation doit être un nombre positif');
    }

    const config = this.getCommissionConfig(compagnie);
    if (!config) {
      errors.push(`Configuration non trouvée pour la compagnie: ${compagnie}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Génère un ID unique pour les calculs
   */
  private static generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Nettoie et normalise une valeur monétaire
   */
  static sanitizeCurrencyValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    const cleaned = String(value)
      .replace(/[€\s]/g, '')
      .replace(',', '.')
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}

/**
 * Fonction principale de calcul des commissions - Equivalent refactorisé de calculerCommissionMensuel()
 */
export async function calculerCommissionMensuel(options: {
  projetIds?: number[];
  batchSize?: number;
  saveToDatabase?: boolean;
  onProgress?: (processed: number, total: number) => void;
} = {}): Promise<{
  success: boolean;
  calculations: CommissionCalculation[];
  errors: string[];
  stats: CommissionStats | null;
}> {
  const {
    projetIds,
    batchSize = CommissionService.BATCH_SIZE,
    saveToDatabase = true,
    onProgress
  } = options;

  const errors: string[] = [];
  let calculations: CommissionCalculation[] = [];

  try {
    console.log('🚀 Démarrage du calcul des commissions mensuelles...');

    if (projetIds && projetIds.length > 0) {
      // Calculer pour des projets spécifiques
      console.log(`📋 Calcul pour ${projetIds.length} projets spécifiques`);

      for (const projetId of projetIds) {
        try {
          const projetCalculations = await CommissionService.calculateCommissionsForProject(projetId);
          calculations.push(...projetCalculations);
        } catch (error) {
          const errorMsg = `Erreur projet ${projetId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } else {
      // Calculer pour tous les projets
      console.log('📊 Calcul pour tous les projets');
      calculations = await CommissionService.calculateAllCommissions({
        batchSize,
        onProgress
      });
    }

    // Sauvegarder en base si demandé
    if (saveToDatabase && calculations.length > 0) {
      console.log('💾 Sauvegarde des calculs en base...');
      await CommissionService.saveCommissionCalculations(calculations);
    }

    // Récupérer les statistiques
    const stats = await CommissionService.getCommissionStats();

    console.log('✅ Calcul des commissions terminé!');
    console.log(`📈 ${calculations.length} calculs effectués`);
    console.log(`💰 Commissions mensuelles totales: ${stats.total_commissions_mensuelles.toFixed(2)}€`);

    return {
      success: true,
      calculations,
      errors,
      stats
    };

  } catch (error) {
    const errorMsg = `Erreur générale calcul commissions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    errors.push(errorMsg);
    console.error(errorMsg);

    return {
      success: false,
      calculations,
      errors,
      stats: null
    };
  }
}