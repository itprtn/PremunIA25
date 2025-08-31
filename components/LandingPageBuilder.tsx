'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Palette, 
  Type, 
  Image, 
  FormInput,
  Copy,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

interface LandingPage {
  id?: number;
  slug: string;
  template: string;
  title: string;
  settings: any;
  status: 'draft' | 'published' | 'archived';
}

interface FormSchema {
  fields: FormField[];
  steps: number;
  validation: any;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'date' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: any;
}

const TEMPLATES = [
  {
    id: 'mutuelle-sante',
    name: 'Mutuelle Santé Express',
    description: 'Template 3 étapes pour mutuelle santé',
    preview: '/templates/mutuelle-sante.png',
    category: 'sante'
  },
  {
    id: 'devis-relance',
    name: 'Rappel Devis Santé 48h',
    description: 'LP de relance personnalisée',
    preview: '/templates/devis-relance.png',
    category: 'relance'
  },
  {
    id: 'senior-60',
    name: 'Mutuelle Sénior 60+',
    description: 'Argumentaire dédié seniors',
    preview: '/templates/senior-60.png',
    category: 'senior'
  },
  {
    id: 'assurance-emprunteur',
    name: 'Assurance Emprunteur',
    description: 'Mise en avant économies',
    preview: '/templates/assurance-emprunteur.png',
    category: 'emprunteur'
  },
  {
    id: 'parrainage',
    name: 'Parrainage/Offre Flash',
    description: 'Incentive limité',
    preview: '/templates/parrainage.png',
    category: 'promo'
  }
];

const BLOCKS = [
  { type: 'hero', name: 'Hero', icon: Type, description: 'Titre principal et sous-titre' },
  { type: 'form', name: 'Formulaire', icon: FormInput, description: 'Formulaire multi-étapes' },
  { type: 'social-proof', name: 'Preuves sociales', icon: Image, description: 'Avis et logos partenaires' },
  { type: 'benefits', name: 'Avantages', icon: Palette, description: 'Cartes des garanties' },
  { type: 'faq', name: 'FAQ', icon: Type, description: 'Questions fréquentes' },
  { type: 'cta', name: 'Call-to-Action', icon: Play, description: 'Bouton d\'action principal' }
];

export default function LandingPageBuilder() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [currentPage, setCurrentPage] = useState<LandingPage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [formSchema, setFormSchema] = useState<FormSchema>({
    fields: [],
    steps: 1,
    validation: {}
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    // TODO: Charger depuis Supabase
    const mockPages: LandingPage[] = [
      {
        id: 1,
        slug: 'mutuelle-sante-express',
        template: 'mutuelle-sante',
        title: 'Mutuelle Santé Express - Devis Gratuit',
        settings: {},
        status: 'published'
      }
    ];
    setPages(mockPages);
  };

  const createNewPage = () => {
    const newPage: LandingPage = {
      slug: '',
      template: '',
      title: '',
      settings: {},
      status: 'draft'
    };
    setCurrentPage(newPage);
    setBlocks([]);
    setFormSchema({ fields: [], steps: 1, validation: {} });
    setIsEditing(true);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (currentPage) {
      setCurrentPage({ ...currentPage, template: templateId });
    }
  };

  const addBlock = (blockType: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: getDefaultBlockContent(blockType),
      settings: getDefaultBlockSettings(blockType)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultBlockContent = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          title: 'Titre principal',
          subtitle: 'Sous-titre explicatif',
          ctaText: 'Commencer maintenant',
          ctaUrl: '#form'
        };
      case 'form':
        return {
          title: 'Formulaire de contact',
          description: 'Remplissez ce formulaire pour recevoir votre devis'
        };
      case 'social-proof':
        return {
          title: 'Ils nous font confiance',
          testimonials: [],
          logos: []
        };
      default:
        return {};
    }
  };

  const getDefaultBlockSettings = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          alignment: 'center',
          padding: '80px 20px'
        };
      case 'form':
        return {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          borderRadius: '8px'
        };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, updates: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const savePage = async () => {
    if (!currentPage) return;

    try {
      // TODO: Sauvegarder dans Supabase
      const pageToSave = {
        ...currentPage,
        settings: {
          blocks,
          formSchema,
          ...currentPage.settings
        }
      };

      if (currentPage.id) {
        // Update existing page
        setPages(pages.map(p => p.id === currentPage.id ? pageToSave : p));
      } else {
        // Create new page
        const newPage = { ...pageToSave, id: Date.now() };
        setPages([...pages, newPage]);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const publishPage = async () => {
    if (!currentPage) return;
    
    try {
      const updatedPage = { ...currentPage, status: 'published' as const };
      setCurrentPage(updatedPage);
      setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
      
      // TODO: Publier sur Supabase et déployer
      console.log('Page publiée:', updatedPage);
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const renderBlockEditor = (block: any) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Titre principal</Label>
              <Input
                value={block.content.title}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, title: e.target.value }
                })}
                placeholder="Titre principal"
              />
            </div>
            <div>
              <Label>Sous-titre</Label>
              <Textarea
                value={block.content.subtitle}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, subtitle: e.target.value }
                })}
                placeholder="Sous-titre explicatif"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texte CTA</Label>
                <Input
                  value={block.content.ctaText}
                  onChange={(e) => updateBlock(block.id, {
                    content: { ...block.content, ctaText: e.target.value }
                  })}
                  placeholder="Commencer maintenant"
                />
              </div>
              <div>
                <Label>URL CTA</Label>
                <Input
                  value={block.content.ctaUrl}
                  onChange={(e) => updateBlock(block.id, {
                    content: { ...block.content, ctaUrl: e.target.value }
                  })}
                  placeholder="#form"
                />
              </div>
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <Label>Titre du formulaire</Label>
              <Input
                value={block.content.title}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, title: e.target.value }
                })}
                placeholder="Titre du formulaire"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={block.content.description}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, description: e.target.value }
                })}
                placeholder="Description du formulaire"
              />
            </div>
            <Button onClick={() => setIsEditing(true)}>
              Configurer le formulaire
            </Button>
          </div>
        );
      
      default:
        return <div>Éditeur non disponible pour ce type de bloc</div>;
    }
  };

  const renderBlockPreview = (block: any) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {block.content.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {block.content.subtitle}
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {block.content.ctaText}
            </Button>
          </div>
        );
      
      case 'form':
        return (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-4">
              {block.content.title}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {block.content.description}
            </p>
            <div className="space-y-4">
              <Input placeholder="Prénom" />
              <Input placeholder="Nom" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Téléphone" type="tel" />
              <Button className="w-full">Envoyer</Button>
            </div>
          </div>
        );
      
      default:
        return <div className="p-4 border-2 border-dashed border-gray-300 text-center text-gray-500">
          Aperçu non disponible
        </div>;
    }
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold">Aperçu de la landing page</h1>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsPreview(false)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quitter l'aperçu
                </Button>
                <Button onClick={publishPage}>
                  <Play className="w-4 h-4 mr-2" />
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {blocks.map((block) => (
            <div key={block.id} className="mb-8">
              {renderBlockPreview(block)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">Landing Page Builder</h1>
            <div className="flex space-x-2">
              {currentPage && (
                <>
                  <Button variant="outline" onClick={() => setIsPreview(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button onClick={savePage}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </>
              )}
              <Button onClick={createNewPage}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle page
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentPage ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Créer votre première landing page
            </h2>
            <p className="text-gray-600 mb-8">
              Choisissez un template et commencez à construire votre page de conversion
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Aperçu</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    <Badge variant="secondary">{template.category}</Badge>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => {
                        createNewPage();
                        selectTemplate(template.id);
                      }}
                    >
                      Utiliser ce template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar gauche - Blocs disponibles */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blocs disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {BLOCKS.map((block) => (
                    <Button
                      key={block.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addBlock(block.type)}
                    >
                      <block.icon className="w-4 h-4 mr-2" />
                      {block.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Zone d'édition principale */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Éditeur de page</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Paramètres
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label>Slug de la page</Label>
                      <Input
                        value={currentPage.slug}
                        onChange={(e) => setCurrentPage({ ...currentPage, slug: e.target.value })}
                        placeholder="ma-page-landing"
                      />
                    </div>
                    <div>
                      <Label>Titre de la page</Label>
                      <Input
                        value={currentPage.title}
                        onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                        placeholder="Titre de votre landing page"
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <Card key={block.id} className="border-2 border-dashed border-gray-300">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{block.type}</Badge>
                              <span className="text-sm text-gray-500">Bloc {index + 1}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newBlocks = [...blocks];
                                  if (index > 0) {
                                    [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
                                    setBlocks(newBlocks);
                                  }
                                }}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newBlocks = [...blocks];
                                  if (index < blocks.length - 1) {
                                    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
                                    setBlocks(newBlocks);
                                  }
                                }}
                                disabled={index === blocks.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBlock(block.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {renderBlockEditor(block)}
                        </CardContent>
                      </Card>
                    ))}

                    {blocks.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-gray-500 mb-4">
                          <FormInput className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucun bloc ajouté
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Commencez par ajouter des blocs depuis la sidebar
                        </p>
                        <Button onClick={() => addBlock('hero')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un bloc Hero
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar droite - Propriétés */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Propriétés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Statut</Label>
                      <Select
                        value={currentPage.status}
                        onValueChange={(value) => setCurrentPage({ ...currentPage, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Template</Label>
                      <Select
                        value={currentPage.template}
                        onValueChange={(value) => setCurrentPage({ ...currentPage, template: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un template" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label>Actions</Label>
                      <div className="space-y-2 mt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Aperçu
                        </Button>
                        <Button size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Publier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
