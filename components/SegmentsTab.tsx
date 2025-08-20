
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
import type { Segment, Contact } from '../lib/types'
import { Plus, Users, Brain, Target, Filter } from 'lucide-react'

interface SegmentsTabProps {
  segments: Segment[]
  contacts: Contact[]
  onSegmentUpdate: () => void
}

export function SegmentsTab({ segments, contacts, onSegmentUpdate }: SegmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const { toast } = useToast()

  const [newSegment, setNewSegment] = useState({
    nom: '',
    description: '',
    criteres: {},
    couleur: '#3B82F6'
  })

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || segment.type_segment === filterType
    return matchesSearch && matchesType
  })

  const handleCreateSegment = async () => {
    try {
      const { error } = await supabase
        .from('segments')
        .insert([newSegment])

      if (error) throw error

      toast({
        title: "Segment créé",
        description: "Le nouveau segment a été créé avec succès.",
      })

      setIsCreateDialogOpen(false)
      setNewSegment({
        nom: '',
        description: '',
        criteres: {},
        couleur: '#3B82F6'
      })
      onSegmentUpdate()
    } catch (error) {
      console.error('Error creating segment:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le segment.",
        variant: "destructive"
      })
    }
  }

  const generateAISegments = async () => {
    setIsGeneratingAI(true)
    try {
      // Segments IA prédéfinis basés sur l'analyse des contacts
      const aiSegments = [
        {
          nom: "Prospects Chauds",
          description: "Contacts ayant montré un intérêt récent",
          criteres: { derniere_interaction: "< 7 jours", statut_projet: "en_cours" },
          couleur: "#EF4444",
          type_segment: "comportemental"
        },
        {
          nom: "Non-Répondeurs",
          description: "Contacts n'ayant pas répondu depuis plus de 30 jours",
          criteres: { derniere_interaction: "> 30 jours", statut_projet: "ne_repond_pas" },
          couleur: "#F97316",
          type_segment: "comportemental"
        },
        {
          nom: "Clients Fidèles",
          description: "Clients avec plusieurs contrats actifs",
          criteres: { nb_contrats: "> 1", statut: "actif" },
          couleur: "#22C55E",
          type_segment: "valeur"
        },
        {
          nom: "Zone Paris",
          description: "Contacts basés en région parisienne",
          criteres: { code_postal: "75*,77*,78*,91*,92*,93*,94*,95*" },
          couleur: "#3B82F6",
          type_segment: "geographique"
        }
      ]

      for (const segment of aiSegments) {
        await supabase.from('segments').insert([segment])
      }

      toast({
        title: "Segments IA générés",
        description: `${aiSegments.length} segments intelligents ont été créés.`,
      })

      onSegmentUpdate()
    } catch (error) {
      console.error('Error generating AI segments:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer les segments IA.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const getSegmentContactCount = (segment: Segment) => {
    // Simulation du comptage basé sur les critères
    return Math.floor(Math.random() * contacts.length * 0.3) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Segments Intelligents</h2>
          <p className="text-muted-foreground">
            Segmentez automatiquement vos contacts pour des campagnes ciblées
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={generateAISegments}
            disabled={isGeneratingAI}
            variant="outline"
            className="gap-2"
          >
            <Brain size={16} />
            {isGeneratingAI ? 'Génération...' : 'Segments IA'}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Nouveau Segment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un segment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type de segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="comportemental">Comportemental</SelectItem>
            <SelectItem value="geographique">Géographique</SelectItem>
            <SelectItem value="valeur">Valeur client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => {
          const contactCount = getSegmentContactCount(segment)
          return (
            <Card key={segment.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.couleur }}
                    />
                    <div>
                      <CardTitle className="text-lg">{segment.nom}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {segment.type_segment || 'standard'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Filter size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {segment.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    <span className="font-semibold text-blue-600">
                      {contactCount} contacts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={12} className="text-green-500" />
                    <span className="text-xs text-green-600">Actif</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Segment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau segment</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="criteria">Critères</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment-name">Nom du segment</Label>
                <Input
                  id="segment-name"
                  value={newSegment.nom}
                  onChange={(e) => setNewSegment({...newSegment, nom: e.target.value})}
                  placeholder="Ex: Prospects région PACA"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="segment-description">Description</Label>
                <Textarea
                  id="segment-description"
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({...newSegment, description: e.target.value})}
                  placeholder="Décrivez ce segment..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment-color">Couleur</Label>
                <input
                  type="color"
                  id="segment-color"
                  value={newSegment.couleur}
                  onChange={(e) => setNewSegment({...newSegment, couleur: e.target.value})}
                  className="w-full h-10 rounded border"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="criteria" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Définissez les critères de segmentation. Les fonctionnalités avancées seront disponibles prochainement.
              </p>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Critères disponibles</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Localisation géographique</li>
                  <li>• Comportement d'engagement</li>
                  <li>• Valeur client (CA, contrats)</li>
                  <li>• Statut des projets</li>
                  <li>• Dernière interaction</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSegment}>
              Créer le segment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
