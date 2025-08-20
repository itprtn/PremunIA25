
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { EmailSender } from "./EmailSender"
import { supabase } from "../lib/supabase"
import { Mail, History, Clock } from "lucide-react"

interface ProjectEmailInterfaceProps {
  projectId: number
}

interface EmailHistory {
  id: number
  email_destinataire: string
  sujet: string
  status: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
}

export function ProjectEmailInterface({ projectId }: ProjectEmailInterfaceProps) {
  const [project, setProject] = useState<any>(null)
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectData()
    loadEmailHistory()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select(`
          *,
          contact:contact_id (
            identifiant,
            prenom,
            nom,
            email,
            civilite
          )
        `)
        .eq("projet_id", projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error("Error loading project:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmailHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("email_history")
        .select("*")
        .eq("project_id", projectId)
        .order("sent_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setEmailHistory(data || [])
    } catch (error) {
      console.error("Error loading email history:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Envoyé</Badge>
      case "opened":
        return <Badge className="bg-blue-100 text-blue-800">Ouvert</Badge>
      case "clicked":
        return <Badge className="bg-purple-100 text-purple-800">Cliqué</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>
  }

  if (!project) {
    return <div className="text-center p-8">Projet non trouvé</div>
  }

  return (
    <div className="space-y-6">
      {/* Informations du contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Communication Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations contact */}
            <div>
              <h4 className="font-medium mb-3">Contact Principal</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{project.contact?.prenom} {project.contact?.nom}</span>
                  <Badge variant="outline">{project.statut}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  📧 {project.contact?.email || "Aucun email"}
                </div>
                <div className="text-sm text-muted-foreground">
                  📅 Créé le {new Date(project.date_creation || project.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center">
              {project.contact?.email ? (
                <EmailSender
                  projectId={projectId}
                  contactId={project.contact.identifiant}
                  contactEmail={project.contact.email}
                  contactName={`${project.contact.prenom} ${project.contact.nom}`}
                  mode="individual"
                  onEmailSent={loadEmailHistory}
                />
              ) : (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-orange-600">Aucun email disponible pour ce contact</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Historique des Emails</span>
            <Badge variant="outline">{emailHistory.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun email envoyé pour ce projet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((email) => (
                <div key={email.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium truncate">{email.sujet}</div>
                    {getStatusBadge(email.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>📧 {email.email_destinataire}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(email.sent_at).toLocaleString("fr-FR")}</span>
                      </span>
                    </div>
                    {email.opened_at && (
                      <div className="mt-1 text-blue-600">
                        👁 Ouvert le {new Date(email.opened_at).toLocaleString("fr-FR")}
                      </div>
                    )}
                    {email.clicked_at && (
                      <div className="mt-1 text-purple-600">
                        🖱 Cliqué le {new Date(email.clicked_at).toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
