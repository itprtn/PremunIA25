"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Card, CardContent } from "./ui/card"
import { supabase } from "../lib/supabase"
import { useToast } from "../hooks/use-toast"

interface Recipient {
  projectId: number
  contactId?: number
  email: string
  prenom?: string
  nom?: string
  civilite?: string
}

interface BulkStatusEmailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  recipients: Recipient[]
  statusName: string
  onComplete?: () => void
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
}

export function BulkStatusEmailDialog({
  isOpen,
  onOpenChange,
  recipients,
  statusName,
  onComplete,
}: BulkStatusEmailDialogProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [sending, setSending] = useState(false)

  const validRecipients = useMemo(() => recipients.filter(r => !!r.email), [recipients])

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, nom, sujet, contenu_html")
        .eq("statut", "actif")
        .order("nom")
      if (error) {
        console.error("Error loading templates", error)
        toast({ title: "Erreur", description: "Impossible de charger les templates", variant: "destructive" })
        return
      }
      setTemplates(data || [])
    })()
  }, [isOpen, toast])

  const personalize = (tpl: string, r: Recipient) =>
    tpl
      .replace(/\{prenom\}/g, r.prenom || "")
      .replace(/\{nom\}/g, r.nom || "")
      .replace(/\{civilite\}/g, r.civilite || "Monsieur/Madame")
      .replace(/\{email\}/g, r.email)

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast({ title: "Template requis", description: "Veuillez sélectionner un template", variant: "destructive" })
      return
    }
    if (validRecipients.length === 0) {
      toast({ title: "Aucun destinataire", description: "Aucun contact avec email", variant: "destructive" })
      return
    }

    setSending(true)
    try {
      // 1) Récupérer le template choisi
      const template = templates.find(t => t.id.toString() === selectedTemplateId)
      if (!template) throw new Error("Template introuvable")

      // 2) Récupérer la configuration email active
      const { data: config, error: cfgErr } = await supabase
        .from("email_configurations")
        .select("id, email")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (cfgErr) throw cfgErr

      // 3) Créer une campagne pour regrouper les envois (KPIs)
      const campaignName = `Statut: ${statusName} • ${new Date().toLocaleString("fr-FR")}`
      const { data: campaign, error: campErr } = await supabase
        .from("campagnes_email")
        .insert({
          nom: campaignName,
          description: `Campagne générée automatiquement pour le statut ${statusName}`,
          statut: "en_cours",
          template_id: template.id,
          email_config_id: config?.id ?? null,
          date_lancement: new Date().toISOString(),
        })
        .select("id")
        .single()
      if (campErr) throw campErr

      // 4) Préparer et insérer les envois
      const envois = validRecipients.map(r => ({
        campagne_id: campaign.id,
        projet_id: r.projectId,
        contact_id: r.contactId ?? null,
        email_destinataire: r.email,
        sujet: personalize(template.sujet, r),
        contenu_html: personalize(template.contenu_html, r),
        statut: "en_attente",
        created_at: new Date().toISOString(),
      }))

      const { data: inserted, error: insertErr } = await supabase
        .from("envois_email")
        .insert(envois)
        .select("id, email_destinataire")
      if (insertErr) throw insertErr

      // 5) Envoi effectif via la fonction `send-email`
      const idByEmail = new Map(inserted?.map(i => [i.email_destinataire, i.id]))
      for (const r of validRecipients) {
        const body = {
          to: r.email,
          subject: personalize(template.sujet, r),
          html: personalize(template.contenu_html, r),
          text: personalize(template.contenu_html.replace(/<[^>]*>/g, ""), r),
        }
        const { data, error } = await supabase.functions.invoke("send-email", { body })
        const rowId = idByEmail.get(r.email)
        if (!error && data?.success) {
          await supabase
            .from("envois_email")
            .update({ statut: "envoye", date_envoi: new Date().toISOString(), erreur_message: null })
            .eq("id", rowId)
        } else {
          await supabase
            .from("envois_email")
            .update({ statut: "erreur", erreur_message: error?.message || data?.error || "Erreur d'envoi" })
            .eq("id", rowId)
        }
      }

      // 6) Mettre à jour le compteur de la campagne
      await supabase
        .from("campagnes_email")
        .update({ contact_count: validRecipients.length, updated_at: new Date().toISOString() })
        .eq("id", campaign.id)

      toast({ title: "Campagne lancée", description: `${validRecipients.length} emails traités` })
      onOpenChange(false)
      onComplete?.()
    } catch (e: any) {
      console.error(e)
      toast({ title: "Erreur", description: e.message || "Impossible d'envoyer la campagne", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Envoyer un email groupé • Statut: {statusName || "(tous)"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">
                Destinataires valides: <strong>{validRecipients.length}</strong>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Template email</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Sélectionnez un template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.nom} — {t.sujet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={sending || !selectedTemplateId || validRecipients.length === 0}>
              {sending ? "Envoi..." : "Lancer l'envoi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
