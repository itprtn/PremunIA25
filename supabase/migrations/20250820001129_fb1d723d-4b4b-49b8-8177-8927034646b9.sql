-- Créer la table pour les déclencheurs d'automatisation
CREATE TABLE IF NOT EXISTS automation_triggers (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('project_created', 'project_updated', 'project_status_changed', 'contact_created', 'contact_updated', 'email_sent', 'time_based')),
  trigger_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les actions d'automatisation exécutées
CREATE TABLE IF NOT EXISTS automation_actions (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'update_contact', 'create_task', 'move_to_segment', 'ai_recommendation', 'webhook')),
  action_config JSONB NOT NULL DEFAULT '{}',
  execution_order INTEGER DEFAULT 1,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les recommandations IA
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id SERIAL PRIMARY KEY,
  contact_id BIGINT,
  projet_id BIGINT,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('next_action', 'product_suggestion', 'follow_up', 'risk_assessment', 'cross_sell')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'viewed', 'applied', 'dismissed')) DEFAULT 'pending',
  ai_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les exécutions d'automatisation avec détails
CREATE TABLE IF NOT EXISTS automation_executions (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_data JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_duration INTEGER, -- en millisecondes
  actions_executed INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0
);

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_automation_triggers_type ON automation_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_active ON automation_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_contact ON ai_recommendations(contact_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_projet ON ai_recommendations(projet_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- Fonction pour créer automatiquement des recommandations IA
CREATE OR REPLACE FUNCTION generate_ai_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une recommandation de suivi pour les nouveaux projets
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'projets' THEN
    INSERT INTO ai_recommendations (
      contact_id, 
      projet_id, 
      recommendation_type, 
      title, 
      description, 
      confidence_score, 
      priority
    ) VALUES (
      NEW.contact_id,
      NEW.projet_id,
      'follow_up',
      'Nouveau projet créé - Suivi recommandé',
      'Un nouveau projet a été créé. Il est recommandé de planifier un appel de suivi dans les 24h.',
      0.85,
      'high'
    );
  END IF;
  
  -- Créer une recommandation pour les changements de statut
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'projets' AND OLD.statut != NEW.statut THEN
    INSERT INTO ai_recommendations (
      contact_id,
      projet_id,
      recommendation_type,
      title,
      description,
      confidence_score,
      priority
    ) VALUES (
      NEW.contact_id,
      NEW.projet_id,
      'next_action',
      'Statut projet modifié - Action recommandée',
      format('Le statut du projet est passé de "%s" à "%s". Actions suggérées selon le nouveau statut.', OLD.statut, NEW.statut),
      0.75,
      'medium'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers pour les recommandations automatiques
DROP TRIGGER IF EXISTS trigger_ai_recommendations_projets ON projets;
CREATE TRIGGER trigger_ai_recommendations_projets
  AFTER INSERT OR UPDATE ON projets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ai_recommendations();

-- Fonction pour exécuter les automatisations
CREATE OR REPLACE FUNCTION execute_automation_trigger(
  p_trigger_type TEXT,
  p_trigger_data JSONB DEFAULT '{}'
)
RETURNS TABLE(execution_id INTEGER, automation_count INTEGER) AS $$
DECLARE
  automation_rec RECORD;
  execution_rec RECORD;
  v_execution_id INTEGER;
BEGIN
  automation_count := 0;
  
  -- Trouver toutes les automatisations actives pour ce type de déclencheur
  FOR automation_rec IN 
    SELECT DISTINCT w.id, w.nom, w.actions, w.etapes
    FROM workflows w
    JOIN automation_triggers at ON w.id = at.automation_id
    WHERE at.trigger_type = p_trigger_type 
    AND at.is_active = true 
    AND w.actif = true
  LOOP
    -- Créer une exécution pour cette automatisation
    INSERT INTO automation_executions (
      automation_id,
      trigger_data,
      total_actions
    ) VALUES (
      automation_rec.id,
      p_trigger_data,
      COALESCE(jsonb_array_length(automation_rec.actions), 1)
    ) RETURNING id INTO v_execution_id;
    
    execution_id := v_execution_id;
    automation_count := automation_count + 1;
  END LOOP;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;