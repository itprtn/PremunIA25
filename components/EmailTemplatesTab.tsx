import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import type { EmailTemplate, Segment } from '../lib/types'
import { Plus, Mail, Eye, Brain, Copy, Edit, Trash2 } from 'lucide-react'

interface EmailTemplatesTabProps {
  templates: EmailTemplate[]
  segments: Segment[]
  onTemplateUpdate: () => void
}

export function EmailTemplatesTab({ templates, segments, onTemplateUpdate }: EmailTemplatesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const { toast } = useToast()

  const [newTemplate, setNewTemplate] = useState({
    nom: '',
    sujet: '',
    contenu_html: '',
    contenu_texte: '',
    categorie: 'prospection',
    statut: 'draft'
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.sujet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || template.categorie === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert([newTemplate])

      if (error) throw error

      toast({
        title: "Template créé",
        description: "Le nouveau template a été créé avec succès.",
      })

      setIsCreateDialogOpen(false)
      setNewTemplate({
        nom: '',
        sujet: '',
        contenu_html: '',
        contenu_texte: '',
        categorie: 'prospection',
        statut: 'draft'
      })
      onTemplateUpdate()
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le template.",
        variant: "destructive"
      })
    }
  }

  const generateAITemplates = async () => {
    setIsGeneratingAI(true)
    try {
      // Templates IA prédéfinis pour l'assurance
      const aiTemplates = [
        {
          nom: "Prospection Assurance Habitation",
          sujet: "🏠 Protégez votre foyer avec notre assurance habitation",
          contenu_html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Bonjour {{prenom}},</h2>
              <p>Votre domicile est votre bien le plus précieux. Avez-vous pensé à le protéger convenablement ?</p>
              <p>Notre assurance habitation couvre :</p>
              <ul>
                <li>✅ Dégâts des eaux et incendies</li>
                <li>✅ Vol et vandalisme</li>
                <li>✅ Responsabilité civile</li>
                <li>✅ Assistance 24h/24</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                  Demander un devis gratuit
                </a>
              </div>
              <p>Cordialement,<br>{{commercial}}</p>
            </div>
          `,
          categorie: 'prospection',
          statut: 'active'
        },
        {
          nom: "Relance Prospect Non-Répondeur",
          sujet: "Une dernière chance de protéger votre avenir",
          contenu_html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">{{prenom}}, ne passez pas à côté de cette opportunité</h2>
              <p>Je vous ai contacté récemment concernant votre protection sociale, mais je n'ai pas eu de retour de votre part.</p>
              <p>Saviez-vous que :</p>
              <ul>
                <li>🔴 1 français sur 3 est sous-assuré</li>
                <li>🔴 Les frais de santé augmentent de 3% par an</li>
                <li>🔴 Un accident peut survenir à tout moment</li>
              </ul>
              <p><strong>Offre spéciale limitée :</strong> -20% sur votre première année d'assurance.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                  Profiter de l'offre
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">Cette offre expire dans 48h.</p>
            </div>
          `,
          categorie: 'relance',
          statut: 'active'
        },
        {
          nom: "Bienvenue Nouveau Client",
          sujet: "🎉 Bienvenue chez {{nom_entreprise}} !",
          contenu_html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Félicitations {{prenom}} !</h2>
              <p>Nous sommes ravis de vous accueillir parmi nos clients.</p>
              <p>Votre contrat <strong>{{produit}}</strong> est maintenant actif.</p>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Vos prochaines étapes :</h3>
                <ol>
                  <li>Téléchargez votre attestation dans votre espace client</li>
                  <li>Sauvegardez nos contacts d'urgence</li>
                  <li>Découvrez tous vos avantages client</li>
                </ol>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                  Accéder à mon espace
                </a>
              </div>
              <p>Votre conseiller dédié : {{commercial}}<br>
              📞 {{telephone}} | ✉️ {{email}}</p>
            </div>
          `,
          categorie: 'onboarding',
          statut: 'active'
        }
      ]

      for (const template of aiTemplates) {
        await supabase.from('email_templates').insert([template])
      }

      toast({
        title: "Templates IA générés",
        description: `${aiTemplates.length} templates intelligents ont été créés.`,
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
          <h2 className="text-2xl font-bold text-foreground">Templates Email</h2>
          <p className="text-muted-foreground">
            Gérez vos modèles d'emails pour vos campagnes et workflows
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={generateAITemplates}
            disabled={isGeneratingAI}
            variant="outline"
            className="gap-2"
          >
            <Brain size={16} />
            {isGeneratingAI ? 'Génération...' : 'Templates IA'}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Nouveau Template
          </Button>
        </div>
      </div>

      {/* Filters */}
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

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{template.nom}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge 
                      className={`${getCategoryColor(template.categorie || '')} text-white`}
                    >
                      {template.categorie}
                    </Badge>
                    <Badge variant={template.statut === 'active' ? 'default' : 'secondary'}>
                      {template.statut === 'active' ? 'Actif' : 'Brouillon'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sujet</div>
                  <div className="text-sm font-medium line-clamp-2">{template.sujet}</div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Créé le {new Date(template.created_at || '').toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau template</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nom du template</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.nom}
                    onChange={(e) => setNewTemplate({...newTemplate, nom: e.target.value})}
                    placeholder="Ex: Email de prospection"
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
                  placeholder="Ex: 🏠 Protégez votre foyer avec notre assurance"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-html">Contenu HTML</Label>
                <Textarea
                  id="template-html"
                  value={newTemplate.contenu_html}
                  onChange={(e) => setNewTemplate({...newTemplate, contenu_html: e.target.value})}
                  placeholder="Contenu HTML de votre email..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Variables disponibles :</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <code>{'{{prenom}}'}</code>
                  <code>{'{{nom}}'}</code>
                  <code>{'{{email}}'}</code>
                  <code>{'{{telephone}}'}</code>
                  <code>{'{{ville}}'}</code>
                  <code>{'{{commercial}}'}</code>
                  <code>{'{{entreprise}}'}</code>
                  <code>{'{{produit}}'}</code>
                  <code>{'{{date}}'}</code>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="text-sm font-medium">Sujet :</div>
                  <div className="text-lg">{newTemplate.sujet || "Sujet de l'email"}</div>
                </div>
                <div 
                  className="bg-white p-4 rounded border"
                  dangerouslySetInnerHTML={{ 
                    __html: newTemplate.contenu_html || "<p>Contenu de l'email...</p>" 
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateTemplate}>
              Créer le template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu : {selectedTemplate?.nom}</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm font-medium">Sujet :</div>
                <div className="text-lg">{selectedTemplate.sujet}</div>
              </div>
              <div 
                className="bg-white p-6 border rounded-lg"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.contenu_html }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}