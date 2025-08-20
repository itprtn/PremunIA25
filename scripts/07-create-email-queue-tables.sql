-- Email Queue System Tables
-- Tables for managing email queue and processing

-- Email queue table for managing email sends
CREATE TABLE IF NOT EXISTS public.email_queue (
  id serial PRIMARY KEY,
  campagne_id integer REFERENCES public.campagnes_email(id),
  contact_id integer,
  email_destinataire text NOT NULL,
  sujet text NOT NULL,
  contenu_html text NOT NULL,
  contenu_texte text,
  statut text DEFAULT 'pending' CHECK (statut IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_for timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  failed_at timestamp with time zone,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  error_message text,
  message_id text,
  smtp_response text,
  config jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Email logs table for detailed tracking
CREATE TABLE IF NOT EXISTS public.email_logs (
  id serial PRIMARY KEY,
  queue_id integer REFERENCES public.email_queue(id),
  campagne_id integer REFERENCES public.campagnes_email(id),
  contact_id integer,
  email_destinataire text NOT NULL,
  sujet text,
  statut text NOT NULL,
  message_id text,
  smtp_response text,
  error_details text,
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  bounced_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  tracking_id uuid DEFAULT uuid_generate_v4(),
  user_agent text,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_statut ON public.email_queue(statut);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_campagne ON public.email_queue(campagne_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_tracking ON public.email_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_contact ON public.email_logs(contact_id);
