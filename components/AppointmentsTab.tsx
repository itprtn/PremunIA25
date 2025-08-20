import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import type { Contact } from '../lib/types'
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin, Phone, Video } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Appointment {
  id: number
  contact_id: number
  titre: string
  description?: string
  date_rdv: string
  heure_rdv: string
  duree: number
  type: 'physique' | 'visio' | 'telephone'
  lieu?: string
  statut: 'planifie' | 'confirme' | 'termine' | 'annule'
  created_at: string
  contact?: Contact
}

interface AppointmentsTabProps {
  appointments: Appointment[]
  contacts: Contact[]
  onAppointmentUpdate: () => void
}

export function AppointmentsTab({ appointments, contacts, onAppointmentUpdate }: AppointmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const { toast } = useToast()

  const [newAppointment, setNewAppointment] = useState({
    contact_id: '',
    titre: '',
    description: '',
    date_rdv: format(new Date(), 'yyyy-MM-dd'),
    heure_rdv: '09:00',
    duree: 60,
    type: 'physique' as const,
    lieu: '',
    statut: 'planifie' as const
  })

  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: 1,
      contact_id: 1,
      titre: "Présentation assurance habitation",
      description: "Rendez-vous pour présenter les options d'assurance habitation",
      date_rdv: "2024-01-20",
      heure_rdv: "14:00",
      duree: 60,
      type: "physique",
      lieu: "Agence Paris Centre",
      statut: "planifie",
      created_at: "2024-01-15T10:00:00",
      contact: contacts[0]
    },
    {
      id: 2,
      contact_id: 2,
      titre: "Suivi contrat auto",
      description: "Point sur le contrat auto et propositions d'optimisation",
      date_rdv: "2024-01-22",
      heure_rdv: "10:30",
      duree: 45,
      type: "visio",
      lieu: "Zoom",
      statut: "confirme",
      created_at: "2024-01-16T14:30:00",
      contact: contacts[1]
    },
    {
      id: 3,
      contact_id: 3,
      titre: "Première rencontre prospect",
      description: "Découverte des besoins et présentation de nos services",
      date_rdv: "2024-01-25",
      heure_rdv: "16:00",
      duree: 90,
      type: "telephone",
      lieu: "Appel téléphonique",
      statut: "planifie",
      created_at: "2024-01-18T09:15:00",
      contact: contacts[2]
    }
  ]

  const allAppointments = [...appointments, ...mockAppointments]

  const filteredAppointments = allAppointments.filter(appointment => {
    const matchesSearch = appointment.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.contact?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.contact?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.statut === filterStatus
    const matchesType = filterType === 'all' || appointment.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateAppointment = async () => {
    try {
      // Dans un vrai projet, ça irait en base de données
      console.log('Creating appointment:', newAppointment)

      toast({
        title: "Rendez-vous créé",
        description: "Le nouveau rendez-vous a été planifié avec succès.",
      })

      setIsCreateDialogOpen(false)
      setNewAppointment({
        contact_id: '',
        titre: '',
        description: '',
        date_rdv: format(new Date(), 'yyyy-MM-dd'),
        heure_rdv: '09:00',
        duree: 60,
        type: 'physique',
        lieu: '',
        statut: 'planifie'
      })
      onAppointmentUpdate()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      planifie: 'bg-blue-500',
      confirme: 'bg-green-500',
      termine: 'bg-gray-500',
      annule: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visio':
        return <Video size={16} />
      case 'telephone':
        return <Phone size={16} />
      default:
        return <MapPin size={16} />
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allAppointments.filter(apt => apt.date_rdv === dateStr)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prendre un RDV</h2>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous clients et prospects
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-muted rounded-lg p-1">
            <Button 
              variant={calendarView === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('month')}
            >
              Mois
            </Button>
            <Button 
              variant={calendarView === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('week')}
            >
              Semaine
            </Button>
            <Button 
              variant={calendarView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('day')}
            >
              Jour
            </Button>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Nouveau RDV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon size={20} />
              Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="rounded-md border-0"
              modifiers={{
                hasAppointment: (date) => getAppointmentsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasAppointment: { 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            
            {selectedDate && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">
                  RDV du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </h4>
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div key={apt.id} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">{apt.heure_rdv} - {apt.titre}</div>
                    <div className="text-muted-foreground">
                      {apt.contact?.prenom} {apt.contact?.nom}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rendez-vous</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="planifie">Planifié</SelectItem>
                    <SelectItem value="confirme">Confirmé</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{appointment.titre}</h4>
                          <Badge 
                            className={`${getStatusColor(appointment.statut)} text-white`}
                          >
                            {appointment.statut}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getTypeIcon(appointment.type)}
                            <span className="text-sm">{appointment.type}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={14} />
                            <span>
                              {format(new Date(appointment.date_rdv), 'dd MMM yyyy', { locale: fr })}
                              {' à '}{appointment.heure_rdv}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>{appointment.duree} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>
                              {appointment.contact?.prenom} {appointment.contact?.nom}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            <span>{appointment.lieu}</span>
                          </div>
                        </div>
                        
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Planifier un nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-contact">Contact</Label>
                <Select 
                  value={newAppointment.contact_id} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, contact_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.identifiant} value={contact.identifiant.toString()}>
                        {contact.prenom} {contact.nom} - {contact.raison_sociale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointment-type">Type de RDV</Label>
                <Select 
                  value={newAppointment.type} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physique">En personne</SelectItem>
                    <SelectItem value="visio">Visioconférence</SelectItem>
                    <SelectItem value="telephone">Téléphone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-title">Titre du rendez-vous</Label>
              <Input
                id="appointment-title"
                value={newAppointment.titre}
                onChange={(e) => setNewAppointment({...newAppointment, titre: e.target.value})}
                placeholder="Ex: Présentation assurance habitation"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={newAppointment.date_rdv}
                  onChange={(e) => setNewAppointment({...newAppointment, date_rdv: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointment-time">Heure</Label>
                <Select 
                  value={newAppointment.heure_rdv} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, heure_rdv: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointment-duration">Durée (min)</Label>
                <Select 
                  value={newAppointment.duree.toString()} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, duree: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1h</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-location">Lieu</Label>
              <Input
                id="appointment-location"
                value={newAppointment.lieu}
                onChange={(e) => setNewAppointment({...newAppointment, lieu: e.target.value})}
                placeholder="Ex: Agence Paris Centre, Zoom, Téléphone..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-description">Description (optionnel)</Label>
              <Textarea
                id="appointment-description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                placeholder="Notes sur le rendez-vous..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateAppointment}>
              Planifier le RDV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}