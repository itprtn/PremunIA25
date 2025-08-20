-- CRM Database Schema Setup
-- This script creates all the necessary tables for the CRM system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contact table (main contacts/clients)
CREATE TABLE IF NOT EXISTS public.contact (
  identifiant bigserial PRIMARY KEY,
  civilite text,
  prenom text,
  nom text,
  raison_sociale text,
  adresse text,
  code_postal text,
  ville text,
  telephone text,
  email text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projets (
  projet_id bigserial PRIMARY KEY,
  contact_id bigint REFERENCES public.contact(identifiant),
  date_creation timestamp with time zone DEFAULT now(),
  origine text,
  statut text DEFAULT 'nouveau',
  commercial text,
  date_souscription timestamp with time zone,
  contrat boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contrats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id bigint REFERENCES public.contact(identifiant),
  contact_civilite text,
  contact_prenom text,
  contact_nom text,
  contact_raison_sociale text,
  contact_adresse text,
  contact_complement_adresse text,
  contact_code_postal text,
  contact_ville text,
  projet_id bigint REFERENCES public.projets(projet_id),
  projet_type text,
  projet_origine text,
  projet_provenance text,
  projet_auteur text,
  projet_statut text,
  projet_date_creation timestamp with time zone,
  projet_derniere_modification timestamp with time zone,
  projet_date_souscription timestamp with time zone,
  projet_iban text,
  projet_bic text,
  projet_attribution text,
  contrat_num_version text,
  contrat_compagnie text,
  contrat_produit text,
  contrat_formule text,
  contrat_options text,
  contrat_date_creation timestamp with time zone DEFAULT now(),
  contrat_debut_signature timestamp with time zone,
  contrat_debut_effet timestamp with time zone,
  contrat_date_echeance timestamp with time zone,
  contrat_demande_resiliation timestamp with time zone,
  contrat_fin_contrat timestamp with time zone,
  contrat_motif_resiliation text,
  contrat_num_contrat text,
  prime_brute_mensuelle numeric,
  prime_nette_mensuelle numeric,
  prime_brute_annuelle numeric,
  prime_nette_annuelle numeric,
  frais_honoraires numeric,
  nb_mois_gratuits_annee1 integer,
  nb_mois_gratuits_annee2 integer,
  nb_mois_gratuits_annee3 integer,
  fractionnement text,
  type_commissionnement text,
  commissionnement_annee1 numeric,
  commissionnement_autres_annees numeric,
  contrat_commentaire text
);

-- Segments table for contact segmentation
CREATE TABLE IF NOT EXISTS public.segments (
  id serial PRIMARY KEY,
  nom text NOT NULL,
  description text,
  criteres jsonb NOT NULL DEFAULT '{}',
  couleur text,
  created_at timestamp with time zone DEFAULT now(),
  type_segment text DEFAULT 'statut',
  statut_projet text,
  conditions jsonb DEFAULT '{}',
  segment_parent_id integer REFERENCES public.segments(id),
  type_attribution text,
  regle_attribution text,
  delai_relance integer,
  priorite_segment integer
);

-- Email templates
CREATE TABLE IF NOT EXISTS public.templates_email (
  id serial PRIMARY KEY,
  nom text,
  description text,
  contenu text
);

-- Email configurations
CREATE TABLE IF NOT EXISTS public.email_configurations (
  id serial PRIMARY KEY,
  email character varying NOT NULL UNIQUE,
  description text,
  smtp_host character varying,
  smtp_port integer,
  smtp_secure boolean DEFAULT true,
  smtp_username character varying,
  smtp_password text,
  imap_host character varying,
  imap_port integer,
  imap_secure boolean DEFAULT true,
  is_active boolean DEFAULT true,
  last_check timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Workflows for automation
CREATE TABLE IF NOT EXISTS public.workflows (
  id serial PRIMARY KEY,
  nom text,
  declencheur text,
  etapes jsonb,
  statut text,
  derniere_execution timestamp with time zone,
  sujet_email text,
  corps_email text,
  segment_id integer REFERENCES public.segments(id),
  template_id integer REFERENCES public.templates_email(id),
  description text,
  type text,
  delai integer,
  actions jsonb,
  actif boolean DEFAULT true,
  frequence text,
  created_at timestamp with time zone DEFAULT now(),
  statut_declencheur text,
  type_declencheur text CHECK (type_declencheur = ANY (ARRAY['statut'::text, 'segment'::text, 'manuel'::text, 'automatique'::text])),
  conditions_declenchement jsonb DEFAULT '{}',
  etapes_workflow jsonb DEFAULT '[]'
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS public.campagnes_email (
  id serial PRIMARY KEY,
  nom text NOT NULL,
  description text,
  workflow_id integer REFERENCES public.workflows(id),
  segment_id integer REFERENCES public.segments(id),
  template_id integer REFERENCES public.templates_email(id),
  email_config_id integer REFERENCES public.email_configurations(id),
  statut_cible text,
  planification_type text DEFAULT 'manuel',
  date_planifiee timestamp with time zone,
  frequence text,
  conditions_declenchement jsonb DEFAULT '{}',
  parametres_avances jsonb DEFAULT '{}',
  statut text DEFAULT 'brouillon',
  date_lancement timestamp with time zone,
  date_fin timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tracking_stats jsonb DEFAULT '{"clics": 0, "envois": 0, "bounces": 0, "ouvertures": 0, "desabonnements": 0}',
  contact_count integer DEFAULT 0,
  last_execution timestamp with time zone,
  next_execution timestamp with time zone
);

-- Email sends tracking
CREATE TABLE IF NOT EXISTS public.envois_email (
  id serial PRIMARY KEY,
  campagne_id integer REFERENCES public.campagnes_email(id),
  contact_id integer,
  projet_id integer,
  email_destinataire text NOT NULL,
  sujet text,
  contenu_html text,
  contenu_texte text,
  statut text DEFAULT 'en_attente',
  date_envoi timestamp with time zone,
  date_ouverture timestamp with time zone,
  date_clic timestamp with time zone,
  erreur_message text,
  tracking_id text DEFAULT uuid_generate_v4() UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id serial PRIMARY KEY,
  workflow_id integer REFERENCES public.workflows(id),
  statut text,
  date timestamp with time zone DEFAULT now(),
  duree double precision
);

-- Interactions tracking
CREATE TABLE IF NOT EXISTS public.interactions (
  id serial PRIMARY KEY,
  contact_id integer,
  created_at timestamp with time zone DEFAULT now(),
  type text,
  canal text,
  sujet text,
  message text,
  statut text,
  workflow_name text,
  segment_name text
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text,
  type text
);

-- Email templates with enhanced structure
CREATE TABLE IF NOT EXISTS public.email_templates (
  id serial PRIMARY KEY,
  nom text NOT NULL,
  sujet text NOT NULL,
  contenu_html text NOT NULL,
  contenu_texte text,
  variables jsonb DEFAULT '{}',
  categorie text DEFAULT 'general',
  statut text DEFAULT 'actif',
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
