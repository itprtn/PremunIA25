// Wrapper pour Supabase qui évite les conflits ESM/CJS
let supabaseClient: any = null
let supabaseModule: any = null

const initSupabase = async () => {
  if (!supabaseClient) {
    try {
      // Import dynamique pour éviter les problèmes ESM/CJS
      supabaseModule = await import('@supabase/supabase-js')
      const { createClient } = supabaseModule
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
      }

      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
    } catch (error) {
      console.error('Failed to initialize Supabase:', error)
      throw error
    }
  }
  return supabaseClient
}

// Export d'une instance par défaut
export const getSupabase = async () => {
  return await initSupabase()
}

// Export pour la compatibilité
export let supabase: any

// Initialisation immédiate pour l'export par défaut
initSupabase().then(client => {
  supabase = client
}).catch(error => {
  console.error('Failed to initialize default Supabase client:', error)
})

export default getSupabase
