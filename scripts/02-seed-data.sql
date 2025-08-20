-- Seed data for CRM system

-- Insert sample contacts
INSERT INTO public.contact (civilite, prenom, nom, email, telephone, ville) VALUES
('M.', 'Jean', 'Dupont', 'jean.dupont@email.com', '0123456789', 'Paris'),
('Mme', 'Marie', 'Martin', 'marie.martin@email.com', '0123456790', 'Lyon'),
('M.', 'Pierre', 'Durand', 'pierre.durand@email.com', '0123456791', 'Marseille'),
('Mme', 'Sophie', 'Leroy', 'sophie.leroy@email.com', '0123456792', 'Toulouse')
ON CONFLICT (email) DO NOTHING;

-- Insert sample segments
INSERT INTO public.segments (nom, description, criteres, couleur) VALUES
('Prospects Chauds', 'Contacts très intéressés par nos services', '{"statut": "prospect", "score": ">80"}', '#ff6b6b'),
('Clients VIP', 'Clients à forte valeur ajoutée', '{"type": "client", "ca_annuel": ">50000"}', '#4ecdc4'),
('Nouveaux Contacts', 'Contacts récemment ajoutés', '{"created_at": "last_30_days"}', '#45b7d1'),
('Clients Inactifs', 'Clients sans interaction récente', '{"last_interaction": "<90_days"}', '#96ceb4')
ON CONFLICT DO NOTHING;

-- Insert sample email templates
INSERT INTO public.templates_email (nom, description, contenu) VALUES
('Bienvenue', 'Template de bienvenue pour nouveaux contacts', 'Bonjour {{prenom}}, bienvenue dans notre CRM !'),
('Relance', 'Template de relance commerciale', 'Bonjour {{prenom}}, nous aimerions reprendre contact avec vous.'),
('Newsletter', 'Template pour newsletter mensuelle', 'Découvrez nos actualités du mois, {{prenom}} !')
ON CONFLICT DO NOTHING;

-- Insert sample email templates (enhanced)
INSERT INTO public.email_templates (nom, sujet, contenu_html, contenu_texte, variables, categorie) VALUES
('Bienvenue Client', 'Bienvenue {{prenom}} !', 
 '<h1>Bienvenue {{prenom}} {{nom}} !</h1><p>Nous sommes ravis de vous accueillir.</p>', 
 'Bienvenue {{prenom}} {{nom}} ! Nous sommes ravis de vous accueillir.',
 '{"prenom": "string", "nom": "string"}', 'onboarding'),
('Relance Commerciale', 'Reprenons contact, {{prenom}}', 
 '<h2>Bonjour {{prenom}},</h2><p>Nous aimerions reprendre contact avec vous concernant {{sujet}}.</p>', 
 'Bonjour {{prenom}}, nous aimerions reprendre contact avec vous concernant {{sujet}}.',
 '{"prenom": "string", "sujet": "string"}', 'commercial')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO public.projets (contact_id, origine, statut, commercial) 
SELECT identifiant, 'Web', 'nouveau', 'Commercial A' 
FROM public.contact 
WHERE email = 'jean.dupont@email.com'
ON CONFLICT DO NOTHING;

-- Insert sample settings
INSERT INTO public.settings (key, value, type) VALUES
('company_name', 'Mon CRM', 'string'),
('default_currency', 'EUR', 'string'),
('timezone', 'Europe/Paris', 'string')
ON CONFLICT (key) DO NOTHING;
