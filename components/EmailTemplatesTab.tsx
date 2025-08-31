import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import type { EmailTemplate } from '../lib/types'
import { Plus, Mail, Eye, Brain, Copy, Edit, Trash2, FileText, Zap } from 'lucide-react'

interface EmailTemplatesTabProps {
  templates: EmailTemplate[]
  onTemplateUpdate: () => void
}

export function EmailTemplatesTab({ templates, onTemplateUpdate }: EmailTemplatesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const { toast } = useToast()

  const [newTemplate, setNewTemplate] = useState({
    nom: '',
    sujet: '',
    contenu_html: '',
    contenu_texte: '',
    categorie: 'prospection',
    statut: 'active',
    variables: {
      nom_client: 'Nom complet du client',
      prenom: 'Prénom du client',
      nom: 'Nom de famille du client',
      nom_commercial: 'Nom du commercial assigné',
      lien_rdv: 'Lien de prise de rendez-vous',
      infos_premunia: 'Informations de contact Premunia'
    }
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.sujet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || template.categorie === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTemplate = async () => {
    try {
      if (isEditMode && selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(newTemplate)
          .eq('id', selectedTemplate.id)
        
        if (error) throw error
        
        toast({
          title: "Template modifié",
          description: "Le template a été modifié avec succès.",
        })
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([newTemplate])

        if (error) throw error

        toast({
          title: "Template créé",
          description: "Le nouveau template a été créé avec succès.",
        })
      }

      setIsCreateDialogOpen(false)
      setIsEditMode(false)
      setSelectedTemplate(null)
      resetForm()
      onTemplateUpdate()
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setNewTemplate({
      nom: '',
      sujet: '',
      contenu_html: '',
      contenu_texte: '',
      categorie: 'prospection',
      statut: 'active',
      variables: {
        nom_client: 'Nom complet du client',
        prenom: 'Prénom du client',
        nom: 'Nom de famille du client',
        nom_commercial: 'Nom du commercial assigné',
        lien_rdv: 'Lien de prise de rendez-vous',
        infos_premunia: 'Informations de contact Premunia'
      }
    })
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setNewTemplate({
      nom: template.nom,
      sujet: template.sujet,
      contenu_html: template.contenu_html,
      contenu_texte: template.contenu_texte || '',
      categorie: template.categorie || 'prospection',
      statut: template.statut || 'active',
      variables: (template.variables as unknown as {
        nom_client: string
        prenom: string
        nom: string
        nom_commercial: string
        lien_rdv: string
        infos_premunia: string
      }) || {
        nom_client: 'Nom complet du client',
        prenom: 'Prénom du client',
        nom: 'Nom de famille du client',
        nom_commercial: 'Nom du commercial assigné',
        lien_rdv: 'Lien de prise de rendez-vous',
        infos_premunia: 'Informations de contact Premunia'
      }
    })
    setIsEditMode(true)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId)
      
      if (error) throw error
      
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      })
      
      onTemplateUpdate()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template.",
        variant: "destructive"
      })
    }
  }

  const generateAITemplates = async () => {
    setIsGeneratingAI(true)
    try {
      const aiTemplates = [
        {
          nom: "Relance Assurance Santé Seniors - Premunia IA",
          sujet: "{{nom_client}}, votre assurance santé seniors vous attend - Premunia",
          contenu_html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Premunia</h1>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Votre courtier en assurance santé spécialisé seniors</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px; background: white; border: 1px solid #e0e0e0; border-top: none;">
                <p style="margin: 0 0 24px 0; font-size: 18px; font-weight: 500;">Bonjour {{nom_client}},</p>
                
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7;">Nous avons remarqué que vous n'avez pas encore répondu à notre proposition d'assurance santé adaptée aux seniors.</p>
                
                <div style="background: #f8f9ff; padding: 24px; border-radius: 8px; margin: 24px 0;">
                  <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px;">🎯 Pourquoi nous contacter maintenant ?</h3>
                  
                  <div style="margin: 20px 0;">
                    <div style="margin: 12px 0; padding: 8px 0; border-left: 3px solid #28a745; padding-left: 15px;">
                      <strong style="color: #28a745;">✅ Devis gratuit et sans engagement</strong>
                    </div>
                    <div style="margin: 12px 0; padding: 8px 0; border-left: 3px solid #28a745; padding-left: 15px;">
                      <strong style="color: #28a745;">✅ Garanties complémentaires santé optimisées</strong>
                    </div>
                    <div style="margin: 12px 0; padding: 8px 0; border-left: 3px solid #28a745; padding-left: 15px;">
                      <strong style="color: #28a745;">✅ Accompagnement personnalisé par {{nom_commercial}}</strong>
                    </div>
                    <div style="margin: 12px 0; padding: 8px 0; border-left: 3px solid #28a745; padding-left: 15px;">
                      <strong style="color: #28a745;">✅ Économies significatives sur vos frais de santé</strong>
                    </div>
                  </div>
                </div>
                
                <p style="margin: 24px 0; font-size: 16px; line-height: 1.7;">En tant que courtier spécialisé seniors, nous comprenons parfaitement vos besoins spécifiques et vous proposons des solutions sur-mesure.</p>
                
                <!-- Call to Action -->
                <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px;">
                  <p style="font-size: 20px; color: white; margin: 0 0 15px 0; font-weight: 600;">📞 Contactez-nous maintenant</p>
                  <p style="font-size: 18px; color: white; margin: 0 0 20px 0; font-weight: 500;">01 23 45 67 89</p>
                  <a href="{{lien_rdv}}" style="display: inline-block; background: white; color: #f5576c; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; margin: 10px 0;">
                    🗓️ Réserver un rendez-vous
                  </a>
                  <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 14px;">Ou répondez à cet email pour un rappel immédiat</p>
                </div>
                
                <p style="margin: 30px 0 10px 0; font-size: 16px;">Cordialement,</p>
                <p style="margin: 0; font-size: 16px;"><strong>{{nom_commercial}}</strong><br>
                <em>Votre courtier en assurance santé Premunia</em></p>
              </div>
              
              <!-- Footer -->
              <div style="background: #2c3e50; color: white; padding: 30px; border-radius: 0 0 12px 12px;">
                <div style="text-align: center;">
                  <h4 style="color: #ecf0f1; margin: 0 0 20px 0; font-size: 18px;">📞 Informations de contact</h4>
                  {{infos_premunia}}
                  
                  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #34495e; font-size: 12px; color: #95a5a6;">
                    <p style="margin: 0;"><strong>Premunia</strong> - Votre courtier en assurance santé spécialisé seniors</p>
                    <p style="margin: 5px 0 0 0;">Cet email vous est envoyé dans le cadre de votre demande de devis d'assurance santé.</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          contenu_texte: `
Bonjour {{nom_client}},

Nous avons remarqué que vous n'avez pas encore répondu à notre proposition d'assurance santé adaptée aux seniors.

🎯 POURQUOI NOUS CONTACTER MAINTENANT ?

✅ Devis gratuit et sans engagement
✅ Garanties complémentaires santé optimisées  
✅ Accompagnement personnalisé par {{nom_commercial}}
✅ Économies significatives sur vos frais de santé

En tant que courtier spécialisé seniors, nous comprenons parfaitement vos besoins spécifiques et vous proposons des solutions sur-mesure.

📞 CONTACTEZ-NOUS MAINTENANT : 01 23 45 67 89

🗓️ Réserver un rendez-vous : {{lien_rdv}}
Ou répondez à cet email pour un rappel immédiat.

Cordialement,
{{nom_commercial}}
Votre courtier en assurance santé Premunia

{{infos_premunia}}

PREMUNIA - Votre courtier en assurance santé spécialisé seniors
Cet email vous est envoyé dans le cadre de votre demande de devis d'assurance santé.
          `,
          categorie: 'relance',
          statut: 'active',
          variables: {
            nom_client: 'Nom complet du client',
            prenom: 'Prénom du client',
            nom: 'Nom de famille du client',
            nom_commercial: 'Nom du commercial assigné',
            lien_rdv: 'Lien de prise de rendez-vous',
            infos_premunia: 'Informations de contact Premunia'
          }
        },
        {
          nom: "Prospection Initiale - Premunia Pro",
          sujet: "{{prenom}}, découvrez les avantages d'une mutuelle seniors adaptée",
          contenu_html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
              <div style="background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%); padding: 25px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">💡 Une mutuelle seniors qui vous ressemble</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Premunia - Solutions santé personnalisées</p>
              </div>
              
              <div style="padding: 30px; background: white;">
                <p style="font-size: 18px; margin: 0 0 20px 0;">Bonjour {{prenom}},</p>
                
                <p>Avez-vous pensé à optimiser votre couverture santé en tant que senior ?</p>
                
                <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔍 Analyse gratuite de vos besoins</h3>
                  <p style="margin: 0;">Nous analysons gratuitement votre situation actuelle et vous proposons des solutions adaptées à votre profil senior.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{lien_rdv}}" style="background: #4facfe; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; display: inline-block;">
                    📅 Réserver mon analyse gratuite
                  </a>
                </div>
                
                <p>Très bonne journée,<br><strong>{{nom_commercial}}</strong></p>
              </div>
              
              <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
                {{infos_premunia}}
              </div>
            </div>
          `,
          contenu_texte: `
Bonjour {{prenom}},

Avez-vous pensé à optimiser votre couverture santé en tant que senior ?

🔍 ANALYSE GRATUITE DE VOS BESOINS

Nous analysons gratuitement votre situation actuelle et vous proposons des solutions adaptées à votre profil senior.

📅 Réserver mon analyse gratuite : {{lien_rdv}}

Très bonne journée,
{{nom_commercial}}

{{infos_premunia}}
          `,
          categorie: 'prospection',
          statut: 'active',
          variables: {
            nom_client: 'Nom complet du client',
            prenom: 'Prénom du client',
            nom: 'Nom de famille du client',
            nom_commercial: 'Nom du commercial assigné',
            lien_rdv: 'Lien de prise de rendez-vous',
            infos_premunia: 'Informations de contact Premunia'
          }
        }
      ]

      for (const template of aiTemplates) {
        await supabase.from('email_templates').insert([template])
      }

      toast({
        title: "Templates IA Premunia générés",
        description: `${aiTemplates.length} templates intelligents créés avec variables dynamiques.`,
      })

      onTemplateUpdate()
    } catch (error) {
      console.error('Error generating AI templates:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer les templates IA.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        nom: `${template.nom} (copie)`,
        statut: 'draft'
      }
      delete duplicatedTemplate.id
      delete duplicatedTemplate.created_at
      delete duplicatedTemplate.updated_at

      const { error } = await supabase
        .from('email_templates')
        .insert([duplicatedTemplate])

      if (error) throw error

      toast({
        title: "Template dupliqué",
        description: "Une copie du template a été créée.",
      })

      onTemplateUpdate()
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le template.",
        variant: "destructive"
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      prospection: 'bg-blue-500',
      relance: 'bg-orange-500',
      onboarding: 'bg-green-500',
      newsletter: 'bg-purple-500',
      promotion: 'bg-red-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates Email</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos modèles d'emails avec variables dynamiques Brevo
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={generateAITemplates}
            disabled={isGeneratingAI}
            variant="outline"
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            {isGeneratingAI ? 'Génération...' : 'Templates IA Premunia'}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher un template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="prospection">Prospection</SelectItem>
                <SelectItem value="relance">Relance</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variables Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Zap className="h-5 w-5" />
            Variables Dynamiques Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{nom_client}}'}</code>
              <span className="text-muted-foreground">Nom complet</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{prenom}}'}</code>
              <span className="text-muted-foreground">Prénom</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{nom}}'}</code>
              <span className="text-muted-foreground">Nom</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{nom_commercial}}'}</code>
              <span className="text-muted-foreground">Commercial</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{lien_rdv}}'}</code>
              <span className="text-muted-foreground">Lien RDV</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-xs">{'{{infos_premunia}}'}</code>
              <span className="text-muted-foreground">Contact Premunia</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {template.nom}
                  </CardTitle>
                  <div className="flex gap-2 mt-3">
                    <Badge className={`${getCategoryColor(template.categorie || '')} text-white`}>
                      {template.categorie}
                    </Badge>
                    <Badge variant={template.statut === 'active' ? 'default' : 'secondary'}>
                      {template.statut === 'active' ? 'Actif' : 'Brouillon'}
                    </Badge>
                    {template.variables && Object.keys(template.variables).length > 0 && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Zap className="h-3 w-3 mr-1" />
                        Variables
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-medium">Sujet</div>
                  <div className="text-sm line-clamp-2 bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                    {template.sujet}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-muted-foreground">
                    Créé le {new Date(template.created_at || '').toLocaleDateString('fr-FR')}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreview(template)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      className="h-8 w-8 p-0 hover:bg-green-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="h-8 w-8 p-0 hover:bg-yellow-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditMode ? 'Modifier le template' : 'Créer un nouveau template'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nom du template</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.nom}
                    onChange={(e) => setNewTemplate({...newTemplate, nom: e.target.value})}
                    placeholder="Ex: Email de prospection seniors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-category">Catégorie</Label>
                  <Select 
                    value={newTemplate.categorie} 
                    onValueChange={(value) => setNewTemplate({...newTemplate, categorie: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospection">Prospection</SelectItem>
                      <SelectItem value="relance">Relance</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-subject">Sujet de l'email</Label>
                <Input
                  id="template-subject"
                  value={newTemplate.sujet}
                  onChange={(e) => setNewTemplate({...newTemplate, sujet: e.target.value})}
                  placeholder="Ex: {{nom_client}}, votre devis mutuelle seniors"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="template-html">Contenu HTML</Label>
                <Textarea
                  id="template-html"
                  value={newTemplate.contenu_html}
                  onChange={(e) => setNewTemplate({...newTemplate, contenu_html: e.target.value})}
                  placeholder="Contenu HTML avec variables {{nom_client}}, {{prenom}}, etc."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-text">Contenu Texte (optionnel)</Label>
                <Textarea
                  id="template-text"
                  value={newTemplate.contenu_texte}
                  onChange={(e) => setNewTemplate({...newTemplate, contenu_texte: e.target.value})}
                  placeholder="Version texte de l'email"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4 mt-6">
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <h4 className="font-medium mb-3">Aperçu du template :</h4>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: newTemplate.contenu_html.replace(/{{(\w+)}}/g, '<span class="bg-yellow-200 px-1 rounded">$1</span>') 
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              resetForm()
              setIsEditMode(false)
              setSelectedTemplate(null)
            }}>
              Annuler
            </Button>
            <Button onClick={handleCreateTemplate}>
              {isEditMode ? 'Modifier' : 'Créer'} le template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu - {selectedTemplate?.nom}</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Sujet:</strong> {selectedTemplate.sujet}</div>
                <div><strong>Catégorie:</strong> {selectedTemplate.categorie}</div>
              </div>
              
              <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate.contenu_html.replace(/{{(\w+)}}/g, '<span class="bg-yellow-200 px-1 rounded font-semibold">$1</span>') 
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}