import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Calendar } from '../../components/ui/calendar'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../hooks/use-toast'
import { supabase } from '../../lib/supabase'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react'

interface AppointmentSlot {
  date: string
  time: string
  available: boolean
}

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  
  // URL parameters
  const commercial = searchParams.get('commercial') || ''
  const projectId = searchParams.get('project') || ''
  const contactId = searchParams.get('contact') || ''
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('rendez-vous')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  // Load existing contact data if available
  useEffect(() => {
    if (contactId) {
      loadContactData()
    }
  }, [contactId])

  const loadContactData = async () => {
    try {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .eq('identifiant', contactId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          entreprise: data.raison_sociale || '',
          message: ''
        })
      }
    } catch (error) {
      console.error('Error loading contact data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create appointment
      const appointmentData = {
        date_rdv: selectedDate.toISOString().split('T')[0],
        heure_rdv: selectedTime,
        type_rdv: appointmentType,
        statut: 'planifie',
        notes: formData.message,
        contact_nom: `${formData.prenom} ${formData.nom}`,
        contact_email: formData.email,
        contact_telephone: formData.telephone,
        contact_entreprise: formData.entreprise,
        commercial_assigne: commercial,
        projet_id: projectId || null,
        contact_id: contactId || null,
        source: 'landing_page',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('rendez_vous')
        .insert([appointmentData])

      if (error) throw error

      // Send notification to commercial
      await supabase
        .from('notifications')
        .insert([{
          type: 'nouveau_rdv',
          titre: 'Nouveau rendez-vous planifié',
          message: `${formData.prenom} ${formData.nom} a pris un rendez-vous le ${selectedDate.toLocaleDateString('fr-FR')} à ${selectedTime}`,
          destinataire: commercial,
          data: appointmentData,
          created_at: new Date().toISOString()
        }])

      setIsSuccess(true)
      toast({
        title: "Rendez-vous confirmé !",
        description: "Votre demande de rendez-vous a été enregistrée avec succès.",
      })

    } catch (error) {
      console.error('Error booking appointment:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre rendez-vous. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Rendez-vous confirmé !
            </h1>
            <p className="text-muted-foreground mb-6">
              Merci pour votre demande. {commercial} vous contactera prochainement pour confirmer les détails.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Détails de votre rendez-vous</h3>
              <div className="text-sm space-y-1">
                <p><strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR')}</p>
                <p><strong>Heure :</strong> {selectedTime}</p>
                <p><strong>Type :</strong> {appointmentType}</p>
                <p><strong>Commercial :</strong> {commercial}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Premunia</strong><br />
                📞 01 23 45 67 89<br />
                🌐 www.premunia.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Premunia</h1>
                <p className="text-sm text-muted-foreground">Prise de rendez-vous</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600">
              {commercial || 'Commercial'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Votre conseiller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{commercial || 'Votre conseiller'}</h3>
                      <p className="text-sm text-muted-foreground">Conseiller commercial Premunia</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>01 23 45 67 89</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{commercial?.toLowerCase().replace(' ', '.')}@premunia.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Paris, France</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pourquoi prendre rendez-vous ?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Analyse personnalisée de vos besoins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Devis gratuit et sans engagement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Solutions adaptées à votre budget</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Accompagnement personnalisé</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Planifier votre rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="entreprise">Entreprise</Label>
                    <Input
                      id="entreprise"
                      value={formData.entreprise}
                      onChange={(e) => setFormData(prev => ({ ...prev, entreprise: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Appointment Type */}
                <div>
                  <Label>Type de rendez-vous</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendez-vous">Rendez-vous commercial</SelectItem>
                      <SelectItem value="suivi">Suivi de dossier</SelectItem>
                      <SelectItem value="information">Demande d'information</SelectItem>
                      <SelectItem value="reclamation">Réclamation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <Label>Date souhaitée *</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label>Heure souhaitée *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez brièvement votre demande..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            <strong>Premunia</strong> - Votre partenaire de confiance<br />
            📞 01 23 45 67 89 | 🌐 www.premunia.com
          </p>
        </div>
      </div>
    </div>
  )
}