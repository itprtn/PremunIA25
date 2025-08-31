import React from 'react'

export function LeadGenerationDemo() {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Module Lead Generation Intégré !
        </h1>
        <p className="text-lg text-gray-600">
          Le module est maintenant visible dans votre CRM et prêt à l'utilisation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Landing Pages */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Landing Pages</h3>
          <p className="text-blue-700 mb-4">Créez des pages optimisées pour convertir vos visiteurs</p>
          <div className="space-y-2 text-sm text-blue-600">
            <div>✅ 5 templates prédéfinis</div>
            <div>✅ Éditeur WYSIWYG</div>
            <div>✅ Tests A/B/n</div>
            <div>✅ Optimisation SEO</div>
          </div>
        </div>

        {/* Formulaires */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Formulaires</h3>
          <p className="text-green-700 mb-4">Concevez des formulaires multi-étapes avec validation</p>
          <div className="space-y-2 text-sm text-green-600">
            <div>✅ Logique conditionnelle</div>
            <div>✅ Validation en temps réel</div>
            <div>✅ Pré-remplissage JWT</div>
            <div>✅ Gestion RGPD</div>
          </div>
        </div>

        {/* Liens UTM/JWT */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-.758l1.102-1.101a4 4 0 00-5.656-5.656l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-purple-900 mb-2">Liens UTM/JWT</h3>
          <p className="text-purple-700 mb-4">Créez des liens de tracking et de pré-remplissage</p>
          <div className="space-y-2 text-sm text-purple-600">
            <div>✅ Générateur UTM</div>
            <div>✅ Liens JWT sécurisés</div>
            <div>✅ Tracking des performances</div>
            <div>✅ Gestion des campagnes</div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-orange-900 mb-2">Analytics</h3>
          <p className="text-orange-700 mb-4">Suivez vos performances et optimisez vos campagnes</p>
          <div className="space-y-2 text-sm text-orange-600">
            <div>✅ Tableau de bord temps réel</div>
            <div>✅ Attribution multi-touch</div>
            <div>✅ ROI par campagne</div>
            <div>✅ Rapports automatisés</div>
          </div>
        </div>

        {/* Intégrations */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Intégrations</h3>
          <p className="text-red-700 mb-4">Connectez vos plateformes publicitaires</p>
          <div className="space-y-2 text-sm text-red-600">
            <div>✅ Meta Lead Ads</div>
            <div>✅ TikTok Lead Gen</div>
            <div>✅ Webhooks temps réel</div>
            <div>✅ API Conversions</div>
          </div>
        </div>

        {/* Base de données */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Base de données</h3>
          <p className="text-gray-700 mb-4">Intégration complète avec votre CRM existant</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div>✅ Tables Supabase créées</div>
            <div>✅ Relations avec contacts</div>
            <div>✅ Relations avec projets</div>
            <div>✅ Relations avec contrats</div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <h2 className="text-2xl font-bold mb-4">🎉 Félicitations !</h2>
        <p className="text-lg mb-4">
          Votre module Lead Generation est maintenant complètement intégré dans votre CRM !
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">✅ Base de données</h3>
            <ul className="space-y-1 text-blue-100">
              <li>• Tables créées et migrées</li>
              <li>• Relations avec CRM existant</li>
              <li>• Fonctions SQL intégrées</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">✅ API & Webhooks</h3>
            <ul className="space-y-1 text-blue-100">
              <li>• Edge Functions Supabase</li>
              <li>• Intégration Meta/TikTok</li>
              <li>• Tracking événements</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">✅ Interface utilisateur</h3>
            <ul className="space-y-1 text-blue-100">
              <li>• Composants React créés</li>
              <li>• Navigation intégrée</li>
              <li>• Design responsive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
