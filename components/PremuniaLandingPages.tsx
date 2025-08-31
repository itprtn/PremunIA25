import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { 
  Heart, 
  Shield, 
  Users, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  CheckCircle,
  ArrowRight,
  Calculator,
  FileText,
  Award,
  TrendingUp,
  Eye
} from 'lucide-react'

interface LandingPage {
  id: string
  name: string
  description: string
  category: string
  template: React.ReactNode
  isActive: boolean
}

export function PremuniaLandingPages() {
  const [selectedPage, setSelectedPage] = useState<string>('mutuelle-sante')
  const [showPreview, setShowPreview] = useState(false)

  // Template 1: Mutuelle Santé Express
  const MutuelleSanteTemplate = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Premunia
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-5 h-5 text-orange-600" />
              <span className="text-orange-600 font-semibold">+33 1 83 62 78 66</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Mutuelle Santé{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Express
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Obtenez votre devis mutuelle santé en moins de 2 minutes et économisez jusqu'à{' '}
              <span className="font-bold text-orange-600">40% sur vos cotisations</span> 
              sans compromettre votre protection.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Clients satisfaits</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">40%</h3>
              <p className="text-gray-600">D'économies moyennes</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9/5</h3>
              <p className="text-gray-600">Note client Google</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Obtenir mon devis gratuit
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Devis personnalisé en 2 minutes
            </h2>
            <p className="text-lg text-gray-600">
              Remplissez ce formulaire pour recevoir votre devis sur mesure
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Prénom *
                  </Label>
                  <Input placeholder="Votre prénom" className="border-gray-300 focus:border-orange-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nom *
                  </Label>
                  <Input placeholder="Votre nom" className="border-gray-300 focus:border-orange-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email *
                  </Label>
                  <Input type="email" placeholder="votre@email.com" className="border-gray-300 focus:border-orange-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Téléphone *
                  </Label>
                  <Input placeholder="06 12 34 56 78" className="border-gray-300 focus:border-orange-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Âge *
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500">
                      <SelectValue placeholder="Sélectionner votre âge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25 ans</SelectItem>
                      <SelectItem value="26-35">26-35 ans</SelectItem>
                      <SelectItem value="36-45">36-45 ans</SelectItem>
                      <SelectItem value="46-55">46-55 ans</SelectItem>
                      <SelectItem value="56-65">56-65 ans</SelectItem>
                      <SelectItem value="65+">65+ ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Situation professionnelle *
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500">
                      <SelectValue placeholder="Votre situation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salarie">Salarié</SelectItem>
                      <SelectItem value="independant">Indépendant</SelectItem>
                      <SelectItem value="retraite">Retraité</SelectItem>
                      <SelectItem value="etudiant">Étudiant</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Besoins spécifiques
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Dentaire', 'Optique', 'Hospitalisation', 'Médecine douce'].map((need) => (
                    <div key={need} className="flex items-center space-x-2">
                      <Checkbox id={need.toLowerCase()} />
                      <Label htmlFor={need.toLowerCase()} className="text-sm text-gray-600">
                        {need}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="consent" />
                  <Label htmlFor="consent" className="text-sm text-gray-600">
                    J'accepte d'être contacté pour recevoir mon devis personnalisé et des offres adaptées à mes besoins
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Recevoir mon devis gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                * Champs obligatoires. Vos données sont protégées et ne seront utilisées que pour votre devis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Premunia ?
            </h2>
            <p className="text-lg text-gray-600">
              Plus de 10 ans d'expertise au service de votre santé
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Protection complète",
                description: "Couverture adaptée à tous vos besoins santé avec les meilleurs assureurs du marché."
              },
              {
                icon: Calculator,
                title: "Économies garanties",
                description: "Nous négocions pour vous les meilleurs tarifs et vous garantissons des économies."
              },
              {
                icon: Users,
                title: "Conseil personnalisé",
                description: "Un expert dédié vous accompagne dans le choix de votre mutuelle santé."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les témoignages de nos clients satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                position: "Infirmière libérale",
                content: "Grâce à Premunia, j'ai économisé 35% sur ma mutuelle santé tout en gardant une excellente couverture. Service impeccable !",
                rating: 5
              },
              {
                name: "Pierre Martin",
                position: "Chef d'entreprise",
                content: "L'équipe Premunia a su comprendre mes besoins et m'a proposé une solution parfaitement adaptée. Je recommande !",
                rating: 5
              },
              {
                name: "Sophie Bernard",
                position: "Retraitée",
                content: "Un accompagnement personnalisé et des tarifs vraiment avantageux. Je suis ravie de ma mutuelle santé !",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à économiser sur votre mutuelle santé ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez plus de 50,000 clients satisfaits et obtenez votre devis gratuit en 2 minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Devis gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Appeler un expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Premunia</span>
              </div>
              <p className="text-gray-400 text-sm">
                Votre partenaire en mutuelle santé et prévoyance depuis 2011.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+33 1 83 62 78 66</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@premunia.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>826 rue Roger SALENGRO<br />92370 CHAVILLE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Lun-Ven: 9h30-18h30</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mutuelle Santé</li>
                <li>Assurance Emprunteur</li>
                <li>Prévoyance</li>
                <li>Assurance Animaux</li>
                <li>Courtage en assurance</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>À propos</li>
                <li>Blog</li>
                <li>Mentions légales</li>
                <li>Politique de confidentialité</li>
                <li>CGV</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="text-center text-sm text-gray-400">
            <p>© 2025 Premunia. Tous droits réservés. | Conçu avec ❤️ par iTrend</p>
          </div>
        </div>
      </footer>
    </div>
  )

  // Template 2: Assurance Emprunteur
  const AssuranceEmprunteurTemplate = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Premunia
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-semibold">+33 1 83 62 78 66</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Assurance{' '}
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Emprunteur
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Protégez votre projet immobilier avec une assurance emprunteur sur mesure.{' '}
              <span className="font-bold text-blue-600">Économisez jusqu'à 60%</span> 
              sur vos cotisations grâce à notre expertise.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">15,000+</h3>
              <p className="text-gray-600">Prêts sécurisés</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">60%</h3>
              <p className="text-gray-600">D'économies moyennes</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.8/5</h3>
              <p className="text-gray-600">Note client Google</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Comparer les offres
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simulation assurance emprunteur
            </h2>
            <p className="text-lg text-gray-600">
              Obtenez votre devis personnalisé en quelques clics
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Prénom *
                  </Label>
                  <Input placeholder="Votre prénom" className="border-gray-300 focus:border-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nom *
                  </Label>
                  <Input placeholder="Votre nom" className="border-gray-300 focus:border-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email *
                  </Label>
                  <Input type="email" placeholder="votre@email.com" className="border-gray-300 focus:border-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Téléphone *
                  </Label>
                  <Input placeholder="06 12 34 56 78" className="border-gray-300 focus:border-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Montant du prêt *
                  </Label>
                  <Input placeholder="250,000 €" className="border-gray-300 focus:border-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Durée du prêt *
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 ans</SelectItem>
                      <SelectItem value="20">20 ans</SelectItem>
                      <SelectItem value="25">25 ans</SelectItem>
                      <SelectItem value="30">30 ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Garanties souhaitées
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Décès', 'Invalidité', 'Incapacité', 'Chômage', 'Perte d\'emploi', 'Dépendance'].map((guarantee) => (
                    <div key={guarantee} className="flex items-center space-x-2">
                      <Checkbox id={guarantee.toLowerCase().replace(/\s+/g, '-')} />
                      <Label htmlFor={guarantee.toLowerCase().replace(/\s+/g, '-')} className="text-sm text-gray-600">
                        {guarantee}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="consent-emprunteur" />
                  <Label htmlFor="consent-emprunteur" className="text-sm text-gray-600">
                    J'accepte d'être contacté pour recevoir ma simulation et des offres adaptées
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Obtenir ma simulation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                * Champs obligatoires. Vos données sont protégées et ne seront utilisées que pour votre simulation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Les avantages de notre expertise
            </h2>
            <p className="text-lg text-gray-600">
              Plus de 10 ans d'expérience dans l'assurance emprunteur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Comparatif complet",
                description: "Nous analysons plus de 50 assureurs pour vous proposer les meilleures offres du marché."
              },
              {
                icon: Calculator,
                title: "Économies garanties",
                description: "Notre expertise vous permet d'économiser en moyenne 60% sur vos cotisations d'assurance."
              },
              {
                icon: Users,
                title: "Accompagnement",
                description: "Un expert dédié vous guide dans le choix de votre assurance emprunteur."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-blue-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à sécuriser votre prêt immobilier ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez plus de 15,000 emprunteurs protégés et obtenez votre simulation gratuite
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Simulation gratuite
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Parler à un expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Premunia</span>
              </div>
              <p className="text-gray-400 text-sm">
                Votre partenaire en assurance emprunteur depuis 2011.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+33 1 83 62 78 66</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@premunia.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>826 rue Roger SALENGRO<br />92370 CHAVILLE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Lun-Ven: 9h30-18h30</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Assurance Emprunteur</li>
                <li>Mutuelle Santé</li>
                <li>Prévoyance</li>
                <li>Assurance Animaux</li>
                <li>Courtage en assurance</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>À propos</li>
                <li>Blog</li>
                <li>Mentions légales</li>
                <li>Politique de confidentialité</li>
                <li>CGV</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="text-center text-sm text-gray-400">
            <p>© 2025 Premunia. Tous droits réservés. | Conçu avec ❤️ par iTrend</p>
          </div>
        </div>
      </footer>
    </div>
  )

  const landingPages: LandingPage[] = [
    {
      id: 'mutuelle-sante',
      name: 'Mutuelle Santé Express',
      description: 'Landing page optimisée pour la conversion de devis mutuelle santé',
      category: 'Santé',
      template: <MutuelleSanteTemplate />,
      isActive: true
    },
    {
      id: 'assurance-emprunteur',
      name: 'Assurance Emprunteur',
      description: 'Landing page pour simulation assurance emprunteur',
      category: 'Emprunt',
      template: <AssuranceEmprunteurTemplate />,
      isActive: true
    }
  ]

  const renderLandingPageSelector = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sélectionner une Landing Page</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {landingPages.map((page) => (
          <Card 
            key={page.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPage === page.id ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setSelectedPage(page.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{page.name}</h3>
                  <p className="text-gray-600 mb-3">{page.description}</p>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {page.category}
                  </span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  page.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSelectedTemplate = () => {
    const page = landingPages.find(p => p.id === selectedPage)
    if (!page) return null

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{page.name}</h2>
            <p className="text-gray-600">{page.description}</p>
          </div>
          <Button 
            onClick={() => setShowPreview(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir en plein écran
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-500 ml-2">Prévisualisation - {page.name}</span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {page.template}
          </div>
        </div>
      </div>
    )
  }

  if (showPreview) {
    const page = landingPages.find(p => p.id === selectedPage)
    if (!page) return null

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Prévisualisation - {page.name}
          </h1>
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(false)}
          >
            Fermer
          </Button>
        </div>
        {page.template}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎨 Landing Pages Premunia
        </h1>
        <p className="text-lg text-gray-600">
          Créez des pages de conversion charmantes qui respectent votre charte graphique
        </p>
      </div>

      {renderLandingPageSelector()}
      {renderSelectedTemplate()}
    </div>
  )
}
