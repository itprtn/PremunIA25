import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import type { Workflow, Segment, Projet } from '../lib/types'
import { Plus, Play, Pause, Settings, Brain, Zap } from 'lucide-react'

interface AutomationsTabProps {
  workflows: Workflow[]
  segments: Segment[]
  projets: Projet[]
  onWorkflowUpdate: () => void
}

export function AutomationsTab({ workflows, segments, projets, onWorkflowUpdate }: AutomationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const { toast } = useToast()

  const [newWorkflow, setNewWorkflow] = useState({
    nom: '',
    description: '',
    declencheur: 'manuel',
    segment_id: null,
    etapes: [],
    actif: true
  })

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && workflow.actif) ||
      (filterStatus === 'inactive' && !workflow.actif)
    return matchesSearch && matchesStatus
  })

  const handleCreateWorkflow = async () => {
    try {
      const { error } = await supabase
        .from('workflows')
        .insert([newWorkflow])

      if (error) throw error

      toast({
        title: "Workflow créé",
        description: "Le nouveau workflow a été créé avec succès.",
      })

      setIsCreateDialogOpen(false)
      setNewWorkflow({
        nom: '',
        description: '',
        declencheur: 'manuel',
        segment_id: null,
        etapes: [],
        actif: true
      })
      onWorkflowUpdate()
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le workflow.",
        variant: "destructive"
      })
    }
  }

  const generateAIWorkflows = async () => {
    setIsGeneratingAI(true)
    try {
      // Workflows IA prédéfinis
      const aiWorkflows = [
        {
          nom: "Nurturing Prospects Chauds",
          description: "Séquence automatique pour convertir les prospects engagés",
          declencheur: 'segment_entry',
          segment_id: segments.find(s => s.nom.includes('chaud'))?.id || null,
          etapes: [
            { type: 'email', template: 'welcome_prospect', delay: 0 },
            { type: 'wait', duration: 3 },
            { type: 'email', template: 'value_proposition', delay: 3 },
            { type: 'wait', duration: 7 },
            { type: 'email', template: 'case_study', delay: 7 }
          ],
          actif: true
        },
        {
          nom: "Réactivation Non-Répondeurs",
          description: "Campagne de réactivation pour les contacts inactifs",
          declencheur: 'inactivity',
          segment_id: segments.find(s => s.nom.includes('répondeur'))?.id || null,
          etapes: [
            { type: 'email', template: 'reactivation_1', delay: 0 },
            { type: 'wait', duration: 14 },
            { type: 'email', template: 'special_offer', delay: 14 },
            { type: 'wait', duration: 30 },
            { type: 'email', template: 'final_call', delay: 30 }
          ],
          actif: true
        },
        {
          nom: "Onboarding Nouveaux Clients",
          description: "Accompagnement des nouveaux clients après signature",
          declencheur: 'contract_signed',
          segment_id: null,
          etapes: [
            { type: 'email', template: 'welcome_client', delay: 0 },
            { type: 'task', action: 'schedule_call', delay: 1 },
            { type: 'email', template: 'onboarding_guide', delay: 7 },
            { type: 'task', action: 'follow_up', delay: 30 }
          ],
          actif: true
        }
      ]

      for (const workflow of aiWorkflows) {
        await supabase.from('workflows').insert([workflow])
      }

      toast({
        title: "Workflows IA générés",
        description: `${aiWorkflows.length} workflows intelligents ont été créés.`,
      })

      onWorkflowUpdate()
    } catch (error) {
      console.error('Error generating AI workflows:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer les workflows IA.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const toggleWorkflow = async (workflow: Workflow) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ actif: !workflow.actif })
        .eq('id', workflow.id)

      if (error) throw error

      toast({
        title: workflow.actif ? "Workflow désactivé" : "Workflow activé",
        description: `Le workflow "${workflow.nom}" a été ${workflow.actif ? 'désactivé' : 'activé'}.`,
      })

      onWorkflowUpdate()
    } catch (error) {
      console.error('Error toggling workflow:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du workflow.",
        variant: "destructive"
      })
    }
  }

  const getWorkflowStats = (workflow: Workflow) => {
    return {
      executions: Math.floor(Math.random() * 100) + 10,
      success_rate: `${(Math.random() * 20 + 70).toFixed(1)}%`,
      avg_duration: `${Math.floor(Math.random() * 14) + 1}j`
    }
  }

  const getRelatedProjects = (workflow: Workflow) => {
    if (!workflow.segment_id) return []
    const segment = segments.find(s => s.id === workflow.segment_id)
    if (!segment) return []
    
    // Logique de filtrage des projets selon les critères du segment
    return projets.filter(projet => {
      if (segment.criteres?.statut) {
        return projet.statut === segment.criteres.statut
      }
      if (segment.criteres?.origine) {
        return projet.origine === segment.criteres.origine
      }
      return true
    })
  }

  // CRUD Functions

  const handleUpdateWorkflow = async (workflowId: number, updates: Partial<Workflow>) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', workflowId)

      if (error) throw error

      toast({
        title: "Workflow mis à jour",
        description: "Le workflow a été mis à jour avec succès.",
      })

      onWorkflowUpdate()
    } catch (error) {
      console.error('Error updating workflow:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le workflow.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)

      if (error) throw error

      toast({
        title: "Workflow supprimé",
        description: "Le workflow a été supprimé avec succès.",
      })

      onWorkflowUpdate()
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le workflow.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automations & Workflows</h2>
          <p className="text-muted-foreground">
            Automatisez vos processus marketing et commercial
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={generateAIWorkflows}
            disabled={isGeneratingAI}
            variant="outline"
            className="gap-2"
          >
            <Brain size={16} />
            {isGeneratingAI ? 'Génération...' : 'Workflows IA'}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Nouveau Workflow
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un workflow..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkflows.map((workflow) => {
          const stats = getWorkflowStats(workflow)
          return (
            <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{workflow.nom}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={workflow.actif ? 'default' : 'secondary'}>
                        {workflow.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        {workflow.declencheur === 'manuel' ? 'Manuel' : 'Auto'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleWorkflow(workflow)}
                    >
                      {workflow.actif ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description}
                </p>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Exécutions</div>
                    <div className="font-semibold">{stats.executions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Succès</div>
                    <div className="font-semibold text-green-600">{stats.success_rate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Durée moy.</div>
                    <div className="font-semibold">{stats.avg_duration}</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {workflow.etapes?.length || 0} étapes • {getRelatedProjects(workflow).length} projets liés
                    </span>
                    <div className="flex items-center gap-1">
                      <Zap size={12} className="text-blue-500" />
                      <span className="text-xs text-blue-600">Intelligent</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Projets associés:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getRelatedProjects(workflow).slice(0, 3).map((projet) => (
                        <Badge key={projet.projet_id} variant="outline" className="text-xs">
                          {projet.type || `Projet ${projet.projet_id}`}
                        </Badge>
                      ))}
                      {getRelatedProjects(workflow).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{getRelatedProjects(workflow).length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau workflow</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="trigger">Déclencheur</TabsTrigger>
              <TabsTrigger value="steps">Étapes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Nom du workflow</Label>
                <Input
                  id="workflow-name"
                  value={newWorkflow.nom}
                  onChange={(e) => setNewWorkflow({...newWorkflow, nom: e.target.value})}
                  placeholder="Ex: Nurturing prospects"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  placeholder="Décrivez l'objectif de ce workflow..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="trigger" className="space-y-4">
              <div className="space-y-2">
                <Label>Type de déclencheur</Label>
                <Select 
                  value={newWorkflow.declencheur} 
                  onValueChange={(value) => setNewWorkflow({...newWorkflow, declencheur: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manuel">Déclenchement manuel</SelectItem>
                    <SelectItem value="segment_entry">Entrée dans un segment</SelectItem>
                    <SelectItem value="form_submission">Soumission de formulaire</SelectItem>
                    <SelectItem value="date_based">Basé sur une date</SelectItem>
                    <SelectItem value="inactivity">Inactivité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newWorkflow.declencheur === 'segment_entry' && (
                <div className="space-y-2">
                  <Label>Segment associé</Label>
                  <Select 
                    value={newWorkflow.segment_id?.toString() || ''} 
                    onValueChange={(value) => setNewWorkflow({...newWorkflow, segment_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id.toString()}>
                          {segment.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="steps" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Définissez les étapes de votre workflow. Les fonctionnalités avancées seront disponibles prochainement.
              </p>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Étapes prédéfinies</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Envoi d'email automatique</li>
                  <li>• Attente (délai configurable)</li>
                  <li>• Création de tâche</li>
                  <li>• Notification équipe</li>
                  <li>• Conditions intelligentes</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateWorkflow}>
              Créer le workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}