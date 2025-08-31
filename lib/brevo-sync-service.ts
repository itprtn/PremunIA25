import { supabase } from './supabase'

// Configuration Brevo depuis variables d'environnement
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || 'xkeysib-test-key'
const BREVO_BASE_URL = import.meta.env.VITE_BREVO_BASE_URL || 'https://api.brevo.com/v3'

// Debug log pour valider la présence de l'API key
console.log('🔍 Brevo API Configuration:', {
  apiKeySet: !!import.meta.env.VITE_BREVO_API_KEY,
  baseUrlSet: !!import.meta.env.VITE_BREVO_BASE_URL,
  apiKeyValue: BREVO_API_KEY.startsWith('xkeysib-test-key') ? 'USING_FALLBACK' : 'SET_FROM_ENV'
})

export interface BrevoEmailEvent {
  email: string
  event: 'delivered' | 'request' | 'opened' | 'click' | 'invalid_email' | 'deferred' | 'hard_bounce' | 'soft_bounce' | 'complaint' | 'unsubscribed'
  ts: number
  'message-id': string
  'smtp-id'?: number
  subject?: string
  tag?: string[]
  'x-custom-header'?: any
  link?: string
  reason?: string
  'template-id'?: number
  'campaign-name'?: string
}

export interface BrevoEmailStats {
  requests: number
  delivered: number
  hardBounces: number
  softBounces: number
  complaints: number
  unsubscriptions: number
  opened: number
  clicked: number
  invalid: number
  deferred: number
}

export interface BrevoCampaignInfo {
  id: number
  name: string
  subject: string
  status: string
  type: string
  createdAt: string
  modifiedAt: string
  recipients: number
  statistics?: {
    globalStats: {
      sent: number
      delivered: number
      hardBounces: number
      softBounces: number
      complaints: number
      delivered_rate: number
      bounce_rate: number
      complaint_rate: number
      opened: number
      openRate: number
      clicked: number
      clickRate: number
      unsubscribed: number
      unsubscribe_rate: number
    }
  }
}

export class BrevoSyncService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = BREVO_API_KEY) {
    this.apiKey = apiKey
    this.baseUrl = BREVO_BASE_URL
  }

  // Méthode privée pour les appels API avec gestion d'erreurs améliorée
  private async makeBrevoRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<any> {
    try {
      console.log(`🔗 Brevo API: ${method} ${this.baseUrl}${endpoint}`)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        console.error(`❌ Brevo API Error ${response.status}:`, errorData)
        throw new Error(`Brevo API Error ${response.status}: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Brevo API Success: ${Object.keys(data).join(', ')}`)
      return data
      
    } catch (error) {
      console.error('❌ Brevo API Request Failed:', error)
      throw error
    }
  }

  // Récupérer les statistiques agrégées des emails
  async getAggregatedEmailStats(startDate?: string, endDate?: string): Promise<BrevoEmailStats> {
    try {
      console.log('📊 Fetching aggregated email statistics from Brevo...')
      
      let endpoint = '/smtp/statistics/aggregatedReport'
      const params = new URLSearchParams()
      
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      if (params.toString()) {
        endpoint += '?' + params.toString()
      }

      const stats = await this.makeBrevoRequest(endpoint)
      
      console.log('📊 Brevo aggregated stats received:', {
        requests: stats.requests,
        delivered: stats.delivered,
        opens: stats.uniqueOpens || stats.opened,
        clicks: stats.uniqueClicks || stats.clicked
      })

      return {
        requests: stats.requests || 0,
        delivered: stats.delivered || 0,
        hardBounces: stats.hardBounces || 0,
        softBounces: stats.softBounces || 0,
        complaints: stats.complaints || 0,
        unsubscriptions: stats.unsubscriptions || 0,
        opened: stats.uniqueOpens || stats.opened || 0,
        clicked: stats.uniqueClicks || stats.clicked || 0,
        invalid: stats.invalid || 0,
        deferred: stats.deferred || 0
      }
    } catch (error) {
      console.error('❌ Failed to get aggregated email stats:', error)
      throw error
    }
  }

  // Récupérer l'historique détaillé des événements email
  async getEmailEvents(email?: string, startDate?: string, endDate?: string, limit: number = 100): Promise<BrevoEmailEvent[]> {
    try {
      console.log('📧 Fetching email events from Brevo...', { email, startDate, endDate, limit })

      const params = new URLSearchParams()
      if (email) params.append('email', email)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      params.append('limit', limit.toString())
      params.append('offset', '0')

      const endpoint = '/smtp/statistics/events?' + params.toString()
      const response = await this.makeBrevoRequest(endpoint)

      console.log('📧 Brevo events received:', response.events?.length || 0, 'events')
      return response.events || []
      
    } catch (error) {
      console.error('❌ Failed to get email events:', error)
      return []
    }
  }

  // Récupérer les informations des campagnes Brevo
  async getCampaigns(limit: number = 50, offset: number = 0): Promise<BrevoCampaignInfo[]> {
    try {
      console.log('📨 Fetching campaigns from Brevo...')
      
      const endpoint = `/emailCampaigns?limit=${limit}&offset=${offset}`
      const response = await this.makeBrevoRequest(endpoint)

      console.log('📨 Brevo campaigns received:', response.campaigns?.length || 0)
      return response.campaigns || []
      
    } catch (error) {
      console.error('❌ Failed to get campaigns:', error)
      return []
    }
  }

  // Récupérer les statistiques détaillées d'une campagne
  async getCampaignStatistics(campaignId: number): Promise<BrevoCampaignInfo | null> {
    try {
      console.log(`📊 Fetching campaign ${campaignId} statistics...`)
      
      const campaign = await this.makeBrevoRequest(`/emailCampaigns/${campaignId}`)
      return campaign
      
    } catch (error) {
      console.error(`❌ Failed to get campaign ${campaignId} statistics:`, error)
      return null
    }
  }

  // Synchroniser les données email avec Brevo et corriger la base de données locale
  async syncEmailDataWithBrevo(): Promise<{
    success: boolean
    updated: number
    errors: string[]
    stats: BrevoEmailStats
  }> {
    const errors: string[] = []
    let updated = 0

    try {
      console.log('🔄 Starting comprehensive Brevo sync...')

      // 1. Récupérer les statistiques globales de Brevo
      const brevoStats = await this.getAggregatedEmailStats()
      console.log('📊 Brevo global stats:', brevoStats)

      // 2. Récupérer l'historique des événements (derniers 30 jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const events = await this.getEmailEvents(
        undefined, 
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        1000 // Plus d'événements pour avoir plus de données
      )

      console.log('📧 Processing', events.length, 'email events from Brevo')

      // 3. Traiter chaque événement et mettre à jour la base locale
      for (const event of events) {
        try {
          await this.processEmailEvent(event)
          updated++
        } catch (error) {
          errors.push(`Event processing error for ${event.email}: ${error}`)
          console.error('❌ Event processing error:', error)
        }
      }

      // 4. Mettre à jour les statistiques générales dans notre système
      await this.updateGlobalEmailStats(brevoStats)

      console.log(`✅ Brevo sync completed: ${updated} events processed, ${errors.length} errors`)

      return {
        success: true,
        updated,
        errors,
        stats: brevoStats
      }

    } catch (error) {
      console.error('❌ Brevo sync failed:', error)
      return {
        success: false,
        updated,
        errors: [...errors, `Global sync error: ${error}`],
        stats: {
          requests: 0,
          delivered: 0,
          hardBounces: 0,
          softBounces: 0,
          complaints: 0,
          unsubscriptions: 0,
          opened: 0,
          clicked: 0,
          invalid: 0,
          deferred: 0
        }
      }
    }
  }

  // Traiter un événement email individuel
  private async processEmailEvent(event: BrevoEmailEvent): Promise<void> {
    try {
      // Trouver le contact par email
      const { data: contact } = await supabase
        .from('contact')
        .select('identifiant')
        .eq('email', event.email)
        .single()

      if (!contact) {
        console.warn(`⚠️ Contact not found for email: ${event.email}`)
        return
      }

      // Trouver ou créer un enregistrement d'envoi d'email
      let { data: emailRecord, error: findError } = await supabase
        .from('envois_email')
        .select('id')
        .eq('email_destinataire', event.email)
        .eq('contact_id', contact.identifiant)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error finding email record:', findError)
        return
      }

      // Si aucun enregistrement trouvé, en créer un
      if (!emailRecord) {
        try {
          console.log('🔍 DEBUG: Tentative création envoi email Brevo:', {
            contact_id: contact.identifiant,
            destinataire: event.email,
            statut: this.mapBrevoEventToStatus(event.event),
            event_ts: event.ts,
            brevo_message_id: event['message-id']
          })

          const { data: newRecord, error: createError } = await supabase
            .from('envois_email')
            .insert({
              campagne_id: null, // Nullable - Brevo sync emails ne sont pas liés à des campagnes spécifiques
              contact_id: contact.identifiant,
              projet_id: null, // Nullable pour les emails Brevo sans projet spécifique
              destinataire: event.email,
              sujet: event.subject || 'Email Brevo',
              statut: this.mapBrevoEventToStatus(event.event),
              date_envoi: new Date(event.ts * 1000).toISOString(),
              date_ouverture: event.event === 'opened' ? new Date(event.ts * 1000).toISOString() : null,
              date_clic: event.event === 'click' ? new Date(event.ts * 1000).toISOString() : null,
              erreur_message: this.isErrorEvent(event.event) ? event.reason : null,
              brevo_message_id: event['message-id'],
              brevo_smtp_id: event['smtp-id']?.toString(),
              contenu_html: '',
              contenu_texte: ''
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating email record:', createError)
            console.error('🔍 DEBUG: Details erreur création:', {
              code: createError.code,
              message: createError.message,
              details: createError.details,
              hint: createError.hint
            })
            return
          }

          emailRecord = newRecord
          console.log(`✅ Created new email record for ${event.email}: ID ${newRecord.id}`)
        } catch (unexpectedError) {
          console.error('💥 Erreur inattendue création email:', unexpectedError)
        }
      } else {
        // Mettre à jour l'enregistrement existant avec les nouvelles données Brevo
        const updateData: any = {
          statut: this.mapBrevoEventToStatus(event.event),
          brevo_message_id: event['message-id'],
          brevo_smtp_id: event['smtp-id']?.toString()
        }

        if (event.event === 'opened' && !emailRecord.date_ouverture) {
          updateData.date_ouverture = new Date(event.ts * 1000).toISOString()
        }

        if (event.event === 'click' && !emailRecord.date_clic) {
          updateData.date_clic = new Date(event.ts * 1000).toISOString()
        }

        if (this.isErrorEvent(event.event) && event.reason) {
          updateData.erreur_message = event.reason
        }

        const { error: updateError } = await supabase
          .from('envois_email')
          .update(updateData)
          .eq('id', emailRecord.id)

        if (updateError) {
          console.error('❌ Error updating email record:', updateError)
          return
        }

        console.log(`✅ Updated email record for ${event.email} with event: ${event.event}`)
      }

    } catch (error) {
      console.error(`❌ Error processing email event for ${event.email}:`, error)
      throw error
    }
  }

  // Mettre à jour les statistiques globales
  private async updateGlobalEmailStats(stats: BrevoEmailStats): Promise<void> {
    try {
      // Insérer ou mettre à jour les statistiques globales dans une table dédiée
      const { error } = await supabase
        .from('email_stats_global')
        .upsert({
          id: 1, // ID unique pour les stats globales
          total_requests: stats.requests,
          total_delivered: stats.delivered,
          total_opened: stats.opened,
          total_clicked: stats.clicked,
          total_hard_bounces: stats.hardBounces,
          total_soft_bounces: stats.softBounces,
          total_complaints: stats.complaints,
          total_unsubscriptions: stats.unsubscriptions,
          total_invalid: stats.invalid,
          total_deferred: stats.deferred,
          open_rate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
          click_rate: stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0,
          bounce_rate: stats.requests > 0 ? ((stats.hardBounces + stats.softBounces) / stats.requests) * 100 : 0,
          last_sync: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error updating global email stats:', error)
      } else {
        console.log('✅ Global email stats updated successfully')
      }

    } catch (error) {
      console.error('❌ Failed to update global email stats:', error)
    }
  }

  // Mapper les événements Brevo vers les statuts de notre système
  private mapBrevoEventToStatus(eventType: string): string {
    switch (eventType) {
      case 'delivered':
        return 'delivre'
      case 'request':
        return 'envoye'
      case 'opened':
        return 'ouvert'
      case 'click':
        return 'clic'
      case 'hard_bounce':
      case 'soft_bounce':
        return 'bounce'
      case 'complaint':
        return 'plainte'
      case 'unsubscribed':
        return 'desabonne'
      case 'invalid_email':
        return 'invalide'
      case 'deferred':
        return 'differe'
      default:
        return 'inconnu'
    }
  }

  // Vérifier si un événement est une erreur
  private isErrorEvent(eventType: string): boolean {
    return ['hard_bounce', 'soft_bounce', 'complaint', 'invalid_email'].includes(eventType)
  }

  // Synchroniser les données d'un projet spécifique
  async syncProjectEmailHistory(projectId: number): Promise<{
    success: boolean
    emails: any[]
    error?: string
  }> {
    try {
      console.log(`🔄 Syncing email history for project ${projectId}...`)

      // 1. Récupérer les emails du projet depuis la base locale
      const { data: localEmails, error: localError } = await supabase
        .from('envois_email')
        .select(`
          id,
          email_destinataire,
          date_envoi,
          statut,
          brevo_message_id,
          contact_id,
          projet_id
        `)
        .eq('projet_id', projectId)

      if (localError) {
        throw localError
      }

      console.log(`📧 Found ${localEmails?.length || 0} local emails for project ${projectId}`)

      // 2. Pour chaque email, récupérer les événements récents de Brevo
      const emailsWithBrevoData = []

      for (const email of localEmails || []) {
        if (email.destinataire) {
          const events = await this.getEmailEvents(
            email.destinataire,
            undefined, // startDate
            undefined, // endDate
            10 // limit
          )

          // Prendre l'événement le plus récent
          const latestEvent = events[0]
          if (latestEvent) {
            // Mettre à jour le statut local si nécessaire
            const brevoStatus = this.mapBrevoEventToStatus(latestEvent.event)
            if (brevoStatus !== email.statut) {
              await supabase
                .from('envois_email')
                .update({
                  statut: brevoStatus,
                  brevo_message_id: latestEvent['message-id']
                })
                .eq('id', email.id)

              email.statut = brevoStatus
            }
          }

          emailsWithBrevoData.push({
            ...email,
            brevo_events: events,
            latest_brevo_status: latestEvent ? this.mapBrevoEventToStatus(latestEvent.event) : null
          })
        }
      }

      console.log(`✅ Project ${projectId} email sync completed`)

      return {
        success: true,
        emails: emailsWithBrevoData
      }

    } catch (error) {
      console.error(`❌ Project ${projectId} sync failed:`, error)
      return {
        success: false,
        emails: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Synchroniser les données emails avec le CRM local (nouvelle méthode appelée dans ProjectsTab)
  async syncEmailDataWithCRM(): Promise<{
    success: boolean
    updated: number
    errors: string[]
    message: string
  }> {
    const errors: string[] = []
    let updated = 0

    try {
      console.log('🔄 Démarrage synchronisation email CRM...')

      // 1. Récupérer les statistiques agrégées de Brevo
      const stats = await this.getAggregatedEmailStats()
      console.log('📊 Statistiques Brevo récupérées:', stats)

      // 2. Obtenir tous les événements email récents (30 derniers jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const events = await this.getEmailEvents(
        undefined,
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        1000 // limite plus élevée pour une meilleure synchro
      )

      console.log(`📧 ${events.length} événements email trouvés`)

      // 3. Traiter chaque événement email
      for (const event of events) {
        try {
          await this.processEmailEvent(event)
          updated++
        } catch (error: any) {
          const errorMsg = `Erreur traitement événement ${event.email}: ${error.message}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`, error)
        }
      }

      // 4. Mettre à jour les statistiques globales
      await this.updateGlobalEmailStats(stats)

      console.log(`✅ Sync CRM terminée: ${updated} événements traités, ${errors.length} erreurs`)

      return {
        success: true,
        updated,
        errors,
        message: `Synchronisation terminée: ${updated} événements traités, ${errors.length} erreurs`
      }

    } catch (error: any) {
      console.error('❌ Sync CRM échouée:', error)
      return {
        success: false,
        updated,
        errors: [...errors, `Erreur globale: ${error.message}`],
        message: `Échec de la synchronisation: ${error.message}`
      }
    }
  }

  // Test de connexion Brevo avec diagnostics
  async testBrevoConnection(): Promise<{
    success: boolean
    account?: any
    error?: string
    diagnostics: any
  }> {
    const diagnostics = {
      api_key_format: false,
      api_endpoint_reachable: false,
      account_info: null,
      rate_limit: null
    }

    try {
      // 1. Vérifier le format de la clé API
      diagnostics.api_key_format = this.apiKey.startsWith('xkeysib-') && this.apiKey.length > 20

      // 2. Tester la connectivité
      const account = await this.makeBrevoRequest('/account')
      diagnostics.api_endpoint_reachable = true
      diagnostics.account_info = {
        company_name: account.companyName,
        email: account.email,
        first_name: account.firstName,
        last_name: account.lastName
      }

      console.log('✅ Brevo connection test successful:', diagnostics)

      return {
        success: true,
        account,
        diagnostics
      }

    } catch (error) {
      console.error('❌ Brevo connection test failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        diagnostics
      }
    }
  }
}

// Instance par défaut
export const brevoSync = new BrevoSyncService()

// Fonctions utilitaires pour l'interface utilisateur
export const brevoUtils = {
  // Formater les statistiques pour l'affichage
  formatEmailStats: (stats: BrevoEmailStats) => ({
    totalSent: stats.requests,
    delivered: stats.delivered,
    opened: stats.opened,
    clicked: stats.clicked,
    bounced: stats.hardBounces + stats.softBounces,
    openRate: stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100 * 100) / 100 : 0,
    clickRate: stats.delivered > 0 ? Math.round((stats.clicked / stats.delivered) * 100 * 100) / 100 : 0,
    bounceRate: stats.requests > 0 ? Math.round(((stats.hardBounces + stats.softBounces) / stats.requests) * 100 * 100) / 100 : 0
  }),

  // Obtenir la couleur du statut
  getStatusColor: (status: string) => {
    switch (status) {
      case 'delivre':
        return 'bg-green-100 text-green-800'
      case 'ouvert':
        return 'bg-blue-100 text-blue-800'
      case 'clic':
        return 'bg-purple-100 text-purple-800'
      case 'bounce':
        return 'bg-red-100 text-red-800'
      case 'plainte':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  },

  // Obtenir le texte du statut
  getStatusText: (status: string) => {
    switch (status) {
      case 'envoye':
        return 'Envoyé'
      case 'delivre':
        return 'Délivré'
      case 'ouvert':
        return 'Ouvert'
      case 'clic':
        return 'Cliqué'
      case 'bounce':
        return 'Rejeté'
      case 'plainte':
        return 'Plainte'
      case 'desabonne':
        return 'Désabonné'
      default:
        return status
    }
  }
}
