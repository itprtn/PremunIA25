// Shared types for the whole app
export interface Contact {
  identifiant?: number
  prenom: string
  nom: string
  email?: string | null
  civilite?: string | null
  type?: string | null
  statut?: string | null
  date_creation?: string
  created_at?: string
  projets?: Projet[]
  contrats?: Contrat[]
  raison_sociale?: string | null
}

export interface Projet {
  id?: number
  projet_id?: number
  contact_id?: number
  type?: string | null
  statut?: string | null
  commercial?: string | null
  origine?: string | null
  date_creation?: string
}

export interface Contrat {
  projet_id?: number | string | null
  contact_id?: number | null
  contrat_compagnie?: string | null
  contrat_statut?: string | null
  prime_brute_annuelle?: number | null
  commissionnement_annee1?: number | null
  contrat_date_creation?: string
  created_at?: string
  projet_statut?: string | null
  commercial?: string | null
  contrat_produit?: string | null
}

export interface Interaction {
  id: string | number
  type: 'email_sent' | 'email_replied' | 'appointment' | 'call' | string
  date: string
  summary: string
  details?: string
}

// Commission types
export interface CommissionCalculation {
  id?: number
  contact_id?: number
  projet_id?: number
  contrat_id?: string
  commission_brute?: number
  commission_nette?: number
  taux_commission?: number
  created_at?: string
  compagnie?: string
  cotisation_mensuelle?: number
  cotisation_annuelle?: number
  commission_mensuelle?: number
  commission_annuelle?: number
  commission_annuelle_avec_retenue?: number
  commission_recurrente?: number
  commission_recurrente_avec_retenue?: number
  type_commission?: string
  statut?: string
}

export interface CommissionByCompany {
  total: number
  count: number
  average: number
}

export interface CommissionByCommercial {
  total: number
  count: number
  contracts: number
}

export interface CommissionStats {
  total_commission?: number
  commission_moyenne?: number
  nombre_contrats?: number
  commissions_par_compagnie?: Record<string, CommissionByCompany>
  commissions_par_commercial?: Record<string, CommissionByCommercial>
  total_commissions_mensuelles?: number
  total_commissions_annuelles?: number
  total_commissions_recurrentes?: number
  evolution_mensuelle?: Record<string, number>
  taux_reussite_calculs?: number
}

export interface CommissionConfig {
  id?: number
  compagnie?: string
  produit?: string
  taux_defaut?: number
  is_active?: boolean
  actif?: boolean
  taux_annee1?: number
  taux_recurrent?: number
  type_commission?: string
  date_creation?: string
  date_modification?: string
}

// Workflow types
export interface Workflow {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
}

export interface WorkflowConditions {
  field?: string
  operator?: string
  value?: string | number | boolean
  delay_hours?: number
  delay_days?: number
}

export interface WorkflowTrigger {
  id: string
  type: 'email_opened' | 'email_clicked' | 'form_submitted' | 'time_delay'
  conditions?: WorkflowConditions
}

export interface WorkflowActionParameters {
  template_id?: string
  subject?: string
  content?: string
  field?: string
  value?: string | number | boolean
  task_title?: string
  task_description?: string
  delay_hours?: number
  delay_days?: number
}

export interface WorkflowAction {
  id: string
  type: 'send_email' | 'create_task' | 'update_contact' | 'wait'
  parameters?: WorkflowActionParameters
}

export interface Segment {
  id: string | number
  name: string
  nom?: string
  description?: string
  criteria: SegmentCriteria[]
  contact_count?: number
}

export interface SegmentCriteria {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

// Email template types
export interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte?: string
  statut?: string
  categorie?: string
  variables?: string[]
  created_at?: string
  updated_at?: string
}

// Campaign types
export interface Campaign {
  id: number
  name: string
  status: string
  created_at?: string
  updated_at?: string
}