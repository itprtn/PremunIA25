
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Progress } from '../../components/ui/progress'
import { ProjectEmailInterface } from '../../components/ProjectEmailInterface'
import { supabase } from '../../lib/supabase'
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Building, 
  Euro, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  MessageCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import type { Contact, Projet, Contrat, Interaction } from '../../lib/types'

interface ProjectData {
  projet: Projet
  contact: Contact | null
  contrat: Contrat | null
  interactions: Interaction[]
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadProjectData(id)
    }
  }, [id])

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true)
      
      // Récupérer le projet avec le contact
      const { data: projet, error: projetError } = await supabase
        .from('projets')
        .select('*, contact:contact_id(*)')
        .eq('projet_id', projectId)
        .single()

      if (projetError) {
        console.error('Error fetching project:', projetError)
        navigate('/projects')
        return
      }

      // Récupérer le contrat s'il existe
      const { data: contrat, error: contratError } = await supabase
        .from('contrats')
        .select('*')
        .eq('projet_id', projectId)
        .maybeSingle()

      // Récupérer les interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .eq('contact_id', projet.contact_id)
        .order('created_at', { ascending: false })

      setProjectData({
        projet: projet as Projet,
        contact: projet.contact as Contact,
        contrat: contrat as Contrat | null,
        interactions: (interactions as Interaction[]) || []
      })

    } catch (error) {
      console.error('Error loading project data:', error)
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statut: string) => {
    const statusLower = statut?.toLowerCase()
    switch (true) {
      case statusLower?.includes('contrat enregistré'):
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case statusLower?.includes('devis envoyé'):
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case statusLower?.includes('en cours') || statusLower?.includes('projet à traiter'):
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case statusLower?.includes('perdu') || statusLower?.includes('inexploitable'):
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case statusLower?.includes('ne repond pas') || statusLower?.includes('ne répond pas'):
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
  }

  const getProgressValue = (statut: string) => {
    const statusLower = statut?.toLowerCase()
    switch (true) {
      case statusLower?.includes('nouveau'):
        return 20
      case statusLower?.includes('projet à traiter') || statusLower?.includes('en cours'):
        return 40
      case statusLower?.includes('devis envoyé'):
        return 70
      case statusLower?.includes('contrat enregistré'):
        return 100
      default:
        return 10
    }
  }

  if (loading) {
    return (
      <Layout title="Chargement...">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!projectData) {
    return (
      <Layout title="Projet non trouvé">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Projet non trouvé</h3>
          <p className="text-muted-foreground mb-4">Ce projet n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux projets
          </Button>
        </div>
      </Layout>
    )
  }

  const { projet, contact, contrat, interactions } = projectData

  return (
    <Layout title={`Projet #${projet.projet_id}`}>
      <div className="space-y-6">
        {/* Header de retour */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux projets</span>
        </Button>

        {/* Header du projet */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Projet #{projet.projet_id}</h1>
                <p className="text-muted-foreground text-lg">{projet.type}</p>
              </div>
            </div>
            <Badge className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(projet.statut ?? '')}`}>
              {projet.statut}
            </Badge>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression du projet</span>
              <span className="font-medium">{getProgressValue(projet.statut ?? '')}%</span>
            </div>
            <Progress value={getProgressValue(projet.statut ?? '')} className="h-3" />
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 rounded-2xl">
            <TabsTrigger value="resume" className="flex items-center space-x-2 rounded-xl">
              <FileText className="w-4 h-4" />
              <span>Résumé</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2 rounded-xl">
              <User className="w-4 h-4" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="contrat" className="flex items-center space-x-2 rounded-xl">
              <Building className="w-4 h-4" />
              <span>Contrat</span>
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center space-x-2 rounded-xl">
              <MessageCircle className="w-4 h-4" />
              <span>Communications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Informations Projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ID Projet</p>
                      <p className="font-semibold text-lg">{projet.projet_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold">{projet.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Origine</p>
                      <Badge variant="outline" className="rounded-full">{projet.origine}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Commercial</p>
                      <p className="font-semibold">{projet.commercial}</p>
                    </div>
                  </div>
                  {projet.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Commentaire</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-xl">{projet.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Chronologie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Créé le</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(projet.date_creation ?? '').toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {projet.commercial && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Commercial assigné</p>
                        <p className="text-sm text-muted-foreground">{projet.commercial}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            {contact ? (
              <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${contact.prenom} ${contact.nom}`} />
                      <AvatarFallback className="text-xl">{contact.prenom?.[0]}{contact.nom?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{contact.prenom} {contact.nom}</CardTitle>
                      {contact.civilite && <p className="text-muted-foreground">{contact.civilite}</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Informations Personnelles
                      </h3>
                      {contact.raison_sociale && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{contact.raison_sociale}</span>
                        </div>
                      )}
                      {contact.siret && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">SIRET:</span>
                          <span className="font-medium">{contact.siret}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Contact</h3>
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.telephone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.telephone}</span>
                        </div>
                      )}
                      {(contact.adresse || contact.ville) && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            {contact.adresse && <div>{contact.adresse}</div>}
                            {(contact.code_postal || contact.ville) && (
                              <div>{contact.code_postal} {contact.ville}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun contact associé</h3>
                  <p className="text-muted-foreground">Ce projet n'a pas de contact associé.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contrat" className="space-y-6">
            {contrat ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Informations Contrat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <Badge className={getStatusColor(contrat.contrat_statut || '')}>
                          {contrat.contrat_statut || 'Non spécifié'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Compagnie</p>
                        <p className="font-semibold">{contrat.contrat_compagnie || 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Produit</p>
                        <p className="font-semibold">{contrat.contrat_produit || 'Non spécifié'}</p>
                      </div>
                      {contrat.contrat_formule && (
                        <div>
                          <p className="text-sm text-muted-foreground">Formule</p>
                          <p className="font-semibold">{contrat.contrat_formule}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Euro className="w-5 h-5 mr-2" />
                      Détails Financiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground">Prime Brute Annuelle</p>
                        <p className="text-2xl font-bold text-green-600">
                          €{contrat.prime_brute_annuelle?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-muted-foreground">Prime Nette</p>
                        <p className="text-lg font-bold text-blue-600">
                          €{contrat.prime_nette_annuelle?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="text-lg font-bold text-purple-600">
                          €{contrat.commissionnement_annee1?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun contrat associé</h3>
                  <p className="text-muted-foreground mb-4">Ce projet n'a pas encore de contrat enregistré.</p>
                  <Button variant="outline" className="rounded-xl">
                    Créer un contrat
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communications">
            <ProjectEmailInterface projectId={projet.projet_id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
