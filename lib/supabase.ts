import { createClient } from "@supabase/supabase-js"

export const supabaseUrl = "https://wybhtprxiwgzmpmnfceq.supabase.co"
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Ymh0cHJ4aXdnem1wbW5mY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzIwODksImV4cCI6MjA2NjYwODA4OX0.ctFmwHC_iitVB16WB7lY616lIp0CAHBUGRaoi56ruqc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Contact {
  identifiant: number
  civilite?: string
  prenom?: string
  nom?: string
  raison_sociale?: string
  adresse?: string
  code_postal?: string
  ville?: string
  telephone?: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface Projet {
  projet_id: number
  contact_id?: number
  date_creation?: string
  origine?: string
  statut?: string
  commercial?: string
  date_souscription?: string
  contrat?: boolean
  created_at?: string
  updated_at?: string
}

export interface Contrat {
  id: string
  contact_id?: number
  projet_id?: number
  contrat_num_contrat?: string
  contrat_produit?: string
  prime_brute_mensuelle?: number
  prime_nette_mensuelle?: number
  contrat_date_creation?: string
  contrat_debut_effet?: string
  contrat_date_echeance?: string
}

export interface Segment {
  id: number
  nom: string
  description?: string
  criteres: any
  couleur?: string
  created_at?: string
}

export interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte?: string
  variables?: any
  categorie?: string
  statut?: string
  created_at?: string
}

export interface Interaction {
  id: number
  contact_id?: number
  created_at?: string
  type?: string
  canal?: string
  sujet?: string
  message?: string
  statut?: string
  workflow_name?: string
  segment_name?: string
}

// API functions
export const api = {
  async getSession() {
    return await supabase.auth.getSession();
  },
  // Contacts
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase.from("contact").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createContact(contact: Omit<Contact, "identifiant" | "created_at" | "updated_at">): Promise<Contact> {
    const { data, error } = await supabase.from("contact").insert([contact]).select().single()

    if (error) throw error
    return data
  },

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from("contact")
      .update({ ...contact, updated_at: new Date().toISOString() })
      .eq("identifiant", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteContact(id: number): Promise<void> {
    const { error } = await supabase.from("contact").delete().eq("identifiant", id)

    if (error) throw error
  },

  // Projects
  async getProjects(): Promise<Projet[]> {
    const { data, error } = await supabase
      .from("projets")
      .select(`
        *,
        contact:contact_id (*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createProject(project: Omit<Projet, "projet_id" | "created_at" | "updated_at">): Promise<Projet> {
    const { data, error } = await supabase.from("projets").insert([project]).select().single()

    if (error) throw error
    return data
  },

  // Contracts
  async getContracts(): Promise<Contrat[]> {
    const { data, error } = await supabase
      .from("contrats")
      .select("*")
      .order("contrat_date_creation", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Segments
  async getSegments(): Promise<Segment[]> {
    const { data, error } = await supabase.from("segments").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createSegment(segment: Omit<Segment, "id" | "created_at">): Promise<Segment> {
    const { data, error } = await supabase.from("segments").insert([segment]).select().single()

    if (error) throw error
    return data
  },

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase.from("email_templates").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createEmailTemplate(template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">): Promise<EmailTemplate> {
    const { data, error } = await supabase.from("email_templates").insert([template]).select().single()

    if (error) throw error
    return data
  },

  // Interactions
  async getInteractions(): Promise<Interaction[]> {
    const { data, error } = await supabase.from("interactions").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createInteraction(interaction: Omit<Interaction, "id" | "created_at">): Promise<Interaction> {
    const { data, error } = await supabase.from("interactions").insert([interaction]).select().single()

    if (error) throw error
    return data
  },

  // Authentication
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return data
  },

  async getUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user || null;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
