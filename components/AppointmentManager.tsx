import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle, X, Plus } from 'lucide-react'

interface RendezVous {
  id: number
  date_rdv: string
  heure_rdv: string
  type_rdv: string
  statut: string
  notes?: string
  contact_nom: string
  contact_email: string
  contact_telephone: string
  contact_entreprise?: string
  commercial_assigne: string
  projet_id?: number
  contact_id?: number
  source: string
  created_at: string
}

interface AppointmentManagerProps {
  commercial?: string
}

export function AppointmentManager({ commercial }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<RendezVous[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<RendezVous[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<RendezVous | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, dateFilter])

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*')
        .order('date_rdv', { ascending: true })
        .order('heure_rdv', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Filter by commercial if specified
    if (commercial) {
      filtered = filtered.filter(app => app.commercial_assigne === commercial)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.statut === statusFilter)
    }

    // Filter by date
    const today = new Date()
    if (dateFilter === 'today') {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date_rdv)
        return appDate.toDateString() === today.toDateString()
      })
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date_rdv)
        return appDate >= today && appDate <= weekFromNow
      })
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date_rdv)
        return appDate >= today && appDate <= monthFromNow
      })
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: newStatus })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, statut: newStatus } : app
        )
      )

      toast({
        title: "Statut mis à jour",
        description: `Le rendez-vous a été marqué comme ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planifie': return 'bg-blue-100 text-blue-800'
      case 'confirme': return 'bg-green-100 text-green-800'
      case 'realise': return 'bg-purple-100 text-purple-800'
      case 'annule': return 'bg-red-100 text-red-800'
      case 'reporte': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planifie': return 'Planifié'
      case 'confirme': return 'Confirmé'
      case 'realise': return 'Réalisé'
      case 'annule': return 'Annulé'
      case 'reporte': return 'Reporté'
      default: return status
    }
  }

  const generateAppointmentLink = (appointment: RendezVous) => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      commercial: appointment.commercial_assigne,
      project: appointment.projet_id?.toString() || '',
      contact: appointment.contact_id?.toString() || ''
    })
    return `${baseUrl}/book-appointment?${params.toString()}`
  }

  if (loading) {
    return <div>Chargement des rendez-vous...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Rendez-vous</h2>
          <p className="text-muted-foreground">
            {filteredAppointments.length} rendez-vous trouvés
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="planifie">Planifiés</SelectItem>
              <SelectItem value="confirme">Confirmés</SelectItem>
              <SelectItem value="realise">Réalisés</SelectItem>
              <SelectItem value="annule">Annulés</SelectItem>
              <SelectItem value="reporte">Reportés</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(appointment.date_rdv).toLocaleDateString('fr-FR')}
                    </span>
                    <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                    <span>{appointment.heure_rdv}</span>
                  </div>
                  
                  <Badge className={getStatusColor(appointment.statut)}>
                    {getStatusText(appointment.statut)}
                  </Badge>
                  
                  <Badge variant="outline">
                    {appointment.type_rdv}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {appointment.statut === 'planifie' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentStatus(appointment.id, 'confirme')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirmer
                    </Button>
                  )}
                  
                  {appointment.statut === 'confirme' && (
                    <Button
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'realise')}
                    >
                      Marquer réalisé
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setIsDialogOpen(true)
                    }}
                  >
                    Détails
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.contact_nom}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.contact_telephone}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Commercial: {appointment.commercial_assigne}</span>
                </div>
              </div>

              {appointment.contact_entreprise && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Entreprise: {appointment.contact_entreprise}
                </div>
              )}

              {appointment.notes && (
                <div className="mt-2 text-sm">
                  <strong>Notes:</strong> {appointment.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredAppointments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun rendez-vous trouvé</h3>
              <p className="text-muted-foreground">
                Aucun rendez-vous ne correspond à vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Rendez-vous</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date et heure</Label>
                  <p className="font-medium">
                    {new Date(selectedAppointment.date_rdv).toLocaleDateString('fr-FR')} à {selectedAppointment.heure_rdv}
                  </p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedAppointment.type_rdv}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact</Label>
                  <p className="font-medium">{selectedAppointment.contact_nom}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.contact_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.contact_telephone}</p>
                </div>
                <div>
                  <Label>Commercial assigné</Label>
                  <p className="font-medium">{selectedAppointment.commercial_assigne}</p>
                </div>
              </div>

              {selectedAppointment.contact_entreprise && (
                <div>
                  <Label>Entreprise</Label>
                  <p className="font-medium">{selectedAppointment.contact_entreprise}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label>Source</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.source} - Créé le {new Date(selectedAppointment.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <Label>Lien de prise de RDV</Label>
                <p className="text-sm break-all">{generateAppointmentLink(selectedAppointment)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(generateAppointmentLink(selectedAppointment))
                    toast({
                      title: "Lien copié",
                      description: "Le lien a été copié dans le presse-papier.",
                    })
                  }}
                >
                  Copier le lien
                </Button>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Select
                    value={selectedAppointment.statut}
                    onValueChange={(value) => {
                      updateAppointmentStatus(selectedAppointment.id, value)
                      setSelectedAppointment(prev => prev ? { ...prev, statut: value } : null)
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planifie">Planifié</SelectItem>
                      <SelectItem value="confirme">Confirmé</SelectItem>
                      <SelectItem value="realise">Réalisé</SelectItem>
                      <SelectItem value="reporte">Reporté</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}