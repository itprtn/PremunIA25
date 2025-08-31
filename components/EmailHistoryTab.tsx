import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface EmailHistory {
  id: number
  destinataire: string
  sujet: string
  statut: string
  date_envoi: string
  date_ouverture?: string
  date_clic?: string
  campagne_nom?: string
  projet_nom?: string
}

interface EmailHistoryStats {
  totalEmails: number
  latestEmailDate: string | null
  totalCampaigns: number
}

interface EmailHistoryTabProps {
  emailHistory: EmailHistory[]
  emailHistoryStats: EmailHistoryStats
}

export function EmailHistoryTab({ emailHistory, emailHistoryStats }: EmailHistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Email History Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total d'emails</p>
                <p className="text-3xl font-bold">{emailHistoryStats.totalEmails}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-envelope text-blue-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernier email</p>
                <p className="text-lg font-bold">
                  {emailHistoryStats.latestEmailDate
                    ? new Date(emailHistoryStats.latestEmailDate).toLocaleDateString('fr-FR')
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-green-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes actives</p>
                <p className="text-3xl font-bold">{emailHistoryStats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-bullhorn text-purple-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-history text-blue-600"></i>
            Historique des emails récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Destinataire</th>
                      <th className="text-left p-2 font-medium">Sujet</th>
                      <th className="text-left p-2 font-medium">Statut</th>
                      <th className="text-left p-2 font-medium">Campagne</th>
                      <th className="text-left p-2 font-medium">Date d'envoi</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailHistory.slice(0, 20).map((email) => (
                      <tr key={email.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{email.destinataire}</div>
                        </td>
                        <td className="p-2">
                          <div className="max-w-xs truncate" title={email.sujet}>
                            {email.sujet}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              email.statut === 'delivre' ? 'default' :
                              email.statut === 'ouvert' ? 'secondary' :
                              email.statut === 'clic' ? 'outline' :
                              'destructive'
                            }
                            className={
                              email.statut === 'delivre' ? 'bg-green-100 text-green-800' :
                              email.statut === 'ouvert' ? 'bg-blue-100 text-blue-800' :
                              email.statut === 'clic' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {email.statut === 'delivre' ? 'Délivré' :
                             email.statut === 'ouvert' ? 'Ouvert' :
                             email.statut === 'clic' ? 'Clic' :
                             'Bounce'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="text-sm text-muted-foreground">
                            {email.campagne_nom || 'N/A'}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            {new Date(email.date_envoi).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-eye text-gray-600"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-reply text-gray-600"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-muted-foreground">Aucun email dans l'historique</p>
              </div>
            )}

            {emailHistory.length > 20 && (
              <div className="text-center pt-4">
                <Button variant="outline">
                  <i className="fas fa-chevron-down mr-2"></i>
                  Voir plus d'emails ({emailHistory.length - 20} restants)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Actions rapides</h4>
              <i className="fas fa-bolt text-yellow-600"></i>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <i className="fas fa-plus mr-2"></i>
                Nouvelle campagne
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <i className="fas fa-users mr-2"></i>
                Importer contacts
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <i className="fas fa-chart-bar mr-2"></i>
                Rapport détaillé
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Statuts récents</h4>
              <i className="fas fa-chart-pie text-green-600"></i>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Délivrés</span>
                <span className="font-medium">
                  {emailHistory.filter(e => e.statut === 'delivre').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ouverts</span>
                <span className="font-medium">
                  {emailHistory.filter(e => e.statut === 'ouvert').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clics</span>
                <span className="font-medium">
                  {emailHistory.filter(e => e.statut === 'clic').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bounces</span>
                <span className="font-medium">
                  {emailHistory.filter(e => e.statut === 'bounce').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Intégration Brevo</h4>
              <i className="fas fa-link text-blue-600"></i>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Status</span>
                <Badge className="bg-green-100 text-green-800">Connecté</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dernière sync</span>
                <span className="text-muted-foreground">Il y a 2 min</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <i className="fas fa-sync-alt mr-2"></i>
                Synchroniser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}