-- Insert Premunia Email Configuration
-- Configuration SMTP pour info@premunia.com

INSERT INTO public.email_configurations (
  id, email, description, smtp_host, smtp_port, smtp_secure, 
  smtp_username, smtp_password, imap_host, imap_port, imap_secure, 
  is_active, created_at, updated_at
) VALUES (
  2, 
  'info@premunia.com', 
  'Configuration Premunia - Serveur Brevo', 
  'mail.premunia.com', 
  587, 
  true, 
  'info@premunia.com', 
  'h6P=4k)*U2IP$:=m', 
  null, 
  null, 
  true, 
  true, 
  '2025-07-24 11:09:20.448367+00', 
  '2025-08-15 20:41:41.807147+00'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  description = EXCLUDED.description,
  smtp_host = EXCLUDED.smtp_host,
  smtp_port = EXCLUDED.smtp_port,
  smtp_secure = EXCLUDED.smtp_secure,
  smtp_username = EXCLUDED.smtp_username,
  smtp_password = EXCLUDED.smtp_password,
  is_active = EXCLUDED.is_active,
  updated_at = now();
