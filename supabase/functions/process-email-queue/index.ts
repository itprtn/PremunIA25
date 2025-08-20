import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("🔄 Démarrage du traitement de la file d'attente email...")

    const { data: emailQueue, error: queueError } = await supabase.rpc("process_email_queue")

    if (queueError) {
      throw new Error(`Erreur récupération file d'attente: ${queueError.message}`)
    }

    if (!emailQueue || emailQueue.length === 0) {
      console.log("📭 Aucun email en attente")
      return new Response(
        JSON.stringify({
          success: true,
          message: "Aucun email en attente",
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      )
    }

    console.log(`📬 ${emailQueue.length} emails à traiter`)
    const results = []

    for (const emailItem of emailQueue) {
      try {
        console.log(`📧 Traitement email ID: ${emailItem.queue_id} vers: ${emailItem.email}`)

        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            to: emailItem.email,
            subject: emailItem.sujet,
            html: emailItem.contenu,
            config: emailItem.config,
          }),
        })

        const emailResult = await emailResponse.json()

        if (emailResult.success) {
          // Marquer l'email comme envoyé
          const { error: updateError } = await supabase.rpc("mark_email_sent", {
            p_queue_id: emailItem.queue_id,
            p_message_id: emailResult.messageId,
            p_smtp_response: emailResult.response,
          })

          if (updateError) {
            console.error(`❌ Erreur mise à jour statut envoyé: ${updateError.message}`)
          }

          console.log(`✅ Email ${emailItem.queue_id} envoyé avec succès`)
          results.push({
            id: emailItem.queue_id,
            status: "sent",
            messageId: emailResult.messageId,
          })
        } else {
          // Marquer l'email comme échec
          const { error: failError } = await supabase.rpc("mark_email_failed", {
            p_queue_id: emailItem.queue_id,
            p_error_details: emailResult.error || "Erreur inconnue",
          })

          if (failError) {
            console.error(`❌ Erreur mise à jour statut échec: ${failError.message}`)
          }

          console.log(`❌ Échec envoi email ${emailItem.queue_id}: ${emailResult.error}`)
          results.push({
            id: emailItem.queue_id,
            status: "failed",
            error: emailResult.error,
          })
        }
      } catch (emailError) {
        console.error(`❌ Erreur traitement email ${emailItem.queue_id}:`, emailError)

        // Marquer comme échec
        const { error: failError } = await supabase.rpc("mark_email_failed", {
          p_queue_id: emailItem.queue_id,
          p_error_details: emailError.message,
        })

        if (failError) {
          console.error(`❌ Erreur mise à jour statut échec: ${failError.message}`)
        }

        results.push({
          id: emailItem.queue_id,
          status: "failed",
          error: emailError.message,
        })
      }
    }

    const successCount = results.filter((r) => r.status === "sent").length
    const failedCount = results.filter((r) => r.status === "failed").length

    console.log(`🎯 Traitement terminé: ${successCount} envoyés, ${failedCount} échecs`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: emailQueue.length,
        sent: successCount,
        failed: failedCount,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("❌ Erreur traitement file d'attente:", error)
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
