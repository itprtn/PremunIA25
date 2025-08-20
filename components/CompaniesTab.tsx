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
import type { Contact, Contrat } from "../lib/types"

interface Company {
  id: number
  nom: string
  secteur: string
  taille: string
  statut: string
  adresse?: string
  telephone?: string
  email?: string
  site_web?: string
  notes?: string
  date_creation: string
  contacts?: Contact[]
  contrats?: Contrat[]
}

interface CompaniesTabProps {
  contacts: Contact[]
  contrats: Contrat[]
  onCompanyUpdate: () => void
}

export function CompaniesTab({ contacts, contrats, onCompanyUpdate }: CompaniesTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewCompany, setIsNewCompany] = useState(false)

  // Generate companies from existing data
  const companies = useMemo(() => {
    const companyMap = new Map<string, Company>()

    // From contracts
    contrats.forEach((contrat) => {
      if (contrat.contrat_compagnie) {
        const companyName = contrat.contrat_compagnie
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, {
            id: Math.random(),
            nom: companyName,
            secteur: "Assurance",
            taille: "Grande entreprise",
            statut: "Actif",
            date_creation: contrat.contrat_date_creation,
            contacts: [],
            contrats: [],
          })
        }
        companyMap.get(companyName)!.contrats!.push(contrat)
      }
    })

    // From contacts (entreprise type)
    contacts
      .filter((c) => c.type === "Entreprise")
      .forEach((contact) => {
        const companyName = `${contact.prenom} ${contact.nom}`
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, {
            id: contact.id,
            nom: companyName,
            secteur: "Services",
            taille: "PME",
            statut: contact.statut,
            email: contact.email,
            telephone: contact.telephone,
            date_creation: contact.date_creation,
            contacts: [],
            contrats: [],
          })
        }
        companyMap.get(companyName)!.contacts!.push(contact)
      })

    return Array.from(companyMap.values())
  }, [contacts, contrats])

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        !searchTerm ||
        company.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.secteur.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSector = sectorFilter === "all" || company.secteur === sectorFilter
      const matchesSize = sizeFilter === "all" || company.taille === sizeFilter

      return matchesSearch && matchesSector && matchesSize
    })
  }, [companies, searchTerm, sectorFilter, sizeFilter])

  const getStatusColor = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "actif":
        return "bg-green-100 text-green-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      case "inactif":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSizeIcon = (taille: string) => {
    switch (taille) {
      case "TPE":
        return "fas fa-user"
      case "PME":
        return "fas fa-users"
      case "Grande entreprise":
        return "fas fa-building"
      default:
        return "fas fa-building"
    }
  }

  const handleCompanySubmit = async (formData: FormData) => {
    try {
      const companyData = {
        nom: formData.get("nom") as string,
        secteur: formData.get("secteur") as string,
        taille: formData.get("taille") as string,
        statut: formData.get("statut") as string,
        adresse: formData.get("adresse") as string,
        telephone: formData.get("telephone") as string,
        email: formData.get("email") as string,
        site_web: formData.get("site_web") as string,
        notes: formData.get("notes") as string,
      }

      // For now, we'll create a contact of type "Entreprise"
      const contactData = {
        prenom: companyData.nom,
        nom: "Entreprise",
        type: "Entreprise",
        statut: companyData.statut,
        email: companyData.email,
        telephone: companyData.telephone,
        notes: `Secteur: ${companyData.secteur}\nTaille: ${companyData.taille}\nAdresse: ${companyData.adresse}\nSite web: ${companyData.site_web}\n\n${companyData.notes}`,
      }

      if (isNewCompany) {
        await supabase.from("contacts").insert([contactData])
      } else if (selectedCompany) {
        await supabase.from("contacts").update(contactData).eq("id", selectedCompany.id)
      }

      setIsDialogOpen(false)
      setSelectedCompany(null)
      onCompanyUpdate()
    } catch (error) {
      console.error("Error saving company:", error)
    }
  }

  const openNewCompanyDialog = () => {
    setSelectedCompany(null)
    setIsNewCompany(true)
    setIsDialogOpen(true)
  }

  const openEditCompanyDialog = (company: Company) => {
    setSelectedCompany(company)
    setIsNewCompany(false)
    setIsDialogOpen(true)
  }

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = companies.reduce(
      (sum, c) => sum + (c.contrats?.reduce((cSum, contrat) => cSum + (contrat.prime_brute_annuelle || 0), 0) || 0),
      0,
    )
    const totalContracts = companies.reduce((sum, c) => sum + (c.contrats?.length || 0), 0)
    const activeCompanies = companies.filter((c) => c.statut === "Actif").length

    return { totalRevenue, totalContracts, activeCompanies }
  }, [companies])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Entreprises</h2>
          <p className="text-muted-foreground">{filteredCompanies.length} entreprises trouvées</p>
        </div>
        <Button onClick={openNewCompanyDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <i className="fas fa-plus mr-2"></i>
          Nouvelle Entreprise
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entreprises Actives</p>
                <p className="text-xl font-bold text-foreground">{totals.activeCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-euro-sign text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Total</p>
                <p className="text-xl font-bold text-foreground">€{(totals.totalRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-signature text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contrats Totaux</p>
                <p className="text-xl font-bold text-foreground">{totals.totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Moyen</p>
                <p className="text-xl font-bold text-foreground">
                  €{companies.length > 0 ? Math.round(totals.totalRevenue / companies.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Nom, secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sector">Secteur</Label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  <SelectItem value="Assurance">Assurance</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Technologie">Technologie</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Industrie">Industrie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size">Taille</Label>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les tailles</SelectItem>
                  <SelectItem value="TPE">TPE (1-10)</SelectItem>
                  <SelectItem value="PME">PME (11-250)</SelectItem>
                  <SelectItem value="Grande entreprise">Grande entreprise (250+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSectorFilter("all")
                  setSizeFilter("all")
                }}
              >
                <i className="fas fa-times mr-2"></i>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <i className={`${getSizeIcon(company.taille)} text-lg`}></i>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.nom}</CardTitle>
                    <p className="text-sm text-muted-foreground">{company.secteur}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(company.statut)}>{company.statut}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taille:</span>
                  <span className="font-medium">{company.taille}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-600">{company.contacts?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Contacts</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-600">{company.contrats?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Contrats</div>
                  </div>
                </div>

                {company.contrats && company.contrats.length > 0 && (
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-semibold text-purple-600">
                      €{(company.contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) / 1000).toFixed(0)}
                      k
                    </div>
                    <div className="text-xs text-muted-foreground">Chiffre d'affaires</div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <i className="fas fa-calendar text-muted-foreground w-4"></i>
                  <span>{new Date(company.date_creation).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditCompanyDialog(company)}>
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

      {/* Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isNewCompany ? "Nouvelle Entreprise" : "Modifier l'Entreprise"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCompanySubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom de l'entreprise *</Label>
                <Input id="nom" name="nom" defaultValue={selectedCompany?.nom || ""} required />
              </div>
              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Select name="secteur" defaultValue={selectedCompany?.secteur || "Services"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assurance">Assurance</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Technologie">Technologie</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Industrie">Industrie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taille">Taille</Label>
                <Select name="taille" defaultValue={selectedCompany?.taille || "PME"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TPE">TPE (1-10 employés)</SelectItem>
                    <SelectItem value="PME">PME (11-250 employés)</SelectItem>
                    <SelectItem value="Grande entreprise">Grande entreprise (250+ employés)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select name="statut" defaultValue={selectedCompany?.statut || "Prospect"}>
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
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" name="adresse" defaultValue={selectedCompany?.adresse || ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" defaultValue={selectedCompany?.telephone || ""} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selectedCompany?.email || ""} />
              </div>
            </div>

            <div>
              <Label htmlFor="site_web">Site web</Label>
              <Input
                id="site_web"
                name="site_web"
                type="url"
                defaultValue={selectedCompany?.site_web || ""}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={selectedCompany?.notes || ""} rows={3} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isNewCompany ? "Créer" : "Modifier"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
