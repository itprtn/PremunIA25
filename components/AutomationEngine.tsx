import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { useToast } from '../hooks/use-toast'
import { 
  Zap, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Brain, 
  Mail, 
  Database, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Automation {
  id: string
  name: string
  description: string
  trigger_type: 'contact_created' | 'project_updated' | 'status_changed' | 'manual'
  trigger_conditions: Record<string, any>
  actions: Array<{
    type: 'send_email' | 'update_status' | 'create_task' | 'ai_recommendation'
    config: Record<string, any>
  }>
  is_active: boolean
  created_at: string
  last_executed: string | null
  execution_count: number
}

interface AIRecommendation {
  id: string
  automation_id: string
  recommendation_type: 'optimization' | 'trigger_suggestion' | 'action_improvement'
  title: string
  description: string
  confidence_score: number
  suggested_changes: Record<string, any>
  created_at: string
  status: 'pending' | 'applied' | 'dismissed'
}

export function AutomationEngine() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAutomations()
    loadRecommendations()
  }, [])

  const loadAutomations = async () => {
    // Simuler des données pour la démo
    const mockAutomations: Automation[] = [
      {
        id: '1',
        name: 'Suivi prospects chauds',
        description: 'Relance automatique des prospects avec statut "chaud"',
        trigger_type: 'status_changed',
        trigger_conditions: { status: 'chaud' },
        actions: [
          { type: 'send_email', config: { template: 'relance_prospect' } },
          { type: 'create_task', config: { title: 'Appeler prospect' } }
        ],
        is_active: true,
        created_at: new Date().toISOString(),
        last_executed: new Date().toISOString(),
        execution_count: 15
      },
      {
        id: '2',
        name: 'Nouvelle souscription',
        description: 'Actions automatiques lors d\'une nouvelle souscription',
        trigger_type: 'project_updated',
        trigger_conditions: { contrat: true },
        actions: [
          { type: 'send_email', config: { template: 'bienvenue_client' } },
          { type: 'ai_recommendation', config: { context: 'new_client' } }
        ],
        is_active: true,
        created_at: new Date().toISOString(),
        last_executed: null,
        execution_count: 8
      }
    ]
    setAutomations(mockAutomations)
  }

  const loadRecommendations = async () => {
    // Simuler des recommandations IA
    const mockRecommendations: AIRecommendation[] = [
      {
        id: '1',
        automation_id: '1',
        recommendation_type: 'optimization',
        title: 'Optimiser le timing des relances',
        description: 'L\'analyse IA suggère d\'espacer les relances de 3 jours au lieu de 1 jour pour améliorer le taux de réponse de 25%.',
        confidence_score: 0.85,
        suggested_changes: { delay: '3_days' },
        created_at: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        automation_id: '2',
        recommendation_type: 'action_improvement',
        title: 'Ajouter une action de segmentation',
        description: 'Segmenter automatiquement les nouveaux clients selon leur profil pour personnaliser le parcours.',
        confidence_score: 0.92,
        suggested_changes: { add_action: 'auto_segment' },
        created_at: new Date().toISOString(),
        status: 'pending'
      }
    ]
    setRecommendations(mockRecommendations)
  }

  const generateAIRecommendations = async () => {
    setLoading(true)
    try {
      // Simuler l'appel à l'API Gemini
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Ajouter une nouvelle recommandation simulée
      const newRec: AIRecommendation = {
        id: Date.now().toString(),
        automation_id: '1',
        recommendation_type: 'trigger_suggestion',
        title: 'Nouveau déclencheur comportemental',
        description: 'Ajouter un déclencheur basé sur l\'inactivité email pour récupérer les prospects perdus.',
        confidence_score: 0.78,
        suggested_changes: { trigger: 'email_inactivity' },
        created_at: new Date().toISOString(),
        status: 'pending'
      }
      
      setRecommendations(prev => [newRec, ...prev])
      
      toast({
        title: "Analyse IA terminée",
        description: "1 nouvelle recommandation générée avec Gemini AI",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations IA",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAutomation = async (id: string, isActive: boolean) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, is_active: isActive } : auto
      )
    )

    toast({
      title: isActive ? "Automatisation activée" : "Automatisation désactivée",
      description: `L'automatisation a été ${isActive ? 'activée' : 'désactivée'} avec succès`,
    })
  }

  const executeAutomation = async (id: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setAutomations(prev => 
        prev.map(auto => 
          auto.id === id 
            ? { 
                ...auto, 
                execution_count: auto.execution_count + 1,
                last_executed: new Date().toISOString()
              } 
            : auto
        )
      )

      toast({
        title: "Automatisation exécutée",
        description: "L'automatisation a été exécutée avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter l'automatisation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = async (recommendation: AIRecommendation) => {
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendation.id)
    )

    toast({
      title: "Recommandation appliquée",
      description: "La recommandation IA a été appliquée avec succès",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automatisations</h2>
          <p className="text-muted-foreground">
            Gérez vos automatisations et optimisez-les avec l'IA Gemini
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateAIRecommendations} 
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            {loading ? 'Analyse...' : 'Analyser avec IA'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle automatisation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle automatisation</DialogTitle>
                <DialogDescription>
                  Configurez une automatisation pour vos processus métier
                </DialogDescription>
              </DialogHeader>
              <AutomationForm onSuccess={() => {
                setIsCreateDialogOpen(false)
                loadAutomations()
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="automations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations" className="gap-2">
            <Zap className="w-4 h-4" />
            Automatisations
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommandations IA
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {automation.name}
                        <Badge variant={automation.is_active ? "default" : "secondary"}>
                          {automation.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{automation.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeAutomation(automation.id)}
                        disabled={loading}
                        className="gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Exécuter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Déclencheur</div>
                        <div className="text-muted-foreground">
                          {automation.trigger_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Actions</div>
                        <div className="text-muted-foreground">
                          {automation.actions.length} action(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Exécutions</div>
                        <div className="text-muted-foreground">
                          {automation.execution_count}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Dernière exécution</div>
                        <div className="text-muted-foreground">
                          {automation.last_executed 
                            ? new Date(automation.last_executed).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        {recommendation.title}
                        <Badge variant="outline">
                          Confiance: {Math.round(recommendation.confidence_score * 100)}%
                        </Badge>
                      </CardTitle>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => applyRecommendation(recommendation)}
                        className="gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Appliquer
                      </Button>
                      <Button variant="outline" className="gap-1">
                        Ignorer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Type: {recommendation.recommendation_type.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            ))}
            {recommendations.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Aucune recommandation</h3>
                  <p className="text-muted-foreground text-center">
                    Lancez une analyse IA pour obtenir des recommandations d'optimisation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Formulaire de création d'automatisation
function AutomationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: '',
    trigger_conditions: {},
    actions: []
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    toast({
      title: "Automatisation créée",
      description: "L'automatisation a été créée avec succès",
    })

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'automatisation</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Suivi prospects chauds"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez ce que fait cette automatisation..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trigger">Type de déclencheur</Label>
        <Select
          value={formData.trigger_type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un déclencheur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact_created">Nouveau contact</SelectItem>
            <SelectItem value="project_updated">Projet mis à jour</SelectItem>
            <SelectItem value="status_changed">Changement de statut</SelectItem>
            <SelectItem value="manual">Manuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          Créer l'automatisation
        </Button>
      </div>
    </form>
  )
}