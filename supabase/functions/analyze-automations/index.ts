import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationData {
  id: string
  name: string
  trigger_type: string
  execution_count: number
  last_executed: string | null
  actions: any[]
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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Clé API Gemini non configurée')
    }

    // Récupérer les données d'automatisation
    let automationsQuery = supabaseClient
      .from('automation_triggers')
      .select(`
        *,
        automation_actions (*),
        automation_executions (*)
      `)

    if (automation_id) {
      automationsQuery = automationsQuery.eq('id', automation_id)
    }

    const { data: automations, error: automationsError } = await automationsQuery

    if (automationsError) throw automationsError

    // Récupérer les statistiques de performance
    const { data: executionStats, error: statsError } = await supabaseClient
      .rpc('get_automation_performance_stats')

    if (statsError) console.warn('Erreur récupération stats:', statsError)

    // Préparer le contexte pour Gemini
    const context = {
      automations: automations?.map(auto => ({
        id: auto.id,
        name: auto.name,
        trigger_type: auto.trigger_type,
        execution_count: auto.execution_count || 0,
        success_rate: calculateSuccessRate(auto.automation_executions || []),
        actions_count: auto.automation_actions?.length || 0,
        last_executed: auto.last_executed,
        is_active: auto.is_active
      })),
      performance_stats: executionStats,
      analysis_date: new Date().toISOString()
    }

    // Analyser avec Gemini
    const recommendations = await analyzeWithGemini(context, geminiApiKey)

    // Sauvegarder les recommandations
    const savedRecommendations = await saveRecommendations(supabaseClient, recommendations, automation_id)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations_count: savedRecommendations.length,
        recommendations: savedRecommendations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erreur dans analyze-automations:', error)
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

async function analyzeWithGemini(context: any, apiKey: string) {
  const prompt = `
Analyse les automatisations CRM suivantes et fournis des recommandations d'optimisation précises :

Contexte: ${JSON.stringify(context, null, 2)}

Pour chaque automatisation, analyse :
1. Performance actuelle (taux de succès, fréquence d'exécution)
2. Efficacité des déclencheurs
3. Pertinence des actions
4. Opportunités d'amélioration

Fournis des recommandations au format JSON suivant :
{
  "recommendations": [
    {
      "automation_id": "string|null",
      "type": "optimization|trigger_suggestion|action_improvement",
      "title": "Titre court de la recommandation",
      "description": "Description détaillée avec justification",
      "confidence_score": 0.8,
      "priority": "high|medium|low",
      "suggested_changes": {
        "specific_changes": "objet avec les modifications suggérées"
      },
      "expected_impact": "description de l'impact attendu"
    }
  ]
}

Concentre-toi sur des recommandations actionnables et mesurables pour améliorer les conversions et l'efficacité.
`

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey, {
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
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Erreur API Gemini: ${response.status}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    throw new Error('Réponse vide de Gemini')
  }

  try {
    // Nettoyer la réponse pour extraire le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Format JSON non trouvé dans la réponse')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    return parsed.recommendations || []
  } catch (parseError) {
    console.error('Erreur parsing JSON Gemini:', parseError)
    console.error('Contenu reçu:', content)
    
    // Fallback : créer une recommandation générique
    return [{
      automation_id: null,
      type: 'optimization',
      title: 'Analyse IA disponible',
      description: 'L\'IA a analysé vos automatisations. Consultez les logs pour plus de détails.',
      confidence_score: 0.5,
      priority: 'medium',
      suggested_changes: {},
      expected_impact: 'Amélioration générale des processus'
    }]
  }
}

async function saveRecommendations(supabaseClient: any, recommendations: any[], automationId?: string) {
  const savedRecommendations = []

  for (const rec of recommendations) {
    try {
      const { data, error } = await supabaseClient
        .from('ai_recommendations')
        .insert([{
          automation_id: rec.automation_id || automationId,
          recommendation_type: rec.type,
          title: rec.title,
          description: rec.description,
          confidence_score: rec.confidence_score,
          priority: rec.priority || 'medium',
          suggested_changes: rec.suggested_changes,
          expected_impact: rec.expected_impact,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur sauvegarde recommandation:', error)
        continue
      }

      savedRecommendations.push(data)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  return savedRecommendations
}

function calculateSuccessRate(executions: any[]): number {
  if (!executions || executions.length === 0) return 0
  
  const successful = executions.filter(exec => exec.status === 'completed').length
  return successful / executions.length
}