export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          ai_data: Json | null
          confidence_score: number | null
          contact_id: number | null
          created_at: string | null
          description: string
          id: number
          priority: string | null
          projet_id: number | null
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_data?: Json | null
          confidence_score?: number | null
          contact_id?: number | null
          created_at?: string | null
          description: string
          id?: number
          priority?: string | null
          projet_id?: number | null
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_data?: Json | null
          confidence_score?: number | null
          contact_id?: number | null
          created_at?: string | null
          description?: string
          id?: number
          priority?: string | null
          projet_id?: number | null
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_actions: {
        Row: {
          action_config: Json
          action_type: string
          automation_id: number | null
          created_at: string | null
          delay_minutes: number | null
          execution_order: number | null
          id: number
          is_active: boolean | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          automation_id?: number | null
          created_at?: string | null
          delay_minutes?: number | null
          execution_order?: number | null
          id?: number
          is_active?: boolean | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          automation_id?: number | null
          created_at?: string | null
          delay_minutes?: number | null
          execution_order?: number | null
          id?: number
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          actions_executed: number | null
          automation_id: number | null
          completed_at: string | null
          error_message: string | null
          execution_duration: number | null
          id: number
          started_at: string | null
          status: string | null
          total_actions: number | null
          trigger_data: Json | null
        }
        Insert: {
          actions_executed?: number | null
          automation_id?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_duration?: number | null
          id?: number
          started_at?: string | null
          status?: string | null
          total_actions?: number | null
          trigger_data?: Json | null
        }
        Update: {
          actions_executed?: number | null
          automation_id?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_duration?: number | null
          id?: number
          started_at?: string | null
          status?: string | null
          total_actions?: number | null
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          automation_id: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          automation_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          automation_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      campagnes_email: {
        Row: {
          conditions_declenchement: Json | null
          contact_count: number | null
          created_at: string | null
          date_fin: string | null
          date_lancement: string | null
          date_planifiee: string | null
          description: string | null
          email_config_id: number | null
          frequence: string | null
          id: number
          last_execution: string | null
          next_execution: string | null
          nom: string
          parametres_avances: Json | null
          planification_type: string | null
          segment_id: number | null
          statut: string | null
          statut_cible: string | null
          template_id: number | null
          tracking_stats: Json | null
          updated_at: string | null
          workflow_id: number | null
        }
        Insert: {
          conditions_declenchement?: Json | null
          contact_count?: number | null
          created_at?: string | null
          date_fin?: string | null
          date_lancement?: string | null
          date_planifiee?: string | null
          description?: string | null
          email_config_id?: number | null
          frequence?: string | null
          id?: number
          last_execution?: string | null
          next_execution?: string | null
          nom: string
          parametres_avances?: Json | null
          planification_type?: string | null
          segment_id?: number | null
          statut?: string | null
          statut_cible?: string | null
          template_id?: number | null
          tracking_stats?: Json | null
          updated_at?: string | null
          workflow_id?: number | null
        }
        Update: {
          conditions_declenchement?: Json | null
          contact_count?: number | null
          created_at?: string | null
          date_fin?: string | null
          date_lancement?: string | null
          date_planifiee?: string | null
          description?: string | null
          email_config_id?: number | null
          frequence?: string | null
          id?: number
          last_execution?: string | null
          next_execution?: string | null
          nom?: string
          parametres_avances?: Json | null
          planification_type?: string | null
          segment_id?: number | null
          statut?: string | null
          statut_cible?: string | null
          template_id?: number | null
          tracking_stats?: Json | null
          updated_at?: string | null
          workflow_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campagnes_email_email_config_id_fkey"
            columns: ["email_config_id"]
            isOneToOne: false
            referencedRelation: "email_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campagnes_email_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campagnes_email_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campagnes_email_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      contact: {
        Row: {
          adresse: string | null
          civilite: string | null
          code_postal: string | null
          created_at: string | null
          email: string | null
          identifiant: number
          nom: string | null
          prenom: string | null
          raison_sociale: string | null
          telephone: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string | null
          email?: string | null
          identifiant: number
          nom?: string | null
          prenom?: string | null
          raison_sociale?: string | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string | null
          email?: string | null
          identifiant?: number
          nom?: string | null
          prenom?: string | null
          raison_sociale?: string | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      contrats: {
        Row: {
          commissionnement_annee1: number | null
          commissionnement_autres_annees: number | null
          contact_adresse: string | null
          contact_civilite: string | null
          contact_code_postal: string | null
          contact_complement_adresse: string | null
          contact_id: number | null
          contact_nom: string | null
          contact_prenom: string | null
          contact_raison_sociale: string | null
          contact_ville: string | null
          contrat_commentaire: string | null
          contrat_compagnie: string | null
          contrat_date_creation: string | null
          contrat_date_echeance: string | null
          contrat_debut_effet: string | null
          contrat_debut_signature: string | null
          contrat_demande_resiliation: string | null
          contrat_fin_contrat: string | null
          contrat_formule: string | null
          contrat_motif_resiliation: string | null
          contrat_num_contrat: string | null
          contrat_num_version: string | null
          contrat_options: string | null
          contrat_produit: string | null
          fractionnement: string | null
          frais_honoraires: number | null
          id: string
          nb_mois_gratuits_annee1: number | null
          nb_mois_gratuits_annee2: number | null
          nb_mois_gratuits_annee3: number | null
          prime_brute_annuelle: number | null
          prime_brute_mensuelle: number | null
          prime_nette_annuelle: number | null
          prime_nette_mensuelle: number | null
          projet_attribution: string | null
          projet_auteur: string | null
          projet_bic: string | null
          projet_date_creation: string | null
          projet_date_souscription: string | null
          projet_derniere_modification: string | null
          projet_iban: string | null
          projet_id: number | null
          projet_origine: string | null
          projet_provenance: string | null
          projet_statut: string | null
          projet_type: string | null
          type_commissionnement: string | null
        }
        Insert: {
          commissionnement_annee1?: number | null
          commissionnement_autres_annees?: number | null
          contact_adresse?: string | null
          contact_civilite?: string | null
          contact_code_postal?: string | null
          contact_complement_adresse?: string | null
          contact_id?: number | null
          contact_nom?: string | null
          contact_prenom?: string | null
          contact_raison_sociale?: string | null
          contact_ville?: string | null
          contrat_commentaire?: string | null
          contrat_compagnie?: string | null
          contrat_date_creation?: string | null
          contrat_date_echeance?: string | null
          contrat_debut_effet?: string | null
          contrat_debut_signature?: string | null
          contrat_demande_resiliation?: string | null
          contrat_fin_contrat?: string | null
          contrat_formule?: string | null
          contrat_motif_resiliation?: string | null
          contrat_num_contrat?: string | null
          contrat_num_version?: string | null
          contrat_options?: string | null
          contrat_produit?: string | null
          fractionnement?: string | null
          frais_honoraires?: number | null
          id: string
          nb_mois_gratuits_annee1?: number | null
          nb_mois_gratuits_annee2?: number | null
          nb_mois_gratuits_annee3?: number | null
          prime_brute_annuelle?: number | null
          prime_brute_mensuelle?: number | null
          prime_nette_annuelle?: number | null
          prime_nette_mensuelle?: number | null
          projet_attribution?: string | null
          projet_auteur?: string | null
          projet_bic?: string | null
          projet_date_creation?: string | null
          projet_date_souscription?: string | null
          projet_derniere_modification?: string | null
          projet_iban?: string | null
          projet_id?: number | null
          projet_origine?: string | null
          projet_provenance?: string | null
          projet_statut?: string | null
          projet_type?: string | null
          type_commissionnement?: string | null
        }
        Update: {
          commissionnement_annee1?: number | null
          commissionnement_autres_annees?: number | null
          contact_adresse?: string | null
          contact_civilite?: string | null
          contact_code_postal?: string | null
          contact_complement_adresse?: string | null
          contact_id?: number | null
          contact_nom?: string | null
          contact_prenom?: string | null
          contact_raison_sociale?: string | null
          contact_ville?: string | null
          contrat_commentaire?: string | null
          contrat_compagnie?: string | null
          contrat_date_creation?: string | null
          contrat_date_echeance?: string | null
          contrat_debut_effet?: string | null
          contrat_debut_signature?: string | null
          contrat_demande_resiliation?: string | null
          contrat_fin_contrat?: string | null
          contrat_formule?: string | null
          contrat_motif_resiliation?: string | null
          contrat_num_contrat?: string | null
          contrat_num_version?: string | null
          contrat_options?: string | null
          contrat_produit?: string | null
          fractionnement?: string | null
          frais_honoraires?: number | null
          id?: string
          nb_mois_gratuits_annee1?: number | null
          nb_mois_gratuits_annee2?: number | null
          nb_mois_gratuits_annee3?: number | null
          prime_brute_annuelle?: number | null
          prime_brute_mensuelle?: number | null
          prime_nette_annuelle?: number | null
          prime_nette_mensuelle?: number | null
          projet_attribution?: string | null
          projet_auteur?: string | null
          projet_bic?: string | null
          projet_date_creation?: string | null
          projet_date_souscription?: string | null
          projet_derniere_modification?: string | null
          projet_iban?: string | null
          projet_id?: number | null
          projet_origine?: string | null
          projet_provenance?: string | null
          projet_statut?: string | null
          projet_type?: string | null
          type_commissionnement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrats_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["projet_id"]
          },
        ]
      }
      email_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          email: string
          id: number
          imap_host: string | null
          imap_port: number | null
          imap_secure: boolean | null
          is_active: boolean | null
          last_check: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email: string
          id?: number
          imap_host?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          is_active?: boolean | null
          last_check?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string
          id?: number
          imap_host?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          is_active?: boolean | null
          last_check?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          campagne_id: number | null
          config_id: number | null
          created_at: string | null
          email_destinataire: string
          error_details: string | null
          id: number
          message_id: string | null
          queue_id: number | null
          smtp_response: string | null
          statut: string
          tracking_data: Json | null
        }
        Insert: {
          campagne_id?: number | null
          config_id?: number | null
          created_at?: string | null
          email_destinataire: string
          error_details?: string | null
          id?: number
          message_id?: string | null
          queue_id?: number | null
          smtp_response?: string | null
          statut: string
          tracking_data?: Json | null
        }
        Update: {
          campagne_id?: number | null
          config_id?: number | null
          created_at?: string | null
          email_destinataire?: string
          error_details?: string | null
          id?: number
          message_id?: string | null
          queue_id?: number | null
          smtp_response?: string | null
          statut?: string
          tracking_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campagne_id_fkey"
            columns: ["campagne_id"]
            isOneToOne: false
            referencedRelation: "campagnes_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "email_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "email_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          campagne_id: number | null
          contact_id: number | null
          contenu_html: string | null
          contenu_texte: string | null
          created_at: string | null
          email_destinataire: string
          erreur_message: string | null
          id: number
          scheduled_for: string | null
          sent_at: string | null
          statut: string | null
          sujet: string
          tentatives: number | null
          updated_at: string | null
        }
        Insert: {
          campagne_id?: number | null
          contact_id?: number | null
          contenu_html?: string | null
          contenu_texte?: string | null
          created_at?: string | null
          email_destinataire: string
          erreur_message?: string | null
          id?: number
          scheduled_for?: string | null
          sent_at?: string | null
          statut?: string | null
          sujet: string
          tentatives?: number | null
          updated_at?: string | null
        }
        Update: {
          campagne_id?: number | null
          contact_id?: number | null
          contenu_html?: string | null
          contenu_texte?: string | null
          created_at?: string | null
          email_destinataire?: string
          erreur_message?: string | null
          id?: number
          scheduled_for?: string | null
          sent_at?: string | null
          statut?: string | null
          sujet?: string
          tentatives?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_campagne_id_fkey"
            columns: ["campagne_id"]
            isOneToOne: false
            referencedRelation: "campagnes_email"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          categorie: string | null
          contenu_html: string
          contenu_texte: string | null
          created_at: string | null
          created_by: string | null
          id: number
          nom: string
          statut: string | null
          sujet: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          categorie?: string | null
          contenu_html: string
          contenu_texte?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          nom: string
          statut?: string | null
          sujet: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          categorie?: string | null
          contenu_html?: string
          contenu_texte?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          nom?: string
          statut?: string | null
          sujet?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      envois_email: {
        Row: {
          campagne_id: number | null
          contact_id: number | null
          contenu_html: string | null
          contenu_texte: string | null
          created_at: string | null
          date_clic: string | null
          date_envoi: string | null
          date_ouverture: string | null
          email_destinataire: string
          erreur_message: string | null
          id: number
          projet_id: number | null
          statut: string | null
          sujet: string | null
          tracking_id: string | null
        }
        Insert: {
          campagne_id?: number | null
          contact_id?: number | null
          contenu_html?: string | null
          contenu_texte?: string | null
          created_at?: string | null
          date_clic?: string | null
          date_envoi?: string | null
          date_ouverture?: string | null
          email_destinataire: string
          erreur_message?: string | null
          id?: number
          projet_id?: number | null
          statut?: string | null
          sujet?: string | null
          tracking_id?: string | null
        }
        Update: {
          campagne_id?: number | null
          contact_id?: number | null
          contenu_html?: string | null
          contenu_texte?: string | null
          created_at?: string | null
          date_clic?: string | null
          date_envoi?: string | null
          date_ouverture?: string | null
          email_destinataire?: string
          erreur_message?: string | null
          id?: number
          projet_id?: number | null
          statut?: string | null
          sujet?: string | null
          tracking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envois_email_campagne_id_fkey"
            columns: ["campagne_id"]
            isOneToOne: false
            referencedRelation: "campagnes_email"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          canal: string | null
          contact_id: number | null
          created_at: string | null
          id: number
          message: string | null
          segment_name: string | null
          statut: string | null
          sujet: string | null
          type: string | null
          workflow_name: string | null
        }
        Insert: {
          canal?: string | null
          contact_id?: number | null
          created_at?: string | null
          id?: number
          message?: string | null
          segment_name?: string | null
          statut?: string | null
          sujet?: string | null
          type?: string | null
          workflow_name?: string | null
        }
        Update: {
          canal?: string | null
          contact_id?: number | null
          created_at?: string | null
          id?: number
          message?: string | null
          segment_name?: string | null
          statut?: string | null
          sujet?: string | null
          type?: string | null
          workflow_name?: string | null
        }
        Relationships: []
      }
      projets: {
        Row: {
          commercial: string | null
          contact_id: number | null
          contrat: boolean | null
          created_at: string | null
          date_creation: string | null
          date_souscription: string | null
          origine: string | null
          projet_id: number
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          commercial?: string | null
          contact_id?: number | null
          contrat?: boolean | null
          created_at?: string | null
          date_creation?: string | null
          date_souscription?: string | null
          origine?: string | null
          projet_id: number
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          commercial?: string | null
          contact_id?: number | null
          contrat?: boolean | null
          created_at?: string | null
          date_creation?: string | null
          date_souscription?: string | null
          origine?: string | null
          projet_id?: number
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["identifiant"]
          },
        ]
      }
      segments: {
        Row: {
          conditions: Json | null
          couleur: string | null
          created_at: string | null
          criteres: Json
          delai_relance: number | null
          description: string | null
          id: number
          nom: string
          priorite_segment: number | null
          regle_attribution: string | null
          segment_parent_id: number | null
          statut_projet: string | null
          type_attribution: string | null
          type_segment: string | null
        }
        Insert: {
          conditions?: Json | null
          couleur?: string | null
          created_at?: string | null
          criteres?: Json
          delai_relance?: number | null
          description?: string | null
          id?: number
          nom: string
          priorite_segment?: number | null
          regle_attribution?: string | null
          segment_parent_id?: number | null
          statut_projet?: string | null
          type_attribution?: string | null
          type_segment?: string | null
        }
        Update: {
          conditions?: Json | null
          couleur?: string | null
          created_at?: string | null
          criteres?: Json
          delai_relance?: number | null
          description?: string | null
          id?: number
          nom?: string
          priorite_segment?: number | null
          regle_attribution?: string | null
          segment_parent_id?: number | null
          statut_projet?: string | null
          type_attribution?: string | null
          type_segment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_segment_parent_id_fkey"
            columns: ["segment_parent_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          type: string | null
          value: string | null
        }
        Insert: {
          key: string
          type?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          type?: string | null
          value?: string | null
        }
        Relationships: []
      }
      templates_email: {
        Row: {
          contenu: string | null
          description: string | null
          id: number
          nom: string | null
        }
        Insert: {
          contenu?: string | null
          description?: string | null
          id?: number
          nom?: string | null
        }
        Update: {
          contenu?: string | null
          description?: string | null
          id?: number
          nom?: string | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          date: string | null
          duree: number | null
          id: number
          statut: string | null
          workflow_id: number | null
        }
        Insert: {
          date?: string | null
          duree?: number | null
          id?: number
          statut?: string | null
          workflow_id?: number | null
        }
        Update: {
          date?: string | null
          duree?: number | null
          id?: number
          statut?: string | null
          workflow_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actif: boolean | null
          actions: Json | null
          conditions_declenchement: Json | null
          corps_email: string | null
          created_at: string | null
          declencheur: string | null
          delai: number | null
          derniere_execution: string | null
          description: string | null
          etapes: Json | null
          etapes_workflow: Json | null
          frequence: string | null
          id: number
          nom: string | null
          segment_id: number | null
          statut: string | null
          statut_declencheur: string | null
          sujet_email: string | null
          template_id: number | null
          type: string | null
          type_declencheur: string | null
        }
        Insert: {
          actif?: boolean | null
          actions?: Json | null
          conditions_declenchement?: Json | null
          corps_email?: string | null
          created_at?: string | null
          declencheur?: string | null
          delai?: number | null
          derniere_execution?: string | null
          description?: string | null
          etapes?: Json | null
          etapes_workflow?: Json | null
          frequence?: string | null
          id?: number
          nom?: string | null
          segment_id?: number | null
          statut?: string | null
          statut_declencheur?: string | null
          sujet_email?: string | null
          template_id?: number | null
          type?: string | null
          type_declencheur?: string | null
        }
        Update: {
          actif?: boolean | null
          actions?: Json | null
          conditions_declenchement?: Json | null
          corps_email?: string | null
          created_at?: string | null
          declencheur?: string | null
          delai?: number | null
          derniere_execution?: string | null
          description?: string | null
          etapes?: Json | null
          etapes_workflow?: Json | null
          frequence?: string | null
          id?: number
          nom?: string | null
          segment_id?: number | null
          statut?: string | null
          statut_declencheur?: string | null
          sujet_email?: string | null
          template_id?: number | null
          type?: string | null
          type_declencheur?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_email"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vue_performances_campagnes: {
        Row: {
          campaign_name: string | null
          campaign_status: string | null
          date_envoi: string | null
          emails_cliques: number | null
          emails_envoyes: number | null
          emails_ouverts: number | null
          segment_name: string | null
          taux_clic: number | null
          taux_ouverture: number | null
          total_contacts: number | null
          tracking_stats: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_kpis: {
        Args: { end_date: string; start_date: string; user_id: string }
        Returns: {
          avg_deal_size_calc: number
          contracts_signed_count: number
          conversion_rate_calc: number
          converted_clients_count: number
          new_prospects_count: number
          target_achievement_calc: number
          total_commission_amount: number
          total_contacts_count: number
          total_revenue_amount: number
        }[]
      }
      convert_date: {
        Args: { input_date: string }
        Returns: string
      }
      convert_french_decimal: {
        Args: { input: string }
        Returns: number
      }
      count_projects_by_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          statut: string
        }[]
      }
      declencher_automatisation: {
        Args: { p_automatisation_id: number; p_donnees_declencheur: Json }
        Returns: Json
      }
      execute_automation_trigger: {
        Args: { p_trigger_data?: Json; p_trigger_type: string }
        Returns: {
          automation_count: number
          execution_id: number
        }[]
      }
      generate_client_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_contract_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_age_niches: {
        Args: { collaborator_id: string }
        Returns: {
          count: number
          criteria: string
          description: string
          name: string
        }[]
      }
      get_cross_selling_opportunities: {
        Args: { collaborator_id: string }
        Returns: {
          count: number
          criteria: string
          description: string
          name: string
        }[]
      }
      get_geo_potential_opportunities: {
        Args: { collaborator_id: string }
        Returns: {
          count: number
          criteria: string
          description: string
          name: string
        }[]
      }
      mark_email_failed: {
        Args: { p_error_details: string; p_queue_id: number }
        Returns: undefined
      }
      mark_email_sent: {
        Args: {
          p_message_id: string
          p_queue_id: number
          p_smtp_response: string
        }
        Returns: undefined
      }
      process_email_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json
          contenu: string
          email: string
          queue_id: number
          sujet: string
        }[]
      }
      send_email_batch: {
        Args: { p_segment_id: number; p_template_id: number }
        Returns: undefined
      }
      ufn_get_user_emails_and_passwords: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          encrypted_password: string
        }[]
      }
      update_email_stats: {
        Args: { p_config_id: number; p_count?: number; p_type: string }
        Returns: undefined
      }
      valider_automatisation: {
        Args: { p_config: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
