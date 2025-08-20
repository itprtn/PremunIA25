-- SQL Functions for Email System
-- Functions used by Edge Functions for email processing

-- Function to get pending emails from queue
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS TABLE (
  queue_id integer,
  campagne_id integer,
  contact_id integer,
  email text,
  sujet text,
  contenu text,
  config jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update status to processing to avoid concurrent processing
  UPDATE public.email_queue 
  SET statut = 'processing', updated_at = now()
  WHERE id IN (
    SELECT eq.id 
    FROM public.email_queue eq
    WHERE eq.statut = 'pending' 
    AND eq.scheduled_for <= now()
    AND eq.retry_count < eq.max_retries
    ORDER BY eq.scheduled_for ASC
    LIMIT 50
    FOR UPDATE SKIP LOCKED
  );

  -- Return the emails to process
  RETURN QUERY
  SELECT 
    eq.id as queue_id,
    eq.campagne_id,
    eq.contact_id,
    eq.email_destinataire as email,
    eq.sujet,
    eq.contenu_html as contenu,
    eq.config
  FROM public.email_queue eq
  WHERE eq.statut = 'processing'
  ORDER BY eq.scheduled_for ASC;
END;
$$;

-- Function to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(
  p_queue_id integer,
  p_message_id text,
  p_smtp_response text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update queue status
  UPDATE public.email_queue 
  SET 
    statut = 'sent',
    sent_at = now(),
    message_id = p_message_id,
    smtp_response = p_smtp_response,
    updated_at = now()
  WHERE id = p_queue_id;

  -- Insert into logs
  INSERT INTO public.email_logs (
    queue_id, campagne_id, contact_id, email_destinataire, 
    sujet, statut, message_id, smtp_response, sent_at
  )
  SELECT 
    eq.id, eq.campagne_id, eq.contact_id, eq.email_destinataire,
    eq.sujet, 'sent', p_message_id, p_smtp_response, now()
  FROM public.email_queue eq
  WHERE eq.id = p_queue_id;

  -- Update campaign stats
  UPDATE public.campagnes_email 
  SET tracking_stats = jsonb_set(
    tracking_stats, 
    '{envois}', 
    ((tracking_stats->>'envois')::int + 1)::text::jsonb
  )
  WHERE id = (SELECT campagne_id FROM public.email_queue WHERE id = p_queue_id);
END;
$$;

-- Function to mark email as failed
CREATE OR REPLACE FUNCTION mark_email_failed(
  p_queue_id integer,
  p_error_details text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_retry_count integer;
  v_max_retries integer;
BEGIN
  -- Get current retry info
  SELECT retry_count, max_retries 
  INTO v_retry_count, v_max_retries
  FROM public.email_queue 
  WHERE id = p_queue_id;

  -- Increment retry count
  v_retry_count := v_retry_count + 1;

  IF v_retry_count >= v_max_retries THEN
    -- Max retries reached, mark as failed
    UPDATE public.email_queue 
    SET 
      statut = 'failed',
      failed_at = now(),
      retry_count = v_retry_count,
      error_message = p_error_details,
      updated_at = now()
    WHERE id = p_queue_id;
  ELSE
    -- Schedule for retry (exponential backoff)
    UPDATE public.email_queue 
    SET 
      statut = 'pending',
      retry_count = v_retry_count,
      error_message = p_error_details,
      scheduled_for = now() + (interval '5 minutes' * power(2, v_retry_count)),
      updated_at = now()
    WHERE id = p_queue_id;
  END IF;

  -- Insert into logs
  INSERT INTO public.email_logs (
    queue_id, campagne_id, contact_id, email_destinataire, 
    sujet, statut, error_details
  )
  SELECT 
    eq.id, eq.campagne_id, eq.contact_id, eq.email_destinataire,
    eq.sujet, 'failed', p_error_details
  FROM public.email_queue eq
  WHERE eq.id = p_queue_id;
END;
$$;

-- Function to get email statistics
CREATE OR REPLACE FUNCTION get_email_stats(p_campagne_id integer DEFAULT NULL)
RETURNS TABLE (
  total_sent integer,
  total_opened integer,
  total_clicked integer,
  total_bounced integer,
  total_unsubscribed integer,
  open_rate numeric,
  click_rate numeric,
  bounce_rate numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_sent integer := 0;
  v_total_opened integer := 0;
  v_total_clicked integer := 0;
  v_total_bounced integer := 0;
  v_total_unsubscribed integer := 0;
BEGIN
  -- Get counts based on campaign filter
  IF p_campagne_id IS NOT NULL THEN
    SELECT 
      COUNT(*) FILTER (WHERE statut = 'sent'),
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL),
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL),
      COUNT(*) FILTER (WHERE bounced_at IS NOT NULL),
      COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)
    INTO v_total_sent, v_total_opened, v_total_clicked, v_total_bounced, v_total_unsubscribed
    FROM public.email_logs
    WHERE campagne_id = p_campagne_id;
  ELSE
    SELECT 
      COUNT(*) FILTER (WHERE statut = 'sent'),
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL),
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL),
      COUNT(*) FILTER (WHERE bounced_at IS NOT NULL),
      COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)
    INTO v_total_sent, v_total_opened, v_total_clicked, v_total_bounced, v_total_unsubscribed
    FROM public.email_logs;
  END IF;

  -- Calculate rates
  RETURN QUERY SELECT 
    v_total_sent,
    v_total_opened,
    v_total_clicked,
    v_total_bounced,
    v_total_unsubscribed,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_opened::numeric / v_total_sent::numeric) * 100, 2) ELSE 0 END,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_clicked::numeric / v_total_sent::numeric) * 100, 2) ELSE 0 END,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_bounced::numeric / v_total_sent::numeric) * 100, 2) ELSE 0 END;
END;
$$;
