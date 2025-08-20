import type React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Interaction, Contact } from "@/lib/types"
import { Mail, Calendar, Phone, User } from "lucide-react"

const getInteractionIcon = (type: Interaction["type"]) => {
  switch (type) {
    case "email_sent":
      return <Mail className="w-5 h-5 text-blue-500" />
    case "email_replied":
      return <Mail className="w-5 h-5 text-green-500" />
    case "appointment":
      return <Calendar className="w-5 h-5 text-purple-500" />
    case "call":
      return <Phone className="w-5 h-5 text-orange-500" />
    default:
      return <User className="w-5 h-5 text-gray-500" />
  }
}

interface ClientDetailsPageProps {
  contact: Contact
  interactions: Interaction[]
}

export const ClientDetailsPage: React.FC<ClientDetailsPageProps> = ({ contact, interactions }) => {
  if (!contact) {
    return <div className="p-6">Contact non trouvé.</div>
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${contact.prenom} ${contact.nom}`} />
            <AvatarFallback>
              {contact.prenom?.[0]}
              {contact.nom?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {contact.prenom} {contact.nom}
            </CardTitle>
            <p className="text-muted-foreground">{contact.type}</p>
            <Badge>{contact.statut}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>
                {contact.prenom.toLowerCase()}.{contact.nom.toLowerCase()}@example.com
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>+33 6 12 34 56 78</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Créé le: {new Date(contact.date_creation).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projets</CardTitle>
        </CardHeader>
        <CardContent>
          {contact.projets && contact.projets.length > 0 ? (
            <div className="space-y-4">
              {contact.projets.map((projet) => (
                <Link
                  to={`/projects/${projet.id}`}
                  key={projet.id}
                  className="block border rounded-md p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{projet.type}</h3>
                    <Badge variant="outline">{projet.statut}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Commercial: {projet.commercial}</p>

                  {contact.contrats &&
                    contact.contrats
                      .filter((c) => c.projet_id === projet.id)
                      .map((contrat, index) => (
                        <div key={index} className="mt-2 pt-2 border-t">
                          <h4 className="font-medium text-sm">Contrat Associé</h4>
                          <p className="text-xs text-muted-foreground">
                            Compagnie: {contrat.contrat_compagnie || "N/A"} - Statut: {contrat.contrat_statut || "N/A"}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Prime Brute Annuelle:</span>
                              <div className="font-semibold text-primary">
                                {contrat.prime_brute_annuelle
                                  ? `€${contrat.prime_brute_annuelle.toLocaleString()}`
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Commission Année 1:</span>
                              <div className="font-semibold text-green-600">
                                {contrat.commissionnement_annee1
                                  ? `€${contrat.commissionnement_annee1.toLocaleString()}`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun projet pour ce contact.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 pt-1">{getInteractionIcon(interaction.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-foreground">{interaction.summary}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(interaction.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{interaction.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
