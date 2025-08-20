// CRM Types and Interfaces

export interface Contact {
  identifiant: number
  id?: number
  civilite?: string
  prenom?: string
  nom?: string
  raison_sociale?: string
  siret?: string
  adresse?: string
  code_postal?: string
  ville?: string
  telephone?: string
  email?: string
  created_at?: string
  updated_at?: string
  // Additional optional fields used by UI
  statut?: string
  type?: string
  notes?: string
  date_creation?: string
  // Computed fields
  projets?: Projet[]
  contrats?: Contrat[]
  interactions?: Interaction[]
  revenue?: number
  lastInteraction?: string
}

export interface Projet {
  id?: string | number
  projet_id: number
  contact_id?: number
  date_creation?: string
  origine?: string
  statut?: string
  commercial?: string
  date_souscription?: string
  contrat?: boolean
  created_at?: string
  updated_at?: string
  contact?: Contact
  type?: string
  notes?: string
}

export interface Contrat {
  id: string
  contact_id?: number
  projet_id?: number
  contrat_num_contrat?: string
  contrat_produit?: string
  contrat_formule?: string
  prime_brute_mensuelle?: number
  prime_nette_mensuelle?: number
  prime_brute_annuelle?: number
  prime_nette_annuelle?: number
  contrat_date_creation?: string
  contrat_debut_effet?: string
  contrat_date_echeance?: string
  contrat_statut?: string
  contrat_compagnie?: string
  commissionnement_annee1?: number
}

export interface Segment {
  id: number
  nom: string
  description?: string
  criteres: Record<string, any>
  couleur?: string
  created_at?: string
  type_segment?: string
  statut_projet?: string
  conditions?: Record<string, any>
}

export interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte?: string
  variables?: Record<string, any>
  categorie?: string
  statut?: string
  created_at?: string
  updated_at?: string
}

export interface Workflow {
  id: number
  nom?: string
  description?: string
  declencheur?: string
  etapes?: Record<string, any>
  statut?: string
  segment_id?: number
  template_id?: number
  actif?: boolean
  created_at?: string
}

export interface Campaign {
  id: number
  nom: string
  description?: string
  segment_id?: number
  template_id?: number
  statut?: string
  date_lancement?: string
  date_fin?: string
  date_planifiee?: string
  email_config_id?: number
  contact_count?: number
  tracking_stats?: {
    envois: number
    ouvertures: number
    clics: number
    bounces: number
    desabonnements: number
  }
  created_at?: string
}

export interface Interaction {
  id: number
  contact_id?: number
  created_at?: string
  type?: string
  canal?: string
  sujet?: string
  message?: string
  statut?: string
  workflow_name?: string
  segment_name?: string
}

export interface CRMStats {
  totalContacts: number
  activeClients: number
  prospects: number
  totalRevenue: number
  conversionRate: string
  avgRevenuePerClient: string
  growthRate: string
  activeCampaigns: number
  crossSellOpportunities: number
  aiScore: number
}

export interface AnalyticsData {
  trends: any[]
  segmentPerformance: Record<string, any>
  topCampaigns: any[]
  overview: {
    totalRevenue: number
    revenueGrowth: number
    totalCampaigns: number
    activeCampaigns: number
    emailsSent: number
    openRate: string
    clickRate: string
    conversionRate: string
    roi: number
  }
  aiInsights: any[]
}
