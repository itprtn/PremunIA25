"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { supabase } from "../lib/supabase"
import type { Projet, Contact, Contrat } from "../lib/types"

interface PipelineTabProps {
  projets: Projet[]
  contacts: Contact[]
  contrats: Contrat[]
  onProjectUpdate: () => void
}

const PIPELINE_STAGES = [
  {
    id: "prospect",
    name: "Prospects",
    statuts: ["Nouveau", "Contact initial", "Qualification"],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    id: "negotiation",
    name: "Négociation",
    statuts: ["En cours", "Devis envoyé", "Négociation"],
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
  {
    id: "closing",
    name: "Finalisation",
    statuts: ["Signature", "Validation", "Finalisation"],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    id: "won",
    name: "Gagnés",
    statuts: ["Terminé", "Signé", "Actif"],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    id: "lost",
    name: "Perdus",
    statuts: ["Annulé", "Perdu", "Refusé"],
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
]

export function PipelineTab({ projets, contacts, contrats, onProjectUpdate }: PipelineTabProps) {
  const [commercialFilter, setCommercialFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedProject, setDraggedProject] = useState<Projet | null>(null)

  // Get unique commercials
  const commercials = useMemo(() => {
    const uniqueCommercials = [...new Set(projets.map((p) => p.commercial).filter(Boolean))]
    return uniqueCommercials.sort()
  }, [projets])

  // Filter projects by commercial
  const filteredProjects = useMemo(() => {
    return projets.filter((projet) => {
      const matchesCommercial = commercialFilter === "all" || projet.commercial === commercialFilter
      return matchesCommercial
    })
  }, [projets, commercialFilter])

  // Group projects by pipeline stage
  const projectsByStage = useMemo(() => {
    const grouped = PIPELINE_STAGES.reduce(
      (acc, stage) => {
        acc[stage.id] = filteredProjects.filter((projet) =>
          stage.statuts.some((statut) => projet.statut?.toLowerCase().includes(statut.toLowerCase())),
        )
        return acc
      },
      {} as Record<string, Projet[]>,
    )

    // Handle projects that don't match any stage
    const unmatchedProjects = filteredProjects.filter(
      (projet) =>
        !PIPELINE_STAGES.some((stage) =>
          stage.statuts.some((statut) => projet.statut?.toLowerCase().includes(statut.toLowerCase())),
        ),
    )

    // Add unmatched projects to "negotiation" by default
    grouped.negotiation = [...grouped.negotiation, ...unmatchedProjects]

    return grouped
  }, [filteredProjects])

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const totalProjects = filteredProjects.length
    const wonProjects = projectsByStage.won?.length || 0
    const lostProjects = projectsByStage.lost?.length || 0
    const activeProjects = totalProjects - wonProjects - lostProjects

    // Calculate potential revenue from contracts
    const wonRevenue = contrats
      .filter((c) => projectsByStage.won?.some((p) => p.projet_id === c.projet_id))
      .reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)

    const pipelineRevenue = contrats
      .filter((c) =>
        [
          ...(projectsByStage.prospect || []),
          ...(projectsByStage.negotiation || []),
          ...(projectsByStage.closing || []),
        ].some((p) => p.projet_id === c.projet_id),
      )
      .reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)

    return {
      totalProjects,
      wonProjects,
      lostProjects,
      activeProjects,
      wonRevenue,
      pipelineRevenue,
      conversionRate: totalProjects > 0 ? (wonProjects / totalProjects) * 100 : 0,
    }
  }, [filteredProjects, projectsByStage, contrats])

  const handleDragStart = (e: React.DragEvent, project: Projet) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (!draggedProject) return

    const stage = PIPELINE_STAGES.find((s) => s.id === stageId)
    if (!stage) return

    // Update project status based on stage
    const newStatus = stage.statuts[0] // Use first status of the stage
    if (draggedProject.statut !== newStatus) {
      try {
        await supabase.from("projets").update({ statut: newStatus }).eq("id", draggedProject.projet_id)
        onProjectUpdate()
      } catch (error) {
        console.error("Error updating project status:", error)
      }
    }

    setDraggedProject(null)
  }

  const getProjectValue = (project: Projet) => {
    const contrat = contrats.find((c) => c.projet_id === project.projet_id)
    return contrat?.prime_brute_annuelle || 0
  }

  const openProjectDialog = (project: Projet) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pipeline Commercial</h2>
          <p className="text-muted-foreground">Vue Kanban des opportunités</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={commercialFilter || "all"} onValueChange={setCommercialFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les commerciaux</SelectItem>
              {commercials.map((commercial) => (
                <SelectItem key={commercial} value={commercial}>
                  {commercial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-funnel-dollar text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Total</p>
                <p className="text-lg font-bold text-foreground">
                  €{(pipelineMetrics.pipelineRevenue / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Réalisé</p>
                <p className="text-lg font-bold text-foreground">€{(pipelineMetrics.wonRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-percentage text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux Conversion</p>
                <p className="text-lg font-bold text-foreground">{pipelineMetrics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Cours</p>
                <p className="text-lg font-bold text-foreground">{pipelineMetrics.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-check text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gagnés</p>
                <p className="text-lg font-bold text-foreground">{pipelineMetrics.wonProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-times text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perdus</p>
                <p className="text-lg font-bold text-foreground">{pipelineMetrics.lostProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {PIPELINE_STAGES.map((stage) => {
          const stageProjects = projectsByStage[stage.id] || []
          const stageValue = stageProjects.reduce((sum, project) => sum + getProjectValue(project), 0)

          return (
            <Card
              key={stage.id}
              className="min-h-96"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className={`${stage.bgColor} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 bg-gradient-to-r ${stage.color} rounded-full`}></div>
                    <CardTitle className={`text-sm font-semibold ${stage.textColor}`}>{stage.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={`${stage.textColor} border-current`}>
                    {stageProjects.length}
                  </Badge>
                </div>
                {stageValue > 0 && (
                  <p className={`text-xs ${stage.textColor} font-medium`}>€{(stageValue / 1000).toFixed(0)}k</p>
                )}
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {stageProjects.map((project) => {
                  const projectValue = getProjectValue(project)
                  return (
                    <div
                      key={project.projet_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project)}
                      onClick={() => openProjectDialog(project)}
                      className="p-3 bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-foreground line-clamp-2">{project.type}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{project.commercial || "Non assigné"}</span>
                          {projectValue > 0 && (
                            <span className="font-semibold text-green-600">€{(projectValue / 1000).toFixed(0)}k</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-xs">
                            {project.statut || "N/A"}
                          </Badge>
                          <span className="text-muted-foreground">
                            {project.date_creation
                              ? new Date(project.date_creation).toLocaleDateString("fr-FR")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {stageProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-inbox text-2xl mb-2"></i>
                    <p className="text-sm">Aucune opportunité</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Project Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Opportunité</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de projet</Label>
                  <p className="font-medium">{selectedProject.type}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className="mt-1">{selectedProject.statut || "N/A"}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commercial</Label>
                  <p className="font-medium">{selectedProject.commercial || "Non assigné"}</p>
                </div>
                <div>
                  <Label>Date de création</Label>
                  <p className="font-medium">
                    {selectedProject.date_creation
                      ? new Date(selectedProject.date_creation).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                </div>
              </div>
              {(() => {
                const contrat = contrats.find((c) => c.projet_id === selectedProject.projet_id)
                return (
                  contrat && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <div>
                        <Label>Prime Brute Annuelle</Label>
                        <p className="font-semibold text-green-600">
                          €{(contrat.prime_brute_annuelle || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Commission</Label>
                        <p className="font-semibold text-green-600">
                          €{(contrat.commissionnement_annee1 || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                )
              })()}
              {selectedProject.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.notes}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
                <Button>Modifier</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
