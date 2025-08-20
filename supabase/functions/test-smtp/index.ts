
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Function to handle CORS
function handleCors(req: Request) {
  const origin = req.headers.get('Origin') || '*';
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, apikey, x-client-info',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Headers CORS pour toutes les réponses
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, apikey, x-client-info',
    'Content-Type': 'application/json',
  };

  try {
    console.log("🧪 Test SMTP - Démarrage...")
    
    const { testEmail } = await req.json()

    if (!testEmail) {
      throw new Error("Email de test requis")
    }

    // Récupérer la clé API Brevo depuis les secrets
    const brevoApiKey = Deno.env.get("BREVO_API_KEY")
    
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY n'est pas configuré dans les secrets Supabase")
    }

    console.log(`📧 Envoi email de test vers: ${testEmail}`)

    // Construire le payload pour l'API Brevo
    const brevoPayload = {
      sender: {
        name: "CRM Marketing Test",
        email: "info@premunia.com"
      },
      to: [
        {
          email: testEmail,
          name: "Utilisateur Test"
        }
      ],
      subject: "Test SMTP - Configuration CRM Réussie ✅",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Test SMTP Réussi !</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Votre configuration Brevo fonctionne parfaitement
            </p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Configuration SMTP Opérationnelle</h2>
            <p style="color: #666; line-height: 1.8; margin-bottom: 30px;">
              Félicitations ! Ce message confirme que votre CRM peut envoyer des emails 
              via l'API Brevo avec succès. Votre configuration SMTP est parfaitement fonctionnelle.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0; font-size: 18px;">📊 Informations du Test</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li><strong>Date et heure :</strong> ${new Date().toLocaleString('fr-FR')}</li>
                <li><strong>Email destinataire :</strong> ${testEmail}</li>
                <li><strong>Serveur SMTP :</strong> smtp-relay.brevo.com:587</li>
                <li><strong>Système :</strong> CRM Marketing Premunia</li>
                <li><strong>API utilisée :</strong> Brevo (ex-SendinBlue)</li>
                <li><strong>Statut :</strong> <span style="color: #28a745; font-weight: bold;">✅ Succès</span></li>
              </ul>
            </div>

            <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #1976d2; margin-top: 0; font-size: 18px;">🚀 Prochaines Étapes</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Votre CRM est prêt à envoyer des campagnes marketing</li>
                <li>Vous pouvez maintenant créer et lancer vos campagnes email</li>
                <li>Les fonctionnalités d'envoi individuel sont opérationnelles</li>
                <li>Le tracking des ouvertures et clics est activé</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Cet email a été généré automatiquement par le système de test SMTP du CRM Marketing Premunia.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                Configuration testée avec succès le ${new Date().toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      `,
      textContent: `
Test SMTP - Configuration CRM Réussie ✅

Félicitations ! Votre configuration SMTP fonctionne parfaitement.

Informations du test :
- Date : ${new Date().toLocaleString('fr-FR')}
- Destinataire : ${testEmail}
- Serveur : smtp-relay.brevo.com:587
- Système : CRM Marketing Premunia
- API : Brevo
- Statut : ✅ Succès

Votre CRM est maintenant prêt à envoyer des campagnes marketing !

---
Cet email a été généré automatiquement par le système de test SMTP.
      `
    }

    console.log('📤 Envoi vers API Brevo...')
    
    // Appel à l'API Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(brevoPayload)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Erreur API Brevo:', errorData)
      throw new Error(`Erreur API Brevo (${response.status}): ${errorData}`)
    }

    const result = await response.json()
    console.log('✅ Réponse Brevo:', result)
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        message: `Email de test envoyé avec succès à ${testEmail}`,
        details: {
          provider: 'Brevo',
          timestamp: new Date().toISOString(),
          recipient: testEmail
        }
      }),
      {
        headers: corsHeaders,
        status: 200,
      },
    )
    
  } catch (error: any) {
    console.error("❌ Erreur test SMTP:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: {
          timestamp: new Date().toISOString(),
          provider: 'Brevo'
        }
      }),
      {
        headers: corsHeaders,
        status: 400, // Changé de 500 à 400 pour éviter les problèmes CORS
      },
    )
  }
})
