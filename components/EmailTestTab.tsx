"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { supabase } from "../lib/supabase"
import { useToast } from "../hooks/use-toast"

interface EmailConfig {
  id: number
  email: string
  description: string
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_username: string
  smtp_password: string
  is_active: boolean
}

export function EmailTestTab() {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<string>("")
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "Test d'envoi - CRM Emailing",
    html: `
      <h1>Test d'envoi email</h1>
      <p>Ceci est un email de test depuis votre système CRM.</p>
      <p>Si vous recevez cet email, la configuration fonctionne parfaitement !</p>
      <br>
      <p>Cordialement,<br>Votre équipe CRM</p>
    `,
    text: "Test d'envoi email - Si vous recevez cet email, la configuration fonctionne parfaitement !"
  })
  const [sending, setSending] = useState(false)
  const [sendHistory, setSendHistory] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadEmailConfigs()
    loadSendHistory()
  }, [])

  const loadEmailConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("email_configurations")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEmailConfigs(data || [])
      
      // Sélectionner la config Premunia par défaut
      const premuniaConfig = data?.find(config => config.email === "info@premunia.com")
      if (premuniaConfig) {
        setSelectedConfig(premuniaConfig.id.toString())
      }
    } catch (error) {
      console.error("Error loading email configs:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations email",
        variant: "destructive"
      })
    }
  }

  const loadSendHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setSendHistory(data || [])
    } catch (error) {
      console.error("Error loading send history:", error)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail.to || !selectedConfig) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setSending(true)
    try {
      console.log("🚀 Envoi test email vers:", testEmail.to)
      
      const selectedConfigData = emailConfigs.find(c => c.id.toString() === selectedConfig)
      
      const emailPayload = {
        to: testEmail.to,
        subject: testEmail.subject,
        html: testEmail.html,
        text: testEmail.text,
        config: selectedConfigData ? {
          smtp_host: selectedConfigData.smtp_host,
          smtp_port: selectedConfigData.smtp_port,
          smtp_secure: selectedConfigData.smtp_secure,
          smtp_username: selectedConfigData.smtp_username,
          smtp_password: selectedConfigData.smtp_password,
          sender_email: selectedConfigData.email
        } : undefined
      }

      console.log("📧 Payload:", emailPayload)

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: emailPayload
      })

      if (error) throw error

      console.log("✅ Réponse:", data)

      if (data.success) {
        toast({
          title: "Email envoyé !",
          description: `Email de test envoyé avec succès à ${testEmail.to}`,
          variant: "default"
        })
        
        // Recharger l'historique
        loadSendHistory()
      } else {
        throw new Error(data.error || "Erreur inconnue")
      }
    } catch (error: any) {
      console.error("❌ Erreur envoi:", error)
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer l'email de test",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Envoyé</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Test d'Envoi Email</h2>
          <p className="text-muted-foreground">Testez vos configurations email avant de lancer des campagnes</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {emailConfigs.length} configuration(s) active(s)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-envelope mr-2 text-blue-600"></i>
              Nouvel Email de Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="config">Configuration Email *</Label>
              <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une configuration" />
                </SelectTrigger>
                <SelectContent>
                  {emailConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <span>{config.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {config.smtp_host}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="to">Destinataire *</Label>
              <Input
                id="to"
                type="email"
                placeholder="test@example.com"
                value={testEmail.to}
                onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={testEmail.subject}
                onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="html">Contenu HTML</Label>
              <Textarea
                id="html"
                rows={8}
                value={testEmail.html}
                onChange={(e) => setTestEmail({ ...testEmail, html: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="text">Contenu Texte (optionnel)</Label>
              <Textarea
                id="text"
                rows={3}
                value={testEmail.text}
                onChange={(e) => setTestEmail({ ...testEmail, text: e.target.value })}
                placeholder="Version texte de votre email..."
              />
            </div>

            <Button 
              onClick={handleSendTest} 
              disabled={sending || !testEmail.to || !selectedConfig}
              className="w-full"
            >
              {sending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Envoyer le Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Historique et configurations */}
        <div className="space-y-6">
          {/* Configurations actives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-cog mr-2 text-green-600"></i>
                Configurations Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emailConfigs.map((config) => (
                  <div 
                    key={config.id} 
                    className={`p-3 border rounded-lg ${
                      selectedConfig === config.id.toString() 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{config.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.smtp_host}:{config.smtp_port}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {config.smtp_secure ? "SSL" : "Non SSL"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historique des envois */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-history mr-2 text-purple-600"></i>
                Historique des Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sendHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun test d'envoi récent
                  </p>
                ) : (
                  sendHistory.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium truncate">{log.email_destinataire}</div>
                        {getStatusBadge(log.statut)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("fr-FR")}
                      </div>
                      {log.error_details && (
                        <div className="text-sm text-red-600 mt-1">
                          {log.error_details}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}