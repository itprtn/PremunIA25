import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Projet, Contact, Contrat, Interaction } from '@/lib/types';
import { Calendar, User, Building, Euro, Phone, Mail, MapPin, Clock, TrendingUp, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getProjectData(projectId: string) {
  const { data: projet, error: projetError } = await supabase
    .from('projets')
    .select('*, contact:contact_id(*)')
    .eq('projet_id', projectId)
    .single();

  if (projetError || !projet) {
    console.error('Error fetching project:', projetError);
    return null;
  }

  const { data: contrat, error: contratError } = await supabase
    .from('contrats')
    .select('*')
    .eq('projet_id', projectId)
    .single();

  if (contratError) {
    console.error('Error fetching contract:', contratError);
  }

  const { data: interactions, error: interactionsError } = await supabase
    .from('interactions')
    .select('*')
    .eq('contact_id', projet.contact_id);

  if (interactionsError) {
    console.error('Error fetching interactions:', interactionsError);
  }

  return {
    projet: projet as Projet,
    contact: projet.contact as Contact,
    contrat: contrat as Contrat | undefined,
    interactions: (interactions as Interaction[]) || [],
  };
}

const ProjectDetailsPage = async ({ params }: { params: { id: string } }) => {
  const data = await getProjectData(params.id);

  if (!data) {
    notFound();
    return null;
  }

  const { projet, contact, contrat, interactions } = data;

  const getStatutColor = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case 'contrat enregistré': return 'bg-green-100 text-green-800';
      case 'devis envoyé': return 'bg-blue-100 text-blue-800';
      case 'en cours': case 'projet à traiter': return 'bg-yellow-100 text-yellow-800';
      case 'perdu': case 'inexploitable': return 'bg-red-100 text-red-800';
      case 'ne répond pas': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getProgressValue = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case 'nouveau': return 20;
      case 'projet à traiter': case 'en cours': return 40;
      case 'devis envoyé': return 70;
      case 'contrat enregistré': return 100;
      default: return 10;
    }
  };

  const getProgressColor = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case 'contrat enregistré': return 'bg-green-500';
      case 'devis envoyé': return 'bg-blue-500';
      case 'en cours': case 'projet à traiter': return 'bg-yellow-500';
      case 'perdu': case 'inexploitable': return 'bg-red-500';
      case 'ne répond pas': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Link href="/?tab=projects" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Retour aux projets
      </Link>
      {/* Header avec informations principales */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
<h1 className="text-3xl font-bold text-foreground">Projet #{projet.projet_id}</h1>
              <p className="text-muted-foreground text-lg">{projet.type}</p>
            </div>
          </div>
<Badge className={`px-4 py-2 text-sm font-medium ${getStatutColor(projet.statut ?? '')}`}>
            {projet.statut}
          </Badge>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression du projet</span>
            <span className="font-medium">{getProgressValue(projet.statut ?? '')}%</span>
          </div>
          <Progress value={getProgressValue(projet.statut ?? '')} className={`h-3 ${getProgressColor(projet.statut ?? '')}`} />
        </div>
      </div>
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="project" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Projet</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Contact</span>
          </TabsTrigger>
          <TabsTrigger value="contract" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Contrat</span>
          </TabsTrigger>
          <TabsTrigger value="interaction" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Interactions</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="project" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-glow">
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
                    <Badge variant="outline">{projet.origine}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attribution</p>
                    <p className="font-semibold">{projet.commercial}</p>
                  </div>
                </div>
                {projet.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Commentaire</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{projet.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-glow">
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
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Dernière modification</p>
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
          {projet.contact ? (
            <Card className="card-glow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${projet.contact.prenom} ${projet.contact.nom}`} />
                    <AvatarFallback className="text-xl">{projet.contact.prenom?.[0]}{projet.contact.nom?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{projet.contact.prenom} {projet.contact.nom}</CardTitle>
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
                    {projet.contact.civilite && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Civilité:</span>
                        <span className="font-medium">{projet.contact.civilite}</span>
                      </div>
                    )}
                    {projet.contact.raison_sociale && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{projet.contact.raison_sociale}</span>
                      </div>
                    )}
                    {projet.contact.siret && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">SIRET:</span>
                        <span className="font-medium">{projet.contact.siret}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact</h3>
                    {projet.contact.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{projet.contact.email}</span>
                      </div>
                    )}
                    {projet.contact.telephone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{projet.contact.telephone}</span>
                      </div>
                    )}
                    {(projet.contact.adresse || projet.contact.ville) && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          {projet.contact.adresse && <div>{projet.contact.adresse}</div>}
                          {(projet.contact.code_postal || projet.contact.ville) && (
                            <div>{projet.contact.code_postal} {projet.contact.ville}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun contact associé</h3>
                <p className="text-muted-foreground">Ce projet n'a pas de contact associé.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="contract" className="space-y-6">
          {contrat ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Informations Contrat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ID Contrat</p>
                      <p className="font-semibold">{contrat.projet_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className={getStatutColor(contrat.contrat_statut || '')}>
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
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Formule</p>
                        <p className="font-semibold">{contrat.contrat_formule}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Date de création</p>
                    <p className="font-semibold">
                      {new Date(contrat.contrat_date_creation ?? '').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="w-5 h-5 mr-2" />
                    Détails Financiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Prime Brute Annuelle</p>
                        <p className="text-2xl font-bold text-green-600">
                          €{contrat.prime_brute_annuelle?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Prime Nette Annuelle</p>
                        <p className="text-lg font-bold text-blue-600">
                          €{contrat.prime_nette_annuelle?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Prime Mensuelle</p>
                        <p className="text-lg font-bold text-purple-600">
                          €{contrat.prime_brute_mensuelle?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Commission Année 1</p>
                        <p className="text-lg font-bold text-orange-600">
                          €{contrat.commissionnement_annee1?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Commission Récurrente</p>
                        <p className="text-lg font-bold text-indigo-600">
                          €{contrat.commissionnement_annee1?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="card-glow">
              <CardContent className="text-center py-12">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun contrat associé</h3>
                <p className="text-muted-foreground mb-4">Ce projet n'a pas encore de contrat enregistré.</p>
                <Button variant="outline">
                  Créer un contrat
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="interaction">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {interactions.length > 0 ? (
                interactions.map(interaction => (
                  <div key={interaction.id} className="mb-2 p-2 border rounded">
                    <p><strong>Date:</strong> {new Date(interaction.created_at ?? '').toLocaleDateString()}</p>
                    <p><strong>Type:</strong> {interaction.type}</p>
                    <p><strong>Résumé:</strong> {interaction.message}</p>
                  </div>
                ))
              ) : (
                <p>Aucune interaction enregistrée pour ce contact.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsPage;
