"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { supabase } from "../lib/supabase"
import type { Contact } from "../lib/types"

interface ContactsTabProps {
  contacts: Contact[]
  onContactUpdate: () => void
}

export function ContactsTab({ contacts, onContactUpdate }: ContactsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewContact, setIsNewContact] = useState(false)

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        !searchTerm ||
        `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || contact.statut === statusFilter
      const matchesType = typeFilter === "all" || contact.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [contacts, searchTerm, statusFilter, typeFilter])

  const handleContactSubmit = async (formData: FormData) => {
    try {
      const contactData = {
        prenom: formData.get("prenom") as string,
        nom: formData.get("nom") as string,
        email: formData.get("email") as string,
        telephone: formData.get("telephone") as string,
        type: formData.get("type") as string,
        statut: formData.get("statut") as string,
        notes: formData.get("notes") as string,
      }

      if (isNewContact) {
        await supabase.from("contacts").insert([contactData])
      } else if (selectedContact) {
        await supabase.from("contacts").update(contactData).eq("id", selectedContact.id)
      }

      setIsDialogOpen(false)
      setSelectedContact(null)
      onContactUpdate()
    } catch (error) {
      console.error("Error saving contact:", error)
    }
  }

  const openNewContactDialog = () => {
    setSelectedContact(null)
    setIsNewContact(true)
    setIsDialogOpen(true)
  }

  const openEditContactDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setIsNewContact(false)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Contacts</h2>
          <p className="text-muted-foreground">{filteredContacts.length} contacts trouvés</p>
        </div>
        <Button onClick={openNewContactDialog} className="bg-blue-600 hover:bg-blue-700">
          <i className="fas fa-plus mr-2"></i>
          Nouveau Contact
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="Prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Particulier">Particulier</SelectItem>
                  <SelectItem value="Professionnel">Professionnel</SelectItem>
                  <SelectItem value="Entreprise">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
              >
                <i className="fas fa-times mr-2"></i>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.prenom?.[0]}
                    {contact.nom?.[0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {contact.prenom} {contact.nom}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{contact.type}</p>
                  </div>
                </div>
                <Badge variant={contact.statut === "Actif" ? "default" : "secondary"}>{contact.statut}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-envelope text-muted-foreground w-4"></i>
                  <span className="truncate">{contact.email || "Non renseigné"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-phone text-muted-foreground w-4"></i>
                  <span>{contact.telephone || "Non renseigné"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-calendar text-muted-foreground w-4"></i>
                  <span>{new Date(contact.date_creation).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditContactDialog(contact)}>
                  <i className="fas fa-edit mr-1"></i>
                  Modifier
                </Button>
                <Button size="sm" variant="outline">
                  <i className="fas fa-eye mr-1"></i>
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNewContact ? "Nouveau Contact" : "Modifier le Contact"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleContactSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">Prénom *</Label>
                <Input id="prenom" name="prenom" defaultValue={selectedContact?.prenom || ""} required />
              </div>
              <div>
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" name="nom" defaultValue={selectedContact?.nom || ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selectedContact?.email || ""} />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" defaultValue={selectedContact?.telephone || ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={selectedContact?.type || "Particulier"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Particulier">Particulier</SelectItem>
                    <SelectItem value="Professionnel">Professionnel</SelectItem>
                    <SelectItem value="Entreprise">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select name="statut" defaultValue={selectedContact?.statut || "Prospect"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={selectedContact?.notes || ""} rows={3} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isNewContact ? "Créer" : "Modifier"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
