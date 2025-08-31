import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Progress } from './ui/progress'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import type { Workflow, Segment } from '../lib/types'
import { 
  Plus, Play, Pause, Settings, Clock, Users, 
  Target, Zap, Calendar, RefreshCw, AlertCircle,
  CheckCircle, Activity, TrendingUp, Loader2
} from 'lucide-react'

interface AutomationsTabProps {
  workflows: Workflow[]
  segments?: Segment[]
  onWorkflowUpdate: () => void
}

interface RelanceAutomatisee {
  id: number
  nom: string
  description: string
  segment_id?: number
  delai_jours: number
  template_id?: number
  statut: 'actif' | 'inactif' | 'en_cours'
  derniere_execution?: string
  prochaine_execution?: string
  contacts_traites: number
  contacts_restants: number
  taux_succes: number
  created_at: string
}

export function AutomationsTab({ workflows, segments, onWorkflowUpdate }: AutomationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [relances, setRelances] = useState<RelanceAutomatisee[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const { toast } = useToast()

  const [newRelance, setNewRelance] = useState({
    nom: '',
    description: '',
    segment_id: null,
    delai_jours: 3,
    template_id: null,
    statut: 'actif' as 'actif' | 'inactif'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Simuler des données de relances automatisées
      const mockRelances: RelanceAutomatisee[] = [
        {
          id: 1,
          nom: "Relance 'Ne répond pas' - 3 jours",
          description: "Relance automatique des prospects qui ne répondent pas après 3 jours",
          segment_id: segments?.find(s => s.nom.includes('répond'))?.id ?? 1,
          delai_jours: 3,
          template_id: 1,
          statut: 'actif',
          derniere_execution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          prochaine_execution: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          contacts_traites: 45,
          contacts_restants: 12,
          taux_succes: 78.5,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          nom: "Relance Devis Envoyé - 7 jours",
          description: "Relance automatique des devis envoyés sans réponse après 7 jours",
          delai_jours: 7,
          template_id: 2,
          statut: 'actif',
          derniere_execution: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          prochaine_execution: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          contacts_traites: 23,
          contacts_restants: 8,
          taux_succes: 65.2,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          nom: "Réactivation Prospects Froids - 30 jours",
          description: "Campagne de réactivation pour les prospects inactifs depuis 30 jours",
          delai_jours: 30,
          template_id: 3,
          statut: 'en_cours',
          derniere_execution: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          contacts_traites: 87,
          contacts_restants: 34,
          taux_succes: 42.8,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      // Charger les templates
      const { data: templatesData, error: templateError } = await supabase
        .from('email_templates')
        .select('id, nom, sujet')
        .eq('statut', 'active')

      if (templateError) throw templateError

      setRelances(mockRelances)
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Error loading automations data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'automatisation.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRelances = relances.filter(relance => {
    const matchesSearch = relance.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relance.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || relance.statut === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateRelance = async () => {
    try {
      // Simuler la création d'une nouvelle relance
      const newId = Math.max(...relances.map(r => r.id)) + 1
      const newRelanceData: RelanceAutomatisee = {
        id: newId,
        nom: newRelance.nom,
        description: newRelance.description,
        segment_id: newRelance.segment_id,
        delai_jours: newRelance.delai_jours,
        template_id: newRelance.template_id,
        statut: newRelance.statut,
        prochaine_execution: new Date(Date.now() + newRelance.delai_jours * 24 * 60 * 60 * 1000).toISOString(),
        contacts_traites: 0,
        contacts_restants: 0,
        taux_succes: 0,
        created_at: new Date().toISOString()
      }

      setRelances([newRelanceData, ...relances])

      toast({
        title: "Relance automatisée créée",
        description: "La nouvelle relance automatisée a été configurée avec succès.",
      })

      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating automation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la relance automatisée.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setNewRelance({
      nom: '',
      description: '',
      segment_id: null,
      delai_jours: 3,
      template_id: null,
      statut: 'actif'
    })
  }

  const toggleRelance = async (relance: RelanceAutomatisee) => {
    try {
      const newStatus = relance.statut === 'actif' ? 'inactif' : 'actif'
      
      setRelances(relances.map(r => 
        r.id === relance.id ? { ...r, statut: newStatus } : r
      ))

      toast({
        title: relance.statut === 'actif' ? "Relance désactivée" : "Relance activée",
        description: `La relance "${relance.nom}" a été ${relance.statut === 'actif' ? 'désactivée' : 'activée'}.`,
      })
    } catch (error) {
      console.error('Error toggling automation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la relance.",
        variant: "destructive"
      })
    }
  }

  const executeRelanceNow = async (relance: RelanceAutomatisee) => {
    try {
      toast({
        title: "Exécution démarrée",
        description: `La relance "${relance.nom}" a été déclenchée manuellement.`,
      })

      // Simuler l'exécution
      setRelances(relances.map(r => 
        r.id === relance.id 
          ? { 
              ...r, 
              statut: 'en_cours' as 'en_cours',
              derniere_execution: new Date().toISOString()
            } 
          : r
      ))

      // Simuler la fin d'exécution après quelques secondes
      setTimeout(() => {
        setRelances(relances.map(r => 
          r.id === relance.id 
            ? { 
                ...r, 
                statut: 'actif' as 'actif',
                contacts_traites: r.contacts_traites + Math.floor(Math.random() * 10) + 1
              } 
            : r
        ))
      }, 3000)

    } catch (error) {
      console.error('Error executing automation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter la relance.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return "bg-green-100 text-green-800 border-green-200"
      case 'inactif':
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 'en_cours':
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <CheckCircle className="h-4 w-4" />
      case 'inactif':
        return <Pause className="h-4 w-4" />
      case 'en_cours':
        return <Activity className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suivi Relances Automatisées</h1>
          <p className="text-muted-foreground mt-1">
            Gestion et suivi des campagnes de relance automatiques avec Brevo
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Relance
          </Button>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{filteredRelances.length}</div>
            </div>
            <div className="text-sm text-blue-700 font-medium">Relances Configurées</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {filteredRelances.filter(r => r.statut === 'actif').length}
              </div>
            </div>
            <div className="text-sm text-green-700 font-medium">Actives</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {filteredRelances.reduce((sum, r) => sum + r.contacts_traites, 0)}
              </div>
            </div>
            <div className="text-sm text-purple-700 font-medium">Contacts Traités</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">
                {filteredRelances.length > 0 
                  ? Math.round(filteredRelances.reduce((sum, r) => sum + r.taux_succes, 0) / filteredRelances.length)
                  : 0}%
              </div>
            </div>
            <div className="text-sm text-orange-700 font-medium">Taux Succès Moyen</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher une relance..."
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
                <SelectItem value="actif">Actives</SelectItem>
                <SelectItem value="inactif">Inactives</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des relances */}
      <div className="grid gap-4">
        {filteredRelances.map((relance) => {
          const template = templates.find(t => t.id === relance.template_id)
          const segment = segments.find(s => s.id === relance.segment_id)
          const totalContacts = relance.contacts_traites + relance.contacts_restants
          const progressPercentage = totalContacts > 0 ? (relance.contacts_traites / totalContacts * 100) : 0

          return (
            <Card key={relance.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{relance.nom}</h3>
                      <Badge className={getStatusColor(relance.statut)}>
                        {getStatusIcon(relance.statut)}
                        <span className="ml-1 capitalize">{relance.statut.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{relance.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{relance.delai_jours}</div>
                        <div className="text-xs text-muted-foreground">Jours de délai</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{relance.contacts_traites}</div>
                        <div className="text-xs text-muted-foreground">Traités</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{relance.contacts_restants}</div>
                        <div className="text-xs text-muted-foreground">Restants</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{relance.taux_succes.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Taux Succès</div>
                      </div>
                    </div>

                    {/* Progression */}
                    {totalContacts > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression</span>
                          <span>{relance.contacts_traites}/{totalContacts} contacts</span>
                        </div>
                        <Progress value={Number(progressPercentage)} className="h-2" />
                      </div>
                    )}

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        {template && (
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Template:</strong> {template.nom}</span>
                          </div>
                        )}
                        {segment && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Segment:</strong> {segment.nom}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        {relance.derniere_execution && (
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Dernière exécution:</strong> {new Date(relance.derniere_execution).toLocaleString('fr-FR')}</span>
                          </div>
                        )}
                        {relance.prochaine_execution && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Prochaine exécution:</strong> {new Date(relance.prochaine_execution).toLocaleString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeRelanceNow(relance)}
                      disabled={relance.statut === 'en_cours'}
                      className="gap-2"
                    >
                      {relance.statut === 'en_cours' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Exécuter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRelance(relance)}
                      className="gap-2"
                    >
                      {relance.statut === 'actif' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {relance.statut === 'actif' ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog Créer Relance */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Créer une nouvelle relance automatisée
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relance-name">Nom de la relance</Label>
                <Input
                  id="relance-name"
                  value={newRelance.nom}
                  onChange={(e) => setNewRelance({...newRelance, nom: e.target.value})}
                  placeholder="Ex: Relance devis 7 jours"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relance-delay">Délai en jours</Label>
                <Input
                  id="relance-delay"
                  type="number"
                  min="1"
                  max="90"
                  value={newRelance.delai_jours}
                  onChange={(e) => setNewRelance({...newRelance, delai_jours: parseInt(e.target.value) || 3})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relance-description">Description</Label>
              <Textarea
                id="relance-description"
                value={newRelance.description}
                onChange={(e) => setNewRelance({...newRelance, description: e.target.value})}
                placeholder="Décrivez l'objectif de cette relance automatique..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Segment cible (optionnel)</Label>
                <Select 
                  value={newRelance.segment_id?.toString() || ''} 
                  onValueChange={(value) => setNewRelance({...newRelance, segment_id: value ? parseInt(value) : null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun segment spécifique</SelectItem>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id.toString()}>
                        {segment.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Template email</Label>
                <Select 
                  value={newRelance.template_id?.toString() || ''} 
                  onValueChange={(value) => setNewRelance({...newRelance, template_id: value ? parseInt(value) : null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Fonctionnement</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• La relance sera déclenchée automatiquement après le délai configuré</p>
                <p>• Vous pouvez l'exécuter manuellement à tout moment</p>
                <p>• Le système suit les taux de succès et les statistiques d'engagement</p>
                <p>• L'intégration Brevo assure la délivrabilité optimale</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button onClick={handleCreateRelance}>
                Créer la relance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}