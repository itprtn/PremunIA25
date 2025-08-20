-- Tables for Automation System with AI Integration
-- This script creates the automation and AI recommendation tables

-- Automation triggers table
CREATE TABLE IF NOT EXISTS public.automation_triggers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('contact_created', 'project_updated', 'status_changed', 'manual', 'scheduled')),
  trigger_conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_executed timestamp with time zone,
  execution_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id)
);

-- Automation actions table
CREATE TABLE IF NOT EXISTS public.automation_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id uuid REFERENCES public.automation_triggers(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('send_email', 'update_status', 'create_task', 'ai_recommendation', 'webhook')),
  action_config jsonb NOT NULL DEFAULT '{}',
  execution_order integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id uuid REFERENCES public.automation_triggers(id) ON DELETE SET NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('optimization', 'trigger_suggestion', 'action_improvement', 'performance')),
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  suggested_changes jsonb DEFAULT '{}',
  expected_impact text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  applied_at timestamp with time zone,
  created_by_ai boolean DEFAULT true
);

-- Automation executions table (for tracking and analytics)
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id uuid REFERENCES public.automation_triggers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  trigger_data jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  error_message text,
  execution_duration interval,
  created_at timestamp with time zone DEFAULT now()
);

-- Performance analytics view
CREATE OR REPLACE VIEW public.automation_performance_stats AS
SELECT 
  at.id,
  at.name,
  at.trigger_type,
  at.execution_count,
  COUNT(ae.id) as total_executions,
  COUNT(CASE WHEN ae.status = 'completed' THEN 1 END) as successful_executions,
  COUNT(CASE WHEN ae.status = 'failed' THEN 1 END) as failed_executions,
  ROUND(
    COUNT(CASE WHEN ae.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(ae.id), 0) * 100, 2
  ) as success_rate,
  AVG(EXTRACT(EPOCH FROM ae.execution_duration)) as avg_execution_seconds,
  MAX(ae.completed_at) as last_execution_date
FROM public.automation_triggers at
LEFT JOIN public.automation_executions ae ON at.id = ae.automation_id
WHERE at.created_at >= NOW() - INTERVAL '30 days'
GROUP BY at.id, at.name, at.trigger_type, at.execution_count;

-- Function to get automation performance stats
CREATE OR REPLACE FUNCTION get_automation_performance_stats()
RETURNS TABLE (
  automation_id uuid,
  automation_name text,
  trigger_type text,
  success_rate numeric,
  avg_execution_time numeric,
  total_executions bigint,
  last_execution timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.name,
    at.trigger_type,
    COALESCE(
      ROUND(
        COUNT(CASE WHEN ae.status = 'completed' THEN 1 END)::numeric / 
        NULLIF(COUNT(ae.id), 0) * 100, 2
      ), 0
    ) as success_rate,
    COALESCE(AVG(EXTRACT(EPOCH FROM ae.execution_duration)), 0) as avg_execution_time,
    COUNT(ae.id) as total_executions,
    MAX(ae.completed_at) as last_execution
  FROM public.automation_triggers at
  LEFT JOIN public.automation_executions ae ON at.id = ae.automation_id
  WHERE at.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY at.id, at.name, at.trigger_type;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_triggers_type ON public.automation_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_active ON public.automation_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_actions_automation ON public.automation_actions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_automation ON public.automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON public.automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_confidence ON public.ai_recommendations(confidence_score);

-- Enable RLS on all tables
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for automation_triggers
CREATE POLICY "Users can view their own automation triggers" ON public.automation_triggers
  FOR SELECT USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert their own automation triggers" ON public.automation_triggers
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own automation triggers" ON public.automation_triggers
  FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own automation triggers" ON public.automation_triggers
  FOR DELETE USING (auth.uid() = created_by OR created_by IS NULL);

-- RLS policies for automation_actions
CREATE POLICY "Users can manage automation actions" ON public.automation_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.automation_triggers at 
      WHERE at.id = automation_actions.automation_id 
      AND (at.created_by = auth.uid() OR at.created_by IS NULL)
    )
  );

-- RLS policies for ai_recommendations  
CREATE POLICY "Users can view AI recommendations" ON public.ai_recommendations
  FOR SELECT USING (
    automation_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.automation_triggers at 
      WHERE at.id = ai_recommendations.automation_id 
      AND (at.created_by = auth.uid() OR at.created_by IS NULL)
    )
  );

CREATE POLICY "System can insert AI recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update AI recommendations status" ON public.ai_recommendations
  FOR UPDATE USING (
    automation_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.automation_triggers at 
      WHERE at.id = ai_recommendations.automation_id 
      AND (at.created_by = auth.uid() OR at.created_by IS NULL)
    )
  );

-- RLS policies for automation_executions
CREATE POLICY "Users can view automation executions" ON public.automation_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.automation_triggers at 
      WHERE at.id = automation_executions.automation_id 
      AND (at.created_by = auth.uid() OR at.created_by IS NULL)
    )
  );

CREATE POLICY "System can manage automation executions" ON public.automation_executions
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.automation_triggers TO authenticated;
GRANT ALL ON public.automation_actions TO authenticated;
GRANT ALL ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.automation_executions TO authenticated;
GRANT SELECT ON public.automation_performance_stats TO authenticated;