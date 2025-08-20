"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { supabase } from "../lib/supabase"
import type { Contrat, Projet } from "../lib/types"

interface ContractsTabProps {
  contrats: Contrat[]
  projets: Projet[]
  onContractUpdate: () => void
}

export function ContractsTab({ contrats, projets, onContractUpdate }: ContractsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("En attente")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [selectedContract, setSelectedContract] = useState<Contrat | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewContract, setIsNewContract] = useState(false)

  // Get unique companies
  const companies = useMemo(() => {
    const uniqueCompanies = [...new Set(contrats.map((c) => c.contrat_compagnie).filter(Boolean))]
    return uniqueCompanies.sort()
  }, [contrats])

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contrats.filter((contrat) => {
      const matchesSearch =
        !searchTerm ||
        contrat.contrat_produit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.contrat_compagnie?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || contrat.contrat_statut === statusFilter
      const matchesCompany = companyFilter === "all" || contrat.contrat_compagnie === companyFilter

      return matchesSearch && matchesStatus && matchesCompany
    })
  }, [contrats, searchTerm, statusFilter, companyFilter])

  const getStatusColor = (statut: string | undefined) => {
    switch (statut?.toLowerCase() || "") {
      case "actif":
        return "bg-green-100 text-green-800"
      case "en attente":
        return "bg-yellow-100 text-yellow-800"
      case "résilié":
        return "bg-red-100 text-red-800"
      case "suspendu":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleContractSubmit = async (formData: FormData) => {
    try {
      const contractData = {
        contrat_produit: formData.get("contrat_produit") as string,
        contrat_compagnie: formData.get("contrat_compagnie") as string,
        contrat_statut: formData.get("contrat_statut") as string,
        prime_brute_annuelle: Number.parseFloat(formData.get("prime_brute_annuelle") as string) || 0,
        commissionnement_annee1: Number.parseFloat(formData.get("commissionnement_annee1") as string) || 0,
        projet_id: Number.parseInt(formData.get("projet_id") as string) || null,
      }

      if (isNewContract) {
        await supabase.from("contrats").insert([contractData])
      } else if (selectedContract) {
        await supabase.from("contrats").update(contractData).eq("id", selectedContract.id)
      }

      setIsDialogOpen(false)
      setSelectedContract(null)
      onContractUpdate()
    } catch (error) {
      console.error("Error saving contract:", error)
    }
  }

  const openNewContractDialog = () => {
    setSelectedContract(null)
    setIsNewContract(true)
    setIsDialogOpen(true)
  }

  const openEditContractDialog = (contract: Contrat) => {
    setSelectedContract(contract)
    setIsNewContract(false)
    setIsDialogOpen(true)
  }

  // Calculate totals
  const totals = useMemo(() => {
    const totalPrime = filteredContracts.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0)
    const totalCommission = filteredContracts.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0)
    return { totalPrime, totalCommission }
  }, [filteredContracts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Contrats</h2>
          <p className="text-muted-foreground">{filteredContracts.length} contrats trouvés</p>
        </div>
        <Button onClick={openNewContractDialog} className="bg-purple-600 hover:bg-purple-700">
          <i className="fas fa-plus mr-2"></i>
          Nouveau Contrat
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-euro-sign text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prime Totale</p>
                <p className="text-xl font-bold text-foreground">€{totals.totalPrime.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-percentage text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Totale</p>
                <p className="text-xl font-bold text-foreground">€{totals.totalCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-signature text-white"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contrats Actifs</p>
                <p className="text-xl font-bold text-foreground">
                  {filteredContracts.filter((c) => c.contrat_statut === "Actif").length}
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
                placeholder="Produit, compagnie..."
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
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Résilié">Résilié</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company">Compagnie</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les compagnies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCompanyFilter("all")
                }}
              >
                <i className="fas fa-times mr-2"></i>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Contrats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produit</th>
                  <th className="text-left p-2">Compagnie</th>
                  <th className="text-left p-2">Statut</th>
                  <th className="text-right p-2">Prime Annuelle</th>
                  <th className="text-right p-2">Commission</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{contract.contrat_produit}</td>
                    <td className="p-2">{contract.contrat_compagnie}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(contract.contrat_statut)}>{contract.contrat_statut}</Badge>
                    </td>
                    <td className="p-2 text-right font-semibold">
                      €{(contract.prime_brute_annuelle || 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-semibold text-green-600">
                      €{(contract.commissionnement_annee1 || 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(contract.contrat_date_creation).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button size="sm" variant="outline" onClick={() => openEditContractDialog(contract)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-eye"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNewContract ? "Nouveau Contrat" : "Modifier le Contrat"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleContractSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contrat_produit">Produit *</Label>
                <Input
                  id="contrat_produit"
                  name="contrat_produit"
                  defaultValue={selectedContract?.contrat_produit || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contrat_compagnie">Compagnie *</Label>
                <Input
                  id="contrat_compagnie"
                  name="contrat_compagnie"
                  defaultValue={selectedContract?.contrat_compagnie || ""}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contrat_statut">Statut</Label>
              <Select name="contrat_statut" defaultValue={selectedContract?.contrat_statut || "En attente"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Résilié">Résilié</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prime_brute_annuelle">Prime Brute Annuelle (€)</Label>
                <Input
                  id="prime_brute_annuelle"
                  name="prime_brute_annuelle"
                  type="number"
                  step="0.01"
                  defaultValue={selectedContract?.prime_brute_annuelle || ""}
                />
              </div>
              <div>
                <Label htmlFor="commissionnement_annee1">Commission Année 1 (€)</Label>
                <Input
                  id="commissionnement_annee1"
                  name="commissionnement_annee1"
                  type="number"
                  step="0.01"
                  defaultValue={selectedContract?.commissionnement_annee1 || ""}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="projet_id">Projet associé</Label>
              <Select name="projet_id" defaultValue={selectedContract?.projet_id?.toString() || "0"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Aucun projet</SelectItem>
                  {projets.map((projet) => (
                    <SelectItem key={projet.projet_id} value={(projet.projet_id ?? 0).toString()}>
                      {projet.type} - {projet.commercial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{isNewContract ? "Créer" : "Modifier"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
