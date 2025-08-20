import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import { Copy, Eye, Edit, Trash2, Plus, Mail, User, Phone, Globe } from 'lucide-react'

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte?: string
  variables?: Record<string, any>
  categorie?: string
  statut?: string
  created_at?: string
  updated_at?: string
}

interface EmailTemplateAdvancedProps {
  templates: EmailTemplate[]
  onTemplateUpdate: () => void
}

export function EmailTemplateAdvanced({ templates, onTemplateUpdate }: EmailTemplateAdvancedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isNewTemplate, setIsNewTemplate] = useState(false)
  const { toast } = useToast()

  // Default template data with commercial signature
  const [templateData, setTemplateData] = useState({
    nom: '',
    sujet: '',
    contenu_html: '',
    contenu_texte: '',
    categorie: 'relance',
    statut: 'actif'
  })

  // Improved template library with commercial signatures
  const templateLibrary = [
    {
      nom: "Première relance prospect",
      sujet: "Suite à votre demande d'information",
      categorie: "relance",
      contenu_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Premunia</h1>
    <p style="color: #e2e8f0; margin: 10px 0 0 0;">Votre partenaire de confiance</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">Bonjour {{prenom}},</p>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
      Je reviens vers vous suite à votre demande d'information concernant nos services.
    </p>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
      Chez Premunia, nous comprenons que chaque situation est unique. C'est pourquoi nous proposons des solutions personnalisées adaptées à vos besoins spécifiques.
    </p>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #2d3748; margin-top: 0;">Prochaines étapes :</h3>
      <ul style="color: #4a5568; line-height: 1.6;">
        <li>Analyse gratuite de vos besoins</li>
        <li>Proposition personnalisée sous 48h</li>
        <li>Accompagnement dédié</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{lien_rdv}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Prendre rendez-vous
      </a>
    </div>
    
    <p style="color: #4a5568; line-height: 1.6;">
      Je reste à votre disposition pour toute question.
    </p>
  </div>
  
  <div style="background: #2d3748; padding: 30px; color: white;">
    <div style="border-bottom: 1px solid #4a5568; padding-bottom: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #667eea;">{{commercial_nom}}</h3>
      <p style="margin: 0; color: #a0aec0;">Conseiller commercial Premunia</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>📞</strong> 01 23 45 67 89</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>✉️</strong> {{commercial_email}}</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>🌐</strong> www.premunia.com</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">PREMUNIA</p>
        <p style="margin: 0; font-size: 12px; color: #a0aec0;">Excellence & Confiance</p>
      </div>
    </div>
  </div>
</div>`
    },
    {
      nom: "Relance après devis",
      sujet: "Votre devis Premunia - {{prenom}}",
      categorie: "relance",
      contenu_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Premunia</h1>
    <p style="color: #d1fae5; margin: 10px 0 0 0;">Votre devis personnalisé</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">Bonjour {{prenom}},</p>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
      J'espère que vous avez pu prendre connaissance du devis que je vous ai transmis le {{date_devis}}.
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
      <h3 style="color: #059669; margin-top: 0;">Rappel de votre devis :</h3>
      <p style="color: #166534; margin: 0;">Référence : {{ref_devis}}</p>
      <p style="color: #166534; margin: 5px 0 0 0;">Montant : {{montant_devis}}€</p>
    </div>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
      Avez-vous des questions concernant cette proposition ? Je serais ravi d'échanger avec vous pour adapter notre offre si nécessaire.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{lien_rdv}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 15px;">
        Discuter du devis
      </a>
      <a href="{{lien_acceptation}}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Accepter le devis
      </a>
    </div>
  </div>
  
  <div style="background: #2d3748; padding: 30px; color: white;">
    <div style="border-bottom: 1px solid #4a5568; padding-bottom: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #10b981;">{{commercial_nom}}</h3>
      <p style="margin: 0; color: #a0aec0;">Conseiller commercial Premunia</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>📞</strong> 01 23 45 67 89</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>✉️</strong> {{commercial_email}}</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>🌐</strong> www.premunia.com</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">PREMUNIA</p>
        <p style="margin: 0; font-size: 12px; color: #a0aec0;">Excellence & Confiance</p>
      </div>
    </div>
  </div>
</div>`
    },
    {
      nom: "Bienvenue nouveau client",
      sujet: "Bienvenue chez Premunia, {{prenom}} !",
      categorie: "onboarding",
      contenu_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue chez Premunia !</h1>
    <p style="color: #e9d5ff; margin: 10px 0 0 0;">Merci de nous faire confiance</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">Bonjour {{prenom}},</p>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
      Félicitations ! Votre contrat a été finalisé avec succès. Bienvenue dans la famille Premunia !
    </p>
    
    <div style="background: #faf5ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
      <h3 style="color: #7c3aed; margin-top: 0;">🎯 Votre contrat est actif</h3>
      <p style="color: #6b46c1; margin: 10px 0 0 0; font-size: 14px;">
        Référence : {{numero_contrat}}<br>
        Date d'effet : {{date_effet}}
      </p>
    </div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">Prochaines étapes :</h3>
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <ul style="color: #4a5568; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Réception de vos documents contractuels sous 24h</li>
        <li>Activation de votre espace client en ligne</li>
        <li>Contact de notre équipe support dédiée</li>
        <li>Rendez-vous de suivi dans 30 jours</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{lien_espace_client}}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 15px;">
        Accéder à mon espace
      </a>
      <a href="{{lien_support}}" style="background: #6b46c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Contacter le support
      </a>
    </div>
    
    <p style="color: #4a5568; line-height: 1.6;">
      Je reste votre interlocuteur privilégié pour tout besoin complémentaire.
    </p>
  </div>
  
  <div style="background: #2d3748; padding: 30px; color: white;">
    <div style="border-bottom: 1px solid #4a5568; padding-bottom: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #8b5cf6;">{{commercial_nom}}</h3>
      <p style="margin: 0; color: #a0aec0;">Votre conseiller dédié Premunia</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>📞</strong> 01 23 45 67 89</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>✉️</strong> {{commercial_email}}</p>
        <p style="margin: 5px 0; color: #a0aec0;"><strong>🌐</strong> www.premunia.com</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #8b5cf6;">PREMUNIA</p>
        <p style="margin: 0; font-size: 12px; color: #a0aec0;">Excellence & Confiance</p>
      </div>
    </div>
  </div>
</div>`
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.sujet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.categorie === categoryFilter
    return matchesSearch && matchesCategory
  })

  const previewTemplate = (template: EmailTemplate) => {
    // Replace variables with sample data for preview
    let previewHtml = template.contenu_html
    const sampleData = {
      prenom: 'Jean',
      nom: 'Dupont',
      commercial_nom: 'Marie Martin',
      commercial_email: 'marie.martin@premunia.com',
      date_devis: '15/12/2024',
      ref_devis: 'DEV-2024-001',
      montant_devis: '2 850',
      numero_contrat: 'CNT-2024-001',
      date_effet: '01/01/2025',
      lien_rdv: '#',
      lien_acceptation: '#',
      lien_espace_client: '#',
      lien_support: '#'
    }

    Object.entries(sampleData).forEach(([key, value]) => {
      previewHtml = previewHtml.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    return previewHtml
  }

  const generateTemplateFromLibrary = async (libraryTemplate: any) => {
    try {
      const templateData = {
        ...libraryTemplate,
        variables: {
          prenom: 'Prénom du contact',
          nom: 'Nom du contact',
          commercial_nom: 'Nom du commercial',
          commercial_email: 'Email du commercial',
          lien_rdv: 'Lien de prise de RDV'
        },
        statut: 'actif',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('email_templates')
        .insert([templateData])

      if (error) throw error

      toast({
        title: "Template généré",
        description: `Le template "${libraryTemplate.nom}" a été ajouté avec succès.`,
      })

      onTemplateUpdate()
    } catch (error) {
      console.error('Error generating template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le template.",
        variant: "destructive"
      })
    }
  }

  const availableVariables = [
    { key: 'prenom', description: 'Prénom du contact' },
    { key: 'nom', description: 'Nom du contact' },
    { key: 'commercial_nom', description: 'Nom du commercial' },
    { key: 'commercial_email', description: 'Email du commercial' },
    { key: 'entreprise', description: 'Nom de l\'entreprise' },
    { key: 'lien_rdv', description: 'Lien de prise de RDV' },
    { key: 'date_devis', description: 'Date du devis' },
    { key: 'ref_devis', description: 'Référence du devis' },
    { key: 'montant_devis', description: 'Montant du devis' },
    { key: 'numero_contrat', description: 'Numéro de contrat' },
    { key: 'date_effet', description: 'Date d\'effet' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates Email Avancés</h2>
          <p className="text-muted-foreground">
            {filteredTemplates.length} templates disponibles
          </p>
        </div>
        <Button onClick={() => {
          setSelectedTemplate(null)
          setIsNewTemplate(true)
          setIsDialogOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="relance">Relance</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="suivi">Suivi</SelectItem>
            <SelectItem value="information">Information</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Library Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Bibliothèque de Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {templateLibrary.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <h4 className="font-medium">{template.nom}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.sujet}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateTemplateFromLibrary(template)}
                  className="w-full"
                >
                  Utiliser ce template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.sujet}</p>
                </div>
                <Badge variant={template.statut === 'actif' ? 'default' : 'secondary'}>
                  {template.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{template.categorie}</Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsPreviewOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsNewTemplate(false)
                      setTemplateData({
                        nom: template.nom,
                        sujet: template.sujet,
                        contenu_html: template.contenu_html,
                        contenu_texte: template.contenu_texte || '',
                        categorie: template.categorie || 'relance',
                        statut: template.statut || 'actif'
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(template.contenu_html)
                      toast({
                        title: "Template copié",
                        description: "Le contenu HTML a été copié dans le presse-papier.",
                      })
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewTemplate ? 'Nouveau Template' : 'Modifier Template'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom du template</Label>
                  <Input
                    id="nom"
                    value={templateData.nom}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, nom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sujet">Sujet de l'email</Label>
                  <Input
                    id="sujet"
                    value={templateData.sujet}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, sujet: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contenu_html">Contenu HTML</Label>
                <Textarea
                  id="contenu_html"
                  value={templateData.contenu_html}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, contenu_html: e.target.value }))}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Variables disponibles</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Utilisez ces variables dans vos templates avec la syntaxe {`{{variable}}`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {availableVariables.map((variable) => (
                    <div key={variable.key} className="flex justify-between p-2 bg-white rounded">
                      <code>{`{{${variable.key}}}`}</code>
                      <span className="text-muted-foreground">{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                    value={templateData.categorie}
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, categorie: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relance">Relance</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="suivi">Suivi</SelectItem>
                      <SelectItem value="information">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={templateData.statut}
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, statut: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button>
              {isNewTemplate ? 'Créer' : 'Mettre à jour'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium">{selectedTemplate.nom}</h3>
                <p className="text-sm text-muted-foreground">Sujet: {selectedTemplate.sujet}</p>
              </div>
              
              <div 
                className="border rounded-lg p-4 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewTemplate(selectedTemplate) }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}