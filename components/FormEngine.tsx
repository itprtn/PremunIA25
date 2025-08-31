'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  Settings, 
  Plus,
  Trash2,
  Copy,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  FormInput
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'number';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    custom?: string;
  };
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  step: number;
  order: number;
}

interface FormStep {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: any;
}

interface FormSchema {
  id?: string;
  name: string;
  description?: string;
  steps: FormStep[];
  settings: {
    showProgress: boolean;
    allowBackNavigation: boolean;
    autoSave: boolean;
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
  };
  consent: {
    required: boolean;
    text: string;
    purposes: string[];
    lawfulBasis: string;
  };
  styling: {
    theme: 'light' | 'dark' | 'custom';
    primaryColor: string;
    borderRadius: string;
    fontFamily: string;
  };
}

interface FormSubmission {
  formId: string;
  data: Record<string, any>;
  utm?: Record<string, string>;
  consent: {
    granted: boolean;
    timestamp: string;
    ip?: string;
    userAgent?: string;
  };
  metadata: {
    startTime: string;
    completionTime?: string;
    timeSpent: number;
    stepsCompleted: number;
  };
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte', icon: 'T' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'phone', label: 'Téléphone', icon: '📞' },
  { value: 'select', label: 'Sélection', icon: '▼' },
  { value: 'textarea', label: 'Zone de texte', icon: '¶' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'checkbox', label: 'Case à cocher', icon: '☐' },
  { value: 'radio', label: 'Boutons radio', icon: '●' },
  { value: 'number', label: 'Nombre', icon: '#' }
];

const VALIDATION_RULES = [
  { value: 'required', label: 'Champ obligatoire' },
  { value: 'email', label: 'Format email valide' },
  { value: 'phone', label: 'Format téléphone français' },
  { value: 'minLength', label: 'Longueur minimale' },
  { value: 'maxLength', label: 'Longueur maximale' },
  { value: 'pattern', label: 'Expression régulière' },
  { value: 'min', label: 'Valeur minimale' },
  { value: 'max', label: 'Valeur maximale' }
];

export default function FormEngine() {
  const [formSchema, setFormSchema] = useState<FormSchema>({
    name: '',
    description: '',
    steps: [],
    settings: {
      showProgress: true,
      allowBackNavigation: true,
      autoSave: true,
      submitButtonText: 'Envoyer',
      successMessage: 'Merci ! Votre formulaire a été envoyé avec succès.',
      redirectUrl: ''
    },
    consent: {
      required: true,
      text: 'J\'accepte de recevoir des informations commerciales et accepte la politique de confidentialité.',
      purposes: ['lead_generation', 'marketing'],
      lawfulBasis: 'consent'
    },
    styling: {
      theme: 'light',
      primaryColor: '#3b82f6',
      borderRadius: '8px',
      fontFamily: 'Inter'
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormSchema();
  }, []);

  const loadFormSchema = async () => {
    // TODO: Charger depuis Supabase
    const mockSchema: FormSchema = {
      name: 'Formulaire Mutuelle Santé',
      description: 'Formulaire de devis mutuelle santé en 3 étapes',
      steps: [
        {
          id: 1,
          title: 'Informations personnelles',
          description: 'Vos coordonnées de base',
          fields: [
            {
              id: 'first_name',
              type: 'text',
              label: 'Prénom',
              required: true,
              placeholder: 'Votre prénom',
              step: 1,
              order: 1
            },
            {
              id: 'last_name',
              type: 'text',
              label: 'Nom',
              required: true,
              placeholder: 'Votre nom',
              step: 1,
              order: 2
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
              placeholder: 'votre@email.com',
              step: 1,
              order: 3
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Téléphone',
              required: false,
              placeholder: '06 12 34 56 78',
              step: 1,
              order: 4
            }
          ]
        },
        {
          id: 2,
          title: 'Situation familiale',
          description: 'Votre situation actuelle',
          fields: [
            {
              id: 'family_status',
              type: 'select',
              label: 'Situation familiale',
              required: true,
              options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'],
              step: 2,
              order: 1
            },
            {
              id: 'children',
              type: 'number',
              label: 'Nombre d\'enfants',
              required: false,
              placeholder: '0',
              validation: { min: 0, max: 10 },
              step: 2,
              order: 2
            },
            {
              id: 'has_pets',
              type: 'checkbox',
              label: 'Avez-vous des animaux de compagnie ?',
              required: false,
              step: 2,
              order: 3
            }
          ]
        },
        {
          id: 3,
          title: 'Besoins santé',
          description: 'Vos besoins en couverture santé',
          fields: [
            {
              id: 'health_concerns',
              type: 'textarea',
              label: 'Problèmes de santé actuels',
              required: false,
              placeholder: 'Décrivez vos besoins spécifiques...',
              step: 3,
              order: 1
            },
            {
              id: 'current_insurance',
              type: 'select',
              label: 'Assurance actuelle',
              required: false,
              options: ['Aucune', 'Mutuelle entreprise', 'Mutuelle individuelle', 'Autre'],
              step: 3,
              order: 2
            }
          ]
        }
      ],
      settings: formSchema.settings,
      consent: formSchema.consent,
      styling: formSchema.styling
    };
    setFormSchema(mockSchema);
  };

  const addStep = () => {
    const newStep: FormStep = {
      id: formSchema.steps.length + 1,
      title: `Étape ${formSchema.steps.length + 1}`,
      description: 'Description de l\'étape',
      fields: []
    };
    setFormSchema({
      ...formSchema,
      steps: [...formSchema.steps, newStep]
    });
  };

  const removeStep = (stepId: number) => {
    if (formSchema.steps.length <= 1) return;
    
    setFormSchema({
      ...formSchema,
      steps: formSchema.steps.filter(step => step.id !== stepId)
    });
  };

  const addField = (stepId: number) => {
    const step = formSchema.steps.find(s => s.id === stepId);
    if (!step) return;

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      required: false,
      placeholder: '',
      step: stepId,
      order: step.fields.length + 1
    };

    const updatedSteps = formSchema.steps.map(s => 
      s.id === stepId 
        ? { ...s, fields: [...s.fields, newField] }
        : s
    );

    setFormSchema({
      ...formSchema,
      steps: updatedSteps
    });

    setSelectedField(newField);
  };

  const removeField = (stepId: number, fieldId: string) => {
    const updatedSteps = formSchema.steps.map(step => 
      step.id === stepId 
        ? { ...step, fields: step.fields.filter(f => f.id !== fieldId) }
        : step
    );

    setFormSchema({
      ...formSchema,
      steps: updatedSteps
    });
  };

  const updateField = (stepId: number, fieldId: string, updates: Partial<FormField>) => {
    const updatedSteps = formSchema.steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field => 
              field.id === fieldId 
                ? { ...field, ...updates }
                : field
            )
          }
        : step
    );

    setFormSchema({
      ...formSchema,
      steps: updatedSteps
    });
  };

  const moveField = (stepId: number, fieldId: string, direction: 'up' | 'down') => {
    const step = formSchema.steps.find(s => s.id === stepId);
    if (!step) return;

    const fieldIndex = step.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newFields = [...step.fields];
    if (direction === 'up' && fieldIndex > 0) {
      [newFields[fieldIndex], newFields[fieldIndex - 1]] = [newFields[fieldIndex - 1], newFields[fieldIndex]];
    } else if (direction === 'down' && fieldIndex < newFields.length - 1) {
      [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
    }

    const updatedSteps = formSchema.steps.map(s => 
      s.id === stepId ? { ...s, fields: newFields } : s
    );

    setFormSchema({
      ...formSchema,
      steps: updatedSteps
    });
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return 'Ce champ est obligatoire';
    }

    if (value && field.validation) {
      if (field.validation.minLength && value.toString().length < field.validation.minLength) {
        return `Minimum ${field.validation.minLength} caractères`;
      }
      if (field.validation.maxLength && value.toString().length > field.validation.maxLength) {
        return `Maximum ${field.validation.maxLength} caractères`;
      }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Format email invalide';
      }
      if (field.type === 'phone' && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(value)) {
        return 'Format téléphone invalide';
      }
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateStep = (step: FormStep): boolean => {
    const stepErrors: Record<string, string> = {};
    let isValid = true;

    step.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        stepErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const nextStep = () => {
    const currentStepData = formSchema.steps[currentStep];
    if (validateStep(currentStepData)) {
      setCurrentStep(prev => Math.min(prev + 1, formSchema.steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(formSchema.steps[currentStep])) return;

    setIsSubmitting(true);
    
    try {
      const submission: FormSubmission = {
        formId: formSchema.id || 'temp',
        data: formData,
        utm: getUTMParams(),
        consent: {
          granted: formData.consent === true,
          timestamp: new Date().toISOString(),
          ip: '', // TODO: Get from request
          userAgent: navigator.userAgent
        },
        metadata: {
          startTime: new Date().toISOString(),
          completionTime: new Date().toISOString(),
          timeSpent: Date.now() - Date.now(), // TODO: Calculate actual time
          stepsCompleted: formSchema.steps.length
        }
      };

      // TODO: Submit to Supabase
      console.log('Form submission:', submission);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success
      alert(formSchema.settings.successMessage);
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Erreur lors de l\'envoi du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUTMParams = (): Record<string, string> => {
    const urlParams = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
      const value = urlParams.get(param);
      if (value) utm[param] = value;
    });
    
    return utm;
  };

  const renderFieldEditor = (field: FormField, stepId: number) => (
    <Card key={field.id} className="border-2 border-dashed border-gray-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{field.type}</Badge>
            <span className="text-sm text-gray-500">Champ {field.order}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(stepId, field.id, 'up')}
              disabled={field.order === 1}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(stepId, field.id, 'down')}
              disabled={field.order === formSchema.steps.find(s => s.id === stepId)?.fields.length}
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedField(field)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(stepId, field.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Type de champ</Label>
            <Select
              value={field.type}
              onValueChange={(value) => updateField(stepId, field.id, { type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Libellé</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(stepId, field.id, { label: e.target.value })}
              placeholder="Libellé du champ"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(stepId, field.id, { placeholder: e.target.value })}
                placeholder="Texte d'aide"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateField(stepId, field.id, { required: checked as boolean })}
              />
              <Label htmlFor={`required-${field.id}`}>Champ obligatoire</Label>
            </div>
          </div>
          
          {(field.type === 'select' || field.type === 'radio') && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {(field.options || []).map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = e.target.value;
                        updateField(stepId, field.id, { options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index) || [];
                        updateField(stepId, field.id, { options: newOptions });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(field.options || []), ''];
                    updateField(stepId, field.id, { options: newOptions });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderFieldPreview = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Sélectionner...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {error && <p className="text-sm text-red-500 ml-6">{error}</p>}
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${option}`}
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      default:
        return <div>Type de champ non supporté</div>;
    }
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold">Aperçu du formulaire</h1>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsPreview(false)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quitter l'aperçu
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{formSchema.name}</CardTitle>
              {formSchema.description && (
                <p className="text-gray-600">{formSchema.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {formSchema.settings.showProgress && (
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Étape {currentStep + 1} sur {formSchema.steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / formSchema.steps.length) * 100)}%</span>
                  </div>
                  <Progress value={((currentStep + 1) / formSchema.steps.length) * 100} className="w-full" />
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {formSchema.steps[currentStep]?.title}
                  </h3>
                  {formSchema.steps[currentStep]?.description && (
                    <p className="text-gray-600 mb-4">
                      {formSchema.steps[currentStep]?.description}
                    </p>
                  )}
                  
                  <div className="space-y-4">
                    {formSchema.steps[currentStep]?.fields.map((field) => renderFieldPreview(field))}
                  </div>
                </div>
                
                {currentStep === formSchema.steps.length - 1 && (
                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="consent"
                          checked={formData.consent || false}
                          onCheckedChange={(checked) => handleFieldChange('consent', checked)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="consent" className="text-sm">
                            {formSchema.consent.text}
                          </Label>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Shield className="w-3 h-3" />
                            <span>RGPD - Vos données sont protégées</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-6">
                  {formSchema.settings.allowBackNavigation && currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Précédent
                    </Button>
                  )}
                  
                  {currentStep < formSchema.steps.length - 1 ? (
                    <Button onClick={nextStep} className="ml-auto">
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="ml-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        formSchema.settings.submitButtonText
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">Form Engine</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar gauche - Étapes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Étapes</CardTitle>
                  <Button size="sm" onClick={addStep}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {formSchema.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-500">
                          {step.fields.length} champ{step.fields.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      {formSchema.steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(step.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Zone d'édition principale */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {formSchema.steps[currentStep]?.title || 'Nouvelle étape'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addField(formSchema.steps[currentStep]?.id || 1)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un champ
                    </Button>
                  </div>
                </div>
                {formSchema.steps[currentStep]?.description && (
                  <p className="text-gray-600 text-sm">
                    {formSchema.steps[currentStep]?.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formSchema.steps[currentStep]?.fields.map((field) => 
                    renderFieldEditor(field, formSchema.steps[currentStep]?.id || 1)
                  )}
                  
                  {(!formSchema.steps[currentStep]?.fields || formSchema.steps[currentStep]?.fields.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-500 mb-4">
                        <FormInput className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun champ dans cette étape
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Commencez par ajouter des champs
                      </p>
                      <Button onClick={() => addField(formSchema.steps[currentStep]?.id || 1)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un champ
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
                    <Label>Nom du formulaire</Label>
                    <Input
                      value={formSchema.name}
                      onChange={(e) => setFormSchema({ ...formSchema, name: e.target.value })}
                      placeholder="Nom du formulaire"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formSchema.description || ''}
                      onChange={(e) => setFormSchema({ ...formSchema, description: e.target.value })}
                      placeholder="Description du formulaire"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Paramètres</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showProgress"
                          checked={formSchema.settings.showProgress}
                          onCheckedChange={(checked) => setFormSchema({
                            ...formSchema,
                            settings: { ...formSchema.settings, showProgress: checked as boolean }
                          })}
                        />
                        <Label htmlFor="showProgress" className="text-sm">Afficher la progression</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allowBackNavigation"
                          checked={formSchema.settings.allowBackNavigation}
                          onCheckedChange={(checked) => setFormSchema({
                            ...formSchema,
                            settings: { ...formSchema.settings, allowBackNavigation: checked as boolean }
                          })}
                        />
                        <Label htmlFor="allowBackNavigation" className="text-sm">Navigation retour</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSave"
                          checked={formSchema.settings.autoSave}
                          onCheckedChange={(checked) => setFormSchema({
                            ...formSchema,
                            settings: { ...formSchema.settings, autoSave: checked as boolean }
                          })}
                        />
                        <Label htmlFor="autoSave" className="text-sm">Sauvegarde automatique</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Consentement RGPD</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consentRequired"
                          checked={formSchema.consent.required}
                          onCheckedChange={(checked) => setFormSchema({
                            ...formSchema,
                            consent: { ...formSchema.consent, required: checked as boolean }
                          })}
                        />
                        <Label htmlFor="consentRequired" className="text-sm">Consentement obligatoire</Label>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Texte de consentement</Label>
                        <Textarea
                          value={formSchema.consent.text}
                          onChange={(e) => setFormSchema({
                            ...formSchema,
                            consent: { ...formSchema.consent, text: e.target.value }
                          })}
                          placeholder="Texte du consentement RGPD"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
