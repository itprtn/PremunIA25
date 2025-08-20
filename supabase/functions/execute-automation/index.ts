import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { automation_id } = await req.json()

    if (!automation_id) {
      throw new Error('ID d\'automatisation manquant')
    }

    // Récupérer l'automatisation
    const { data: automation, error: automationError } = await supabaseClient
      .from('automation_triggers')
      .select(`
        *,
        automation_actions (*)
      `)
      .eq('id', automation_id)
      .single()

    if (automationError) throw automationError
    if (!automation) throw new Error('Automatisation non trouvée')

    // Vérifier si l'automatisation est active
    if (!automation.is_active) {
      throw new Error('Automatisation désactivée')
    }

    // Créer un enregistrement d'exécution
    const { data: execution, error: executionError } = await supabaseClient
      .from('automation_executions')
      .insert([{
        automation_id: automation_id,
        status: 'running',
        started_at: new Date().toISOString(),
        trigger_data: { manual_execution: true }
      }])
      .select()
      .single()

    if (executionError) throw executionError

    try {
      // Exécuter les actions
      const results = await executeActions(supabaseClient, automation.automation_actions, {
        automation_id,
        execution_id: execution.id,
        trigger_type: automation.trigger_type,
        trigger_conditions: automation.trigger_conditions
      })

      // Mettre à jour l'exécution comme terminée
      await supabaseClient
        .from('automation_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results: results,
          error_message: null
        })
        .eq('id', execution.id)

      // Mettre à jour les statistiques de l'automatisation
      await supabaseClient
        .from('automation_triggers')
        .update({
          execution_count: (automation.execution_count || 0) + 1,
          last_executed: new Date().toISOString()
        })
        .eq('id', automation_id)

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: execution.id,
          results: results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (actionError) {
      // Marquer l'exécution comme échouée
      await supabaseClient
        .from('automation_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: actionError.message
        })
        .eq('id', execution.id)

      throw actionError
    }

  } catch (error) {
    console.error('Erreur dans execute-automation:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function executeActions(supabaseClient: any, actions: any[], context: any) {
  const results = []

  for (const action of actions) {
    try {
      let result = null

      switch (action.action_type) {
        case 'send_email':
          result = await executeSendEmail(supabaseClient, action.action_config, context)
          break
        
        case 'update_status':
          result = await executeUpdateStatus(supabaseClient, action.action_config, context)
          break
        
        case 'create_task':
          result = await executeCreateTask(supabaseClient, action.action_config, context)
          break
        
        case 'ai_recommendation':
          result = await executeAIRecommendation(supabaseClient, action.action_config, context)
          break
        
        default:
          throw new Error(`Type d'action non supporté: ${action.action_type}`)
      }

      results.push({
        action_id: action.id,
        action_type: action.action_type,
        status: 'success',
        result: result
      })

    } catch (actionError) {
      console.error(`Erreur action ${action.action_type}:`, actionError)
      results.push({
        action_id: action.id,
        action_type: action.action_type,
        status: 'error',
        error: actionError.message
      })
    }
  }

  return results
}

async function executeSendEmail(supabaseClient: any, config: any, context: any) {
  // Récupérer les contacts ciblés selon les critères
  const contacts = await getTargetedContacts(supabaseClient, config.target_criteria)
  
  const emailResults = []
  
  for (const contact of contacts) {
    try {
      // Appeler la fonction d'envoi d'email
      const { data, error } = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: contact.email,
          subject: config.subject,
          html: config.html_content,
          text: config.text_content
        }
      })

      if (error) throw error

      emailResults.push({
        contact_id: contact.identifiant,
        email: contact.email,
        status: 'sent',
        message_id: data?.messageId
      })

    } catch (error) {
      emailResults.push({
        contact_id: contact.identifiant,
        email: contact.email,
        status: 'failed',
        error: error.message
      })
    }
  }

  return {
    emails_sent: emailResults.filter(r => r.status === 'sent').length,
    emails_failed: emailResults.filter(r => r.status === 'failed').length,
    details: emailResults
  }
}

async function executeUpdateStatus(supabaseClient: any, config: any, context: any) {
  const { data, error } = await supabaseClient
    .from(config.table)
    .update({ [config.field]: config.new_value })
    .eq(config.where_field, config.where_value)

  if (error) throw error

  return {
    updated_records: data?.length || 0,
    table: config.table,
    field: config.field,
    new_value: config.new_value
  }
}

async function executeCreateTask(supabaseClient: any, config: any, context: any) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert([{
      title: config.title,
      description: config.description,
      assigned_to: config.assigned_to,
      due_date: config.due_date,
      priority: config.priority || 'medium',
      automation_id: context.automation_id
    }])
    .select()
    .single()

  if (error) throw error

  return {
    task_id: data.id,
    title: data.title,
    assigned_to: data.assigned_to
  }
}

async function executeAIRecommendation(supabaseClient: any, config: any, context: any) {
  // Générer une recommandation IA pour le contexte donné
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
  
  if (!geminiApiKey) {
    throw new Error('Clé API Gemini non configurée')
  }

  const prompt = `
Analyse le contexte suivant et fournis une recommandation d'action :

Contexte: ${JSON.stringify(context, null, 2)}
Configuration: ${JSON.stringify(config, null, 2)}

Fournis une recommandation au format JSON :
{
  "recommendation": "description de la recommandation",
  "priority": "high|medium|low",
  "suggested_actions": ["action1", "action2"],
  "rationale": "justification de la recommandation"
}
`

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiApiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Erreur API Gemini: ${response.status}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  return {
    ai_recommendation_generated: true,
    content: content,
    generated_at: new Date().toISOString()
  }
}

async function getTargetedContacts(supabaseClient: any, criteria: any) {
  let query = supabaseClient.from('contact').select('*')

  // Appliquer les critères de ciblage
  if (criteria.status) {
    // Jointure avec projets pour filtrer par statut
    query = supabaseClient
      .from('contact')
      .select(`
        *,
        projets!inner (*)
      `)
      .eq('projets.statut', criteria.status)
  }

  if (criteria.segment_id) {
    // Filtrer par segment (logique à implémenter selon votre système de segments)
    query = query.eq('segment_id', criteria.segment_id)
  }

  if (criteria.limit) {
    query = query.limit(criteria.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}