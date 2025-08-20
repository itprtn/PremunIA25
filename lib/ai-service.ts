export const aiService = {
  async analyzeContacts(contacts: any[]) {
    // Simulation d'analyse IA des contacts
    return contacts.slice(0, 5).map((contact, index) => ({
      nom: `Insight ${index + 1}: ${contact.prenom} ${contact.nom}`,
      description: `Opportunité de cross-selling détectée pour ce ${contact.type?.toLowerCase() || 'contact'}`,
      aiScore: Math.floor(Math.random() * 40) + 60,
      color: "bg-purple-500",
      icon: "fas fa-lightbulb",
    }))
  },
}
