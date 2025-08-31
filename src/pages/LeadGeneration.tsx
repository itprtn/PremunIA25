import React, { useState } from 'react'
import { Layout } from '@/components/Layout'
import { LeadGenerationDemo } from '@/components/LeadGenerationDemo'
import LeadDashboard from '@/components/LeadDashboard'
import { PremuniaLandingPages } from '@/components/PremuniaLandingPages'
import LandingPageBuilder from '@/components/LandingPageBuilder'
import FormEngine from '@/components/FormEngine'
import UTMLinkGenerator from '@/components/UTMLinkGenerator'
import Integrations from '@/components/Integrations'

export default function LeadGenerationPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const quickStats = [
    { label: 'Leads ce mois', value: '2,847', change: '+12%', trend: 'up' },
    { label: 'Taux de conversion', value: '14.2%', change: '+2.1%', trend: 'up' },
    { label: 'Coût par lead', value: '€8.50', change: '-15%', trend: 'down' },
    { label: 'ROI publicitaire', value: '€4.20', change: '+8%', trend: 'up' }
  ]

  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {quickStats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`flex items-center space-x-1 ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="text-sm font-medium">{stat.change}</span>
              <svg className={`w-4 h-4 ${stat.trend === 'up' ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <button
        onClick={() => setActiveTab('landing-pages')}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left"
      >
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Créer une Landing Page</h3>
        <p className="text-blue-100">Construisez des pages optimisées pour convertir vos visiteurs</p>
      </button>

      <button
        onClick={() => setActiveTab('forms')}
        className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left"
      >
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Créer un Formulaire</h3>
        <p className="text-green-100">Concevez des formulaires multi-étapes avec validation</p>
      </button>

      <button
        onClick={() => setActiveTab('integrations')}
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left"
      >
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Connecter Meta & TikTok</h3>
        <p className="text-orange-100">Activez les webhooks et les clés d'API</p>
      </button>
    </div>
  )

  const renderMainContent = () => {
    switch (activeTab) {
      case 'demo':
        return <LeadGenerationDemo />
      case 'dashboard':
        return <LeadDashboard />
      case 'landing-pages':
        return <PremuniaLandingPages />
      case 'forms':
        return <FormEngine />
      case 'utm-links':
        return <UTMLinkGenerator />
      case 'integrations':
        return <Integrations />
      default:
        return <LeadGenerationDemo />
    }
  }

  const tabs = [
    { id: 'demo', name: 'Démonstration', icon: '🎯' },
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊' },
    { id: 'landing-pages', name: 'Landing Pages', icon: '🏠' },
    { id: 'forms', name: 'Formulaires', icon: '📝' },
    { id: 'utm-links', name: 'Liens UTM/JWT', icon: '🔗' },
    { id: 'integrations', name: 'Intégrations (Meta/TikTok)', icon: '⚙️' },
  ]

  return (
    <Layout title="Lead Generation">
      <div className="space-y-8">
        {/* En-tête avec navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        {activeTab === 'dashboard' && renderQuickStats()}

        {/* Actions rapides */}
        {activeTab === 'dashboard' && renderQuickActions()}

        {/* Contenu principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {renderMainContent()}
        </div>
      </div>
    </Layout>
  )
}
