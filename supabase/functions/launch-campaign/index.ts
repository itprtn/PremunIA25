import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Hardcode Supabase URL and Key for Edge Function
// In a real scenario, these should be set as Supabase Edge Function environment variables
const SUPABASE_URL = "https://wybhtprxiwgzmpmnfceq.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Ymh0cHJ4aXdnem1wbW5mY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzIwODksImV4cCI6MjA2NjYwODA4OX0.ctFmwHC_iitVB16WB7lY616lIp0CAHBUGRaoi56ruqc"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Ymh0cHJ4aXdnem1wbW5mY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzIwODksImV4cCI6MjA2NjYwODA4OX0.ctFmwHC_iitVB16WB7lY616lIp0CAHBUGRaoi56ruqc" // Replace with your actual service role key if needed for this function

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("🚀 Démarrage du lancement de campagne...")
    const { campaignId, immediate = false, scheduledFor } = await req.json()

    if (!campaignId) {
      throw new Error("ID de campagne requis")
    }

    console.log(`📋 Récupération campagne ID: ${campaignId}`)
    const { data: campaign, error: campaignError } = await supabase
      .from("campagnes_email")
      .select(`
        *,
        segments!inner(id, nom, criteres),
        templates_email!inner(id, nom, contenu),
        email_configurations!inner(id, email, smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password)
      `)
      .eq("id", campaignId)
      .maybeSingle()

    if (campaignError || !campaign) {
      throw new Error(`Campagne non trouvée: ${campaignError?.message}`)
    }

    console.log(`📊 Campagne trouvée: ${campaign.nom}`)

    // Vérifier que la campagne peut être lancée
    if (campaign.statut !== "brouillon" && campaign.statut !== "planifiee") {
      throw new Error(`Impossible de lancer la campagne avec le statut: ${campaign.statut}`)
    }

    console.log(`🎯 Récupération des contacts du segment: ${campaign.segments.nom}`)
    const contacts = await getContactsFromSegment(campaign.segments)

    if (contacts.length === 0) {
      throw new Error("Aucun contact trouvé dans le segment")
    }

    console.log(`👥 ${contacts.length} contacts trouvés`)

    const queueEntries = contacts.map((contact: any) => ({
      campagne_id: campaignId,
      contact_id: contact.id,
      email_destinataire: contact.email,
      sujet: generateEmailSubject(campaign.templates_email.contenu, contact),
      contenu_html: generateEmailContent(campaign.templates_email.contenu, contact),
      statut: "pending",
      scheduled_for: immediate ? new Date().toISOString() : scheduledFor || campaign.date_planifiee,
    }))

    console.log("📤 Ajout des emails à la file d'attente...")
    const { error: queueError } = await supabase.from("email_queue").insert(queueEntries)

    if (queueError) {
      throw new Error(`Erreur ajout file d'attente: ${queueError.message}`)
    }

    // Mettre à jour le statut de la campagne
    const newStatus = immediate ? "en_cours" : "planifiee"
    const { error: updateError } = await supabase
      .from("campagnes_email")
      .update({
        statut: newStatus,
        contact_count: contacts.length,
        date_lancement: immediate ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)

    if (updateError) {
      throw new Error(`Erreur mise à jour campagne: ${updateError.message}`)
    }

    // Si lancement immédiat, déclencher le traitement de la file d'attente
    if (immediate) {
      console.log("⚡ Lancement immédiat - déclenchement du traitement...")
      try {
        const processResponse = await fetch(`${SUPABASE_URL}/functions/v1/process-email-queue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({}),
        })

        const processResult = await processResponse.json()
        console.log("📊 Résultat traitement immédiat:", processResult)
      } catch (processError: any) {
        console.error("⚠️ Erreur traitement immédiat:", processError)
        // Ne pas faire échouer la campagne si le traitement immédiat échoue
      }
    }

    console.log("✅ Campagne lancée avec succès")

    return new Response(
      JSON.stringify({
        success: true,
        campaign: {
          id: campaignId,
          name: campaign.nom,
          status: newStatus,
          contactCount: contacts.length,
          queuedEmails: queueEntries.length,
        },
        message: immediate ? "Campagne lancée immédiatement" : "Campagne planifiée",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error("❌ Erreur lancement campagne:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})

async function getContactsFromSegment(segment: any) {
  console.log(`🔍 Application des critères du segment:`, segment.criteres)

  // Construire la requête en fonction des critères
  let query = supabase
    .from("contact")
    .select("identifiant as id, email, prenom, nom, civilite")
    .not("email", "is", null)

  // Appliquer les critères du segment
  if (segment.criteres && typeof segment.criteres === "object") {
    if (segment.criteres.ville) {
      query = query.eq("ville", segment.criteres.ville)
    }
    if (segment.criteres.code_postal) {
      query = query.like("code_postal", `${segment.criteres.code_postal}%`)
    }
    if (segment.criteres.type_contact) {
      query = query.eq("type_contact", segment.criteres.type_contact)
    }
  }

  const { data, error } = await query.limit(1000) // Limite de sécurité

  if (error) {
    throw new Error(`Erreur récupération contacts: ${error.message}`)
  }

  return data || []
}

function generateEmailSubject(template: string, contact: any): string {
  let subject = "Offre personnalisée" // Sujet par défaut

  // Extraire le sujet du template si défini
  const subjectMatch = template.match(/\[SUJET\](.*?)\[\/SUJET\]/)
  if (subjectMatch) {
    subject = subjectMatch[1]
  }

  // Remplacer les variables
  return subject
    .replace(/\{prenom\}/g, contact.prenom || "")
    .replace(/\{nom\}/g, contact.nom || "")
    .replace(/\{civilite\}/g, contact.civilite || "")
}

function generateEmailContent(template: string, contact: any): string {
  return template
    .replace(/\{prenom\}/g, contact.prenom || "Cher prospect")
    .replace(/\{nom\}/g, contact.nom || "")
    .replace(/\{civilite\}/g, contact.civilite || "Monsieur/Madame")
    .replace(/\{email\}/g, contact.email || "")
}
