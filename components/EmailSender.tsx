
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { supabase } from "../lib/supabase"
import { useToast } from "../hooks/use-toast"
import { Mail, Send, User, Users } from "lucide-react"

interface EmailSenderProps {
  projectId?: number
  contactId?: number
  contactEmail?: string
  contactName?: string
  mode?: "individual" | "campaign"
  onEmailSent?: () => void
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
}

export function EmailSender({ 
  projectId, 
  contactId, 
  contactEmail, 
  contactName, 
  mode = "individual",
  onEmailSent 
}: EmailSenderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [emailData, setEmailData] = useState({
    to: contactEmail || "",
    subject: "",
    html: "",
    text: ""
  })
  const [sending, setSending] = useState(false)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const { toast } = useToast()

  const loadTemplates = async () => {
    if (templatesLoaded) return
    
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, nom, sujet, contenu_html")
        .eq("statut", "actif")
        .order("nom")

      if (error) throw error
      setTemplates(data || [])
      setTemplatesLoaded(true)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates email",
        variant: "destructive"
      })
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId)
    if (template) {
      setEmailData({
        ...emailData,
        subject: template.sujet,
        html: template.contenu_html,
        text: template.contenu_html.replace(/<[^>]*>/g, "")
      })
    }
    setSelectedTemplate(templateId)
  }

  const personalizeContent = (content: string) => {
    return content
      .replace(/\{prenom\}/g, contactName?.split(' ')[0] || "")
      .replace(/\{nom\}/g, contactName?.split(' ').slice(1).join(' ') || "")
      .replace(/\{civilite\}/g, "Monsieur/Madame")
      .replace(/\{email\}/g, contactEmail || "")
  }

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.html) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setSending(true)
    try {
      console.log("📧 Envoi email individuel...")
      
      const personalizedEmail = {
        to: emailData.to,
        subject: personalizeContent(emailData.subject),
        html: personalizeContent(emailData.html),
        text: personalizeContent(emailData.text || emailData.html.replace(/<[^>]*>/g, ""))
      }

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: personalizedEmail
      })

      if (error) throw error

      if (data?.success) {
        // Log l'envoi dans l'historique
        if (projectId || contactId) {
          await supabase.from("email_history").insert({
            project_id: projectId,
            contact_id: contactId,
            email_destinataire: emailData.to,
            sujet: personalizedEmail.subject,
            status: "sent",
            message_id: data.messageId,
            sent_at: new Date().toISOString()
          })
        }

        toast({
          title: "Email envoyé !",
          description: `Email envoyé avec succès à ${emailData.to}`,
        })
        
        setIsOpen(false)
        onEmailSent?.()
      } else {
        throw new Error(data?.error || "Erreur d'envoi")
      }
    } catch (error: any) {
      console.error("❌ Erreur envoi email:", error)
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const openDialog = () => {
    setIsOpen(true)
    loadTemplates()
  }

  return (
    <>
      <Button 
        onClick={openDialog}
        className="flex items-center space-x-2"
        variant={mode === "individual" ? "outline" : "default"}
      >
        {mode === "individual" ? <Mail className="w-4 h-4" /> : <Users className="w-4 h-4" />}
        <span>{mode === "individual" ? "Envoyer Email" : "Campagne Email"}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {mode === "individual" ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              <span>
                {mode === "individual" ? "Envoyer Email Individuel" : "Créer Campagne Email"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informations du destinataire */}
            {mode === "individual" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Destinataire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{contactName || "Contact"}</Badge>
                    <Badge variant="secondary">{contactEmail}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sélection du template */}
            <div className="space-y-3">
              <Label htmlFor="template">Template Email (optionnel)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template ou créer un email personnalisé" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.nom} - {template.sujet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Formulaire email */}
            <div className="grid grid-cols-1 gap-4">
              {mode === "campaign" && (
                <div>
                  <Label htmlFor="to">Email Destinataire</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="email@example.com"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="subject">Sujet *</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Sujet de votre email..."
                />
              </div>

              <div>
                <Label htmlFor="html">Contenu HTML *</Label>
                <Textarea
                  id="html"
                  rows={12}
                  value={emailData.html}
                  onChange={(e) => setEmailData({ ...emailData, html: e.target.value })}
                  placeholder="Contenu HTML de votre email..."
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="text">Contenu Texte (optionnel)</Label>
                <Textarea
                  id="text"
                  rows={4}
                  value={emailData.text}
                  onChange={(e) => setEmailData({ ...emailData, text: e.target.value })}
                  placeholder="Version texte (générée automatiquement si vide)"
                />
              </div>
            </div>

            {/* Variables disponibles */}
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Variables disponibles :</h4>
                <div className="text-sm text-muted-foreground space-x-4">
                  <code>{"{prenom}"}</code>
                  <code>{"{nom}"}</code>
                  <code>{"{civilite}"}</code>
                  <code>{"{email}"}</code>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={sending || !emailData.subject || !emailData.html}
                className="flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer Email</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
