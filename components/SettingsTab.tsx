
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { supabase } from "../lib/supabase"
import { Mail, Settings, TestTube, CheckCircle, XCircle, Loader2, User, Shield, Bell } from "lucide-react"
import { useToast } from "../hooks/use-toast"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface SettingsTabProps {
  user: User
  onSettingsUpdate: () => void
}

export function SettingsTab({ user, onSettingsUpdate }: SettingsTabProps) {
  const { toast } = useToast()
  const [testEmail, setTestEmail] = useState("")
  const [isTestingSMTP, setIsTestingSMTP] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSMTPTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir une adresse email de test",
        variant: "destructive"
      })
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive"
      })
      return
    }

    setIsTestingSMTP(true)
    setTestResult(null)

    try {
      console.log("🧪 Test SMTP en cours vers:", testEmail)
      
      // Appel à la nouvelle Edge Function de test SMTP
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          testEmail: testEmail
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.success) {
        setTestResult({
          success: true,
          message: `Email de test envoyé avec succès à ${testEmail}. Vérifiez votre boîte de réception.`
        })
        
        toast({
          title: "Test SMTP réussi ✅",
          description: `Email de test envoyé à ${testEmail} via Brevo`,
        })
        
        console.log("✅ Test SMTP réussi:", data)
      } else {
        throw new Error(data?.error || "Erreur inconnue lors du test")
      }

    } catch (error: any) {
      console.error("❌ Erreur test SMTP:", error)
      
      setTestResult({
        success: false,
        message: `Échec du test SMTP: ${error.message}`
      })
      
      toast({
        title: "Erreur test SMTP ❌",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsTestingSMTP(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
          <Settings className="w-6 h-6" />
          <span>Paramètres du Système</span>
        </h2>
        <p className="text-muted-foreground">Configuration et tests du CRM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations utilisateur */}
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Informations Utilisateur</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{user.email}</span>
                <Badge variant="secondary" className="rounded-full">Vérifié</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nom complet</Label>
              <div className="flex items-center space-x-2 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {user.user_metadata?.full_name || "Non renseigné"}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">ID Utilisateur</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {user.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test SMTP avec Brevo */}
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Test SMTP Brevo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail" className="text-sm font-medium">
                Email de test
              </Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="votre@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1 rounded-xl"
                disabled={isTestingSMTP}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Un email de test sera envoyé via l'API Brevo (smtp-relay.brevo.com)
              </p>
            </div>

            <Button
              onClick={handleSMTPTest}
              disabled={isTestingSMTP || !testEmail}
              className="w-full rounded-xl"
            >
              {isTestingSMTP ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer email de test
                </>
              )}
            </Button>

            {/* Résultat du test */}
            {testResult && (
              <div className={`p-3 rounded-xl border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {testResult.success ? 'Test réussi' : 'Test échoué'}
                  </span>
                </div>
                <p className="text-xs mt-1">{testResult.message}</p>
              </div>
            )}

            {/* Configuration Brevo */}
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Configuration Brevo Active</span>
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• Serveur SMTP: smtp-relay.brevo.com:587</div>
                <div>• Connexion: 694946002@smtp-brevo.com</div>
                <div>• Expéditeur: info@premunia.com</div>
                <div>• Limite journalière: 250 emails</div>
                <div>• Suivi: Ouvertures et clics trackés</div>
                <div>• API: Intégration Brevo REST API</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section statistiques email */}
      <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Statistiques Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-muted-foreground">Taux de livraison</div>
              <p className="text-xs text-blue-500 mt-1">Via Brevo</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">24%</div>
              <div className="text-sm text-muted-foreground">Taux d'ouverture</div>
              <p className="text-xs text-green-500 mt-1">Marketing</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">3.2%</div>
              <div className="text-sm text-muted-foreground">Taux de clic</div>
              <p className="text-xs text-purple-500 mt-1">Engagement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
