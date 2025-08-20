"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ProjectEmailInterface } from "./ProjectEmailInterface"
import { NoResponseCampaign } from "./NoResponseCampaign"
import { supabase } from "../lib/supabase"
import { 
  Eye, Mail, Filter, AlertTriangle, Search, ChevronLeft, ChevronRight, 
  User, Building2, FileText, MessageCircle, TrendingUp, Euro, BarChart3,
  Users, Target, Award, Calendar, Globe, Facebook, Smartphone
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { BulkStatusEmailDialog } from "./BulkStatusEmailDialog"

interface Project {
  projet_id: number
  contact_id: number
  date_creation: string
  origine: string
  statut: string
  commercial: string
  contact?: {
    identifiant: number
    prenom: string
    nom: string
    email: string
    civilite: string
  }
  contrat?: {
    prime_brute_annuelle: number
    contrat_compagnie: string
  }
}

interface AnalyticsData {
  totalProjects: number
  conversionRate: number
  totalRevenue: number
  avgDealSize: number
  commercialStats: Array<{
    commercial: string
    projects: number
    contracts: number
    conversionRate: number
    revenue: number
  }>
  originStats: Array<{
    origine: string
    projects: number
    contracts: number
    revenue: number
    conversionRate: number
  }>
  companyStats: Array<{
    compagnie: string
    contracts: number
    revenue: number
    avgDealSize: number
  }>
}

export function ProjectsTab() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [originFilter, setOriginFilter] = useState("all")
  const [commercialFilter, setCommercialFilter] = useState("all")
  const [distinctStatuses, setDistinctStatuses] = useState<string[]>([])
  const [distinctOrigins, setDistinctOrigins] = useState<string[]>([])
  const [distinctCommercials, setDistinctCommercials] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  useEffect(() => {
    loadProjects()
    loadFilters()
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      calculateAnalytics()
    }
  }, [projects])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("projets")
        .select(`
          *,
          contact:contact_id (
            identifiant,
            prenom,
            nom,
            email,
            civilite
          ),
          contrat:projet_id (
            prime_brute_annuelle,
            contrat_compagnie
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFilters = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("statut, origine, commercial")
        .not("statut", "is", null)
        .not("origine", "is", null)
        .not("commercial", "is", null)

      if (error) throw error
      
      const statuses = [...new Set(data?.map(p => p.statut).filter(Boolean))] as string[]
      const origins = [...new Set(data?.map(p => p.origine).filter(Boolean))] as string[]
      const commercials = [...new Set(data?.map(p => p.commercial).filter(Boolean))] as string[]
      
      setDistinctStatuses(statuses.sort())
      setDistinctOrigins(origins.sort())
      setDistinctCommercials(commercials.sort())
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const calculateAnalytics = async () => {
    try {
      // Récupérer les contrats pour calculer les revenus
      const { data: contracts, error } = await supabase
        .from("contrats")
        .select("projet_id, prime_brute_annuelle, contrat_compagnie")

      if (error) throw error

      const projectsWithContracts = projects.map(project => ({
        ...project,
        hasContract: contracts?.some(c => c.projet_id === project.projet_id),
        contractData: contracts?.find(c => c.projet_id === project.projet_id)
      }))

      const totalProjects = projects.length
      const totalContracts = contracts?.length || 0
      const conversionRate = totalProjects > 0 ? (totalContracts / totalProjects) * 100 : 0
      const totalRevenue = contracts?.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) || 0
      const avgDealSize = totalContracts > 0 ? totalRevenue / totalContracts : 0

      // Analyse par commercial
      const commercialStats = distinctCommercials.map(commercial => {
        const commercialProjects = projectsWithContracts.filter(p => p.commercial === commercial)
        const commercialContracts = commercialProjects.filter(p => p.hasContract)
        const commercialRevenue = commercialProjects
          .filter(p => p.contractData)
          .reduce((sum, p) => sum + (p.contractData?.prime_brute_annuelle || 0), 0)

        return {
          commercial,
          projects: commercialProjects.length,
          contracts: commercialContracts.length,
          conversionRate: commercialProjects.length > 0 ? (commercialContracts.length / commercialProjects.length) * 100 : 0,
          revenue: commercialRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue)

      // Analyse par origine
      const originStats = distinctOrigins.map(origine => {
        const originProjects = projectsWithContracts.filter(p => p.origine === origine)
        const originContracts = originProjects.filter(p => p.hasContract)
        const originRevenue = originProjects
          .filter(p => p.contractData)
          .reduce((sum, p) => sum + (p.contractData?.prime_brute_annuelle || 0), 0)

        return {
          origine,
          projects: originProjects.length,
          contracts: originContracts.length,
          conversionRate: originProjects.length > 0 ? (originContracts.length / originProjects.length) * 100 : 0,
          revenue: originRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue)

      // Analyse par compagnie d'assurance
      const companyGroups = contracts?.reduce((acc: any, contract) => {
        if (contract.contrat_compagnie) {
          if (!acc[contract.contrat_compagnie]) {
            acc[contract.contrat_compagnie] = []
          }
          acc[contract.contrat_compagnie].push(contract)
        }
        return acc
      }, {}) || {}

      const companyStats = Object.entries(companyGroups).map(([compagnie, contractList]: [string, any]) => ({
        compagnie,
        contracts: contractList.length,
        revenue: contractList.reduce((sum: number, c: any) => sum + (c.prime_brute_annuelle || 0), 0),
        avgDealSize: contractList.length > 0 ? contractList.reduce((sum: number, c: any) => sum + (c.prime_brute_annuelle || 0), 0) / contractList.length : 0
      })).sort((a, b) => b.revenue - a.revenue)

      setAnalytics({
        totalProjects,
        conversionRate,
        totalRevenue,
        avgDealSize,
        commercialStats,
        originStats,
        companyStats
      })
    } catch (error) {
      console.error("Error calculating analytics:", error)
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = !searchTerm || 
        project.contact?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.contact?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.origine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projet_id.toString().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || 
        project.statut?.toLowerCase().includes(statusFilter.toLowerCase())

      const matchesOrigin = originFilter === "all" ||
        project.origine === originFilter

      const matchesCommercial = commercialFilter === "all" ||
        project.commercial === commercialFilter

      return matchesSearch && matchesStatus && matchesOrigin && matchesCommercial
    })
  }, [projects, searchTerm, statusFilter, originFilter, commercialFilter])
  
  const bulkRecipients = useMemo(() => (
    filteredProjects
      .filter(p => !!p.contact?.email)
      .map(p => ({
        projectId: p.projet_id,
        contactId: p.contact?.identifiant,
        email: p.contact!.email!,
        prenom: p.contact?.prenom,
        nom: p.contact?.nom,
        civilite: p.contact?.civilite,
      }))
  ), [filteredProjects])
  
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  const stats = useMemo(() => {
    const total = projects.length
    const noResponse = projects.filter(p => 
      p.statut?.toLowerCase().includes("ne repond pas") || 
      p.statut?.toLowerCase().includes("ne répond pas")
    ).length
    const withEmail = projects.filter(p => p.contact?.email).length
    const devisEnvoye = projects.filter(p => 
      p.statut?.toLowerCase().includes("devis envoyé")
    ).length
    const contratsSignes = projects.filter(p => 
      p.statut?.toLowerCase().includes("contrat")
    ).length

    return {
      total,
      noResponse,
      withEmail,
      devisEnvoye,
      contratsSignes,
      noResponsePercentage: total > 0 ? Math.round((noResponse / total) * 100) : 0
    }
  }, [projects])

  const getStatusColor = (statut: string) => {
    const statusLower = statut?.toLowerCase()
    switch (true) {
      case statusLower?.includes("ne repond pas") || statusLower?.includes("ne répond pas"):
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case statusLower?.includes("en cours"):
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case statusLower?.includes("devis envoyé"):
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case statusLower?.includes("contrat"):
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getOriginIcon = (origine: string) => {
    const originLower = origine?.toLowerCase()
    if (originLower?.includes("facebook") || originLower?.includes("fb")) return Facebook
    if (originLower?.includes("tiktok")) return Smartphone
    if (originLower?.includes("premunia")) return Globe
    return Target
  }

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.projet_id}`)
  }

  const openProjectDialog = (project: Project) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et sous-titre */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Projets</h2>
        <p className="text-gray-600 mt-2">Suivez tous vos projets clients</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="text-sm text-muted-foreground">Total Projets</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">{stats.noResponse}</div>
            </div>
            <div className="text-sm text-muted-foreground">Ne Répondent Pas</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FileText className="w-6 h-6 text-yellow-600" />
              <div className="text-3xl font-bold text-yellow-600">{stats.devisEnvoye}</div>
            </div>
            <div className="text-sm text-muted-foreground">Devis Envoyé</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{stats.contratsSignes}</div>
            </div>
            <div className="text-sm text-muted-foreground">Contrats Signés</div>
          </CardContent>
        </Card>
      </div>

      {/* Campagne Non-Répondeurs */}
      {stats.noResponse > 0 && (
        <NoResponseCampaign />
      )}

      {/* Analytics approfondies */}
      {analytics && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="commercials" className="rounded-xl">Commerciaux</TabsTrigger>
            <TabsTrigger value="origins" className="rounded-xl">Origines</TabsTrigger>
            <TabsTrigger value="companies" className="rounded-xl">Compagnies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taux de Conversion Global</div>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <Euro className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    €{analytics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Chiffre d'Affaires Total</div>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    €{analytics.avgDealSize.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Ticket Moyen</div>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-600">
                    {analytics.commercialStats.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Commerciaux Actifs</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commercials" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Performance par Commercial</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.commercialStats.map((commercial, index) => (
                    <div key={commercial.commercial} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{commercial.commercial}</div>
                          <div className="text-sm text-muted-foreground">
                            {commercial.projects} projets • {commercial.contracts} contrats
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">€{commercial.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {commercial.conversionRate.toFixed(1)}% conversion
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="origins" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Performance par Origine</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.originStats.map((origin) => {
                    const OriginIcon = getOriginIcon(origin.origine)
                    return (
                      <Card key={origin.origine} className="rounded-xl border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <OriginIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">{origin.origine}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Projets:</span>
                              <span className="font-semibold">{origin.projects}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Contrats:</span>
                              <span className="font-semibold text-green-600">{origin.contracts}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Conversion:</span>
                              <span className="font-semibold text-blue-600">{origin.conversionRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>CA:</span>
                              <span className="font-semibold text-purple-600">€{origin.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Performance par Compagnie d'Assurance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.companyStats.map((company, index) => (
                    <div key={company.compagnie} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{company.compagnie}</div>
                          <div className="text-sm text-muted-foreground">
                            {company.contracts} contrats
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">€{company.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          €{company.avgDealSize.toLocaleString()} moy.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Filtres et recherche */}
      <Card className="rounded-2xl border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 rounded-xl"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {distinctStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={originFilter} onValueChange={(value) => {
              setOriginFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Toutes origines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les origines</SelectItem>
                {distinctOrigins.map(origin => (
                  <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={commercialFilter} onValueChange={(value) => {
              setCommercialFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Tous commerciaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les commerciaux</SelectItem>
                {distinctCommercials.map(commercial => (
                  <SelectItem key={commercial} value={commercial}>{commercial}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setOriginFilter("all")
                  setCommercialFilter("all")
                  setCurrentPage(1)
                }}
                className="flex items-center space-x-2 rounded-xl"
              >
                <Filter className="w-4 h-4" />
                <span>Réinitialiser</span>
              </Button>
              <Button
                onClick={() => setIsBulkOpen(true)}
                disabled={statusFilter === "all" || bulkRecipients.length === 0}
                className="rounded-xl"
              >
                Envoyer email (statut {statusFilter === "all" ? "—" : statusFilter}) • {bulkRecipients.length}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Projets ({filteredProjects.length})</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Liste de tous les projets en cours et passés
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Client</th>
                  <th className="text-left p-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-900">Commercial</th>
                  <th className="text-left p-4 font-medium text-gray-900">Origine</th>
                  <th className="text-left p-4 font-medium text-gray-900">Date de création</th>
                  <th className="text-center p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProjects.map((project) => {
                  const OriginIcon = getOriginIcon(project.origine)
                  return (
                    <tr key={project.projet_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {project.contact?.prenom?.[0]}{project.contact?.nom?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {project.contact?.prenom} {project.contact?.nom}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              {project.contact?.email ? (
                                <>
                                  <Mail className="w-3 h-3 text-green-500" />
                                  <span className="truncate max-w-[200px]">{project.contact.email}</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                                  <span>Pas d'email</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(project.statut)} rounded-full px-3 py-1`}>
                          {project.statut}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{project.commercial}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <OriginIcon className="w-4 h-4 text-blue-600" />
                          <span>{project.origine}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(project.date_creation).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleProjectClick(project)}
                            className="rounded-xl"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir détails
                          </Button>
                          {project.contact?.email && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openProjectDialog(project)
                              }}
                              className="rounded-xl"
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} • {filteredProjects.length} projets
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                const isCurrentPage = page === currentPage
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="rounded-xl w-10"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog communication email */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Communication - Projet #{selectedProject?.projet_id}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectEmailInterface projectId={selectedProject.projet_id} />
          )}
        </DialogContent>
      </Dialog>
      <BulkStatusEmailDialog
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        recipients={bulkRecipients}
        statusName={statusFilter}
        onComplete={loadProjects}
      />
    </div>
  )
}

