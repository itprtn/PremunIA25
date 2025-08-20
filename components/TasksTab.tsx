"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Checkbox } from "./ui/checkbox"
import type { Contact, Projet } from "../lib/types"

interface Task {
  id: number
  titre: string
  description?: string
  statut: "todo" | "in_progress" | "done" | "cancelled"
  priorite: "low" | "medium" | "high" | "urgent"
  assignee?: string
  date_echeance?: string
  date_creation: string
  contact_id?: number
  projet_id?: number
  tags?: string[]
}

interface TasksTabProps {
  contacts: Contact[]
  projets: Projet[]
  onTaskUpdate: () => void
}

const TASK_STATUSES = [
  { id: "todo", name: "À faire", color: "bg-gray-100 text-gray-800", icon: "fas fa-circle" },
  { id: "in_progress", name: "En cours", color: "bg-blue-100 text-blue-800", icon: "fas fa-play-circle" },
  { id: "done", name: "Terminé", color: "bg-green-100 text-green-800", icon: "fas fa-check-circle" },
  { id: "cancelled", name: "Annulé", color: "bg-red-100 text-red-800", icon: "fas fa-times-circle" },
]

const TASK_PRIORITIES = [
  { id: "low", name: "Faible", color: "bg-gray-100 text-gray-800", icon: "fas fa-arrow-down" },
  { id: "medium", name: "Moyenne", color: "bg-yellow-100 text-yellow-800", icon: "fas fa-minus" },
  { id: "high", name: "Haute", color: "bg-orange-100 text-orange-800", icon: "fas fa-arrow-up" },
  { id: "urgent", name: "Urgent", color: "bg-red-100 text-red-800", icon: "fas fa-exclamation" },
]

export function TasksTab({ contacts, projets, onTaskUpdate }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      titre: "Appeler prospect ABC Corp",
      description: "Suivi de la proposition commerciale envoyée la semaine dernière",
      statut: "todo",
      priorite: "high",
      assignee: "Jean Dupont",
      date_echeance: "2024-01-20",
      date_creation: "2024-01-15",
      contact_id: 1,
      tags: ["commercial", "suivi"],
    },
    {
      id: 2,
      titre: "Préparer devis assurance auto",
      description: "Calculer les tarifs pour le client Martin",
      statut: "in_progress",
      priorite: "medium",
      assignee: "Marie Martin",
      date_echeance: "2024-01-18",
      date_creation: "2024-01-14",
      projet_id: 1,
      tags: ["devis", "assurance"],
    },
    {
      id: 3,
      titre: "Envoyer contrat signé",
      description: "Finaliser la signature du contrat habitation",
      statut: "done",
      priorite: "high",
      assignee: "Pierre Durand",
      date_echeance: "2024-01-16",
      date_creation: "2024-01-12",
      tags: ["contrat", "signature"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todo")
  const [priorityFilter, setPriorityFilter] = useState("medium")
  const [assigneeFilter, setAssigneeFilter] = useState("Jean Dupont")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewTask, setIsNewTask] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  // Get unique assignees
  const assignees = useMemo(() => {
    const uniqueAssignees = [...new Set(tasks.map((t) => t.assignee).filter(Boolean))]
    return uniqueAssignees.sort()
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchTerm ||
        task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.statut === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priorite === priorityFilter
      const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter])

  // Group tasks by status for Kanban view
  const tasksByStatus = useMemo(() => {
    return TASK_STATUSES.reduce(
      (acc, status) => {
        acc[status.id] = filteredTasks.filter((task) => task.statut === status.id)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  }, [filteredTasks])

  // Calculate task metrics
  const taskMetrics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.statut === "done").length
    const overdueTasks = tasks.filter((t) => {
      if (!t.date_echeance || t.statut === "done") return false
      return new Date(t.date_echeance) < new Date()
    }).length
    const urgentTasks = tasks.filter((t) => t.priorite === "urgent" && t.statut !== "done").length

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      urgentTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    }
  }, [tasks])

  const getPriorityConfig = (priority: string) => {
    return TASK_PRIORITIES.find((p) => p.id === priority) || TASK_PRIORITIES[1]
  }

  const getStatusConfig = (status: string) => {
    return TASK_STATUSES.find((s) => s.id === status) || TASK_STATUSES[0]
  }

  const isOverdue = (task: Task) => {
    if (!task.date_echeance || task.statut === "done") return false
    return new Date(task.date_echeance) < new Date()
  }

  const handleTaskSubmit = async (formData: FormData) => {
    try {
      const taskData: Partial<Task> = {
        titre: formData.get("titre") as string,
        description: formData.get("description") as string,
        statut: formData.get("statut") as Task["statut"],
        priorite: formData.get("priorite") as Task["priorite"],
        assignee: formData.get("assignee") as string,
        date_echeance: formData.get("date_echeance") as string,
        contact_id: formData.get("contact_id") ? Number.parseInt(formData.get("contact_id") as string) : undefined,
        projet_id: formData.get("projet_id") ? Number.parseInt(formData.get("projet_id") as string) : undefined,
      }

      if (isNewTask) {
        const newTask: Task = {
          ...taskData,
          id: Math.max(...tasks.map((t) => t.id)) + 1,
          date_creation: new Date().toISOString(),
        } as Task
        setTasks([...tasks, newTask])
      } else if (selectedTask) {
        setTasks(tasks.map((t) => (t.id === selectedTask.id ? { ...t, ...taskData } : t)))
      }

      setIsDialogOpen(false)
      setSelectedTask(null)
      onTaskUpdate()
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleTaskStatusChange = (taskId: number, newStatus: Task["statut"]) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, statut: newStatus } : t)))
    onTaskUpdate()
  }

  const openNewTaskDialog = () => {
    setSelectedTask(null)
    setIsNewTask(true)
    setIsDialogOpen(true)
  }

  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setIsNewTask(false)
    setIsDialogOpen(true)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task["statut"]) => {
    e.preventDefault()
    const taskId = Number.parseInt(e.dataTransfer.getData("text/plain"))
    handleTaskStatusChange(taskId, newStatus)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Tâches</h2>
          <p className="text-muted-foreground">{filteredTasks.length} tâches trouvées</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "kanban")}>
            <TabsList>
              <TabsTrigger value="list">
                <i className="fas fa-list mr-2"></i>
                Liste
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <i className="fas fa-columns mr-2"></i>
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={openNewTaskDialog} className="bg-teal-600 hover:bg-teal-700">
            <i className="fas fa-plus mr-2"></i>
            Nouvelle Tâche
          </Button>
        </div>
      </div>

      {/* Task Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-tasks text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tâches</p>
                <p className="text-xl font-bold text-foreground">{taskMetrics.totalTasks}</p>
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
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-xl font-bold text-foreground">{taskMetrics.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Retard</p>
                <p className="text-xl font-bold text-foreground">{taskMetrics.overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-xl font-bold text-foreground">{taskMetrics.urgentTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Titre, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignee">Assigné à</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les assignés</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("todo")
                  setPriorityFilter("medium")
                  setAssigneeFilter("Jean Dupont")
                }}
              >
                <i className="fas fa-times mr-2"></i>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Content */}
      {viewMode === "list" ? (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Liste des Tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const priorityConfig = getPriorityConfig(task.priorite)
                const statusConfig = getStatusConfig(task.statut)
                const overdue = isOverdue(task)

                return (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      overdue ? "border-red-200 bg-red-50" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={task.statut === "done"}
                          onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked ? "done" : "todo")}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4
                              className={`font-medium ${
                                task.statut === "done" ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.titre}
                            </h4>
                            <Badge className={priorityConfig.color}>
                              <i className={`${priorityConfig.icon} mr-1`}></i>
                              {priorityConfig.name}
                            </Badge>
                            <Badge className={statusConfig.color}>
                              <i className={`${statusConfig.icon} mr-1`}></i>
                              {statusConfig.name}
                            </Badge>
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                En retard
                              </Badge>
                            )}
                          </div>
                          {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            {task.assignee && (
                              <span>
                                <i className="fas fa-user mr-1"></i>
                                {task.assignee}
                              </span>
                            )}
                            {task.date_echeance && (
                              <span className={overdue ? "text-red-600 font-medium" : ""}>
                                <i className="fas fa-calendar mr-1"></i>
                                {new Date(task.date_echeance).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                            <span>
                              <i className="fas fa-clock mr-1"></i>
                              {new Date(task.date_creation).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditTaskDialog(task)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {TASK_STATUSES.map((status) => {
            const statusTasks = tasksByStatus[status.id] || []

            return (
              <Card
                key={status.id}
                className="min-h-96"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id as Task["statut"])}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className={`${status.icon} text-sm`}></i>
                      <CardTitle className="text-sm font-semibold">{status.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{statusTasks.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {statusTasks.map((task) => {
                    const priorityConfig = getPriorityConfig(task.priorite)
                    const overdue = isOverdue(task)

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => openEditTaskDialog(task)}
                        className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move ${
                          overdue ? "border-red-200 bg-red-50" : "border-border"
                        }`}
                      >
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">{task.titre}</h4>
                          <div className="flex items-center justify-between">
                            <Badge className={`${priorityConfig.color} text-xs`}>
                              <i className={`${priorityConfig.icon} mr-1`}></i>
                              {priorityConfig.name}
                            </Badge>
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                Retard
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.assignee || "Non assigné"}</span>
                            {task.date_echeance && (
                              <span className={overdue ? "text-red-600 font-medium" : ""}>
                                {new Date(task.date_echeance).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-inbox text-2xl mb-2"></i>
                      <p className="text-sm">Aucune tâche</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNewTask ? "Nouvelle Tâche" : "Modifier la Tâche"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleTaskSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre de la tâche *</Label>
              <Input id="titre" name="titre" defaultValue={selectedTask?.titre || "Nouvelle tâche"} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={selectedTask?.description || ""} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select name="statut" defaultValue={selectedTask?.statut || "todo"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priorite">Priorité</Label>
                <Select name="priorite" defaultValue={selectedTask?.priorite || "medium"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee">Assigné à</Label>
                <Select name="assignee" defaultValue={selectedTask?.assignee || "Jean Dupont"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non assigné</SelectItem>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                    <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                    <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                    <SelectItem value="Pierre Durand">Pierre Durand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_echeance">Date d'échéance</Label>
                <Input
                  id="date_echeance"
                  name="date_echeance"
                  type="date"
                  defaultValue={selectedTask?.date_echeance || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_id">Contact associé</Label>
                <Select name="contact_id" defaultValue={selectedTask?.contact_id?.toString() || "1"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun contact</SelectItem>
                    {contacts.slice(0, 10).filter(contact => {
                      if (!contact || typeof contact.identifiant !== 'number') {
                        console.warn("Contact with missing or invalid identifiant found:", contact);
                        return false;
                      }
                      return true;
                    }).map((contact) => (
                      <SelectItem key={contact.identifiant.toString()} value={contact.identifiant.toString()}>
                        {contact.prenom} {contact.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projet_id">Projet associé</Label>
                <Select name="projet_id" defaultValue={selectedTask?.projet_id?.toString() || "1"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun projet</SelectItem>
                    {projets.slice(0, 10).map((projet) => (
                      <SelectItem key={projet.projet_id} value={projet.projet_id.toString()}>
                        {projet.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isNewTask ? "Créer" : "Modifier"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
