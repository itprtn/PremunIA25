import React from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}
import { Button } from '../ui/button'
import { FileText, Download } from 'lucide-react'

export interface ReportData {
  title: string
  period: string
  generatedAt: string
  summary: {
    totalRevenue?: number
    totalCommissions?: number
    totalContracts?: number
    totalProjects?: number
    conversionRate?: number
  }
  charts?: Array<{
    title: string
    data: any[]
    type: 'bar' | 'line' | 'pie' | 'table'
  }>
  tables?: Array<{
    title: string
    headers: string[]
    rows: string[][]
  }>
  insights?: string[]
}

interface PDFExporterProps {
  reportData: ReportData
  filename?: string
  variant?: 'outline' | 'default'
  size?: 'sm' | 'default'
}

export function PDFExporter({ 
  reportData, 
  filename = 'rapport-analytics', 
  variant = 'outline',
  size = 'default' 
}: PDFExporterProps) {
  
  const generatePDF = async () => {
    try {
      // Initialiser le PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 20
      let currentY = margin

      // Helper pour vérifier l'espace restant
      const checkPageSpace = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
        }
      }

      // Helper pour ajouter du texte avec retour à la ligne
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize)
        const textLines = pdf.splitTextToSize(text, maxWidth)
        pdf.text(textLines, x, y)
        return y + (textLines.length * fontSize * 0.35) // Retourne la nouvelle position Y
      }

      // En-tête du rapport
      pdf.setFillColor(59, 130, 246) // Bleu
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PREMUNIA IA', margin, 20)
      
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(reportData.title, margin, 30)

      currentY = 50

      // Informations du rapport
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.text(`Période: ${reportData.period}`, margin, currentY)
      pdf.text(`Généré le: ${reportData.generatedAt}`, pageWidth - margin - 50, currentY)
      currentY += 10

      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 15

      // Résumé exécutif
      checkPageSpace(40)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RÉSUMÉ EXÉCUTIF', margin, currentY)
      currentY += 10

      if (reportData.summary) {
        const summaryData = []
        
        if (reportData.summary.totalRevenue) {
          summaryData.push(['Chiffre d\'affaires total', `${(reportData.summary.totalRevenue / 1000).toFixed(0)}k€`])
        }
        if (reportData.summary.totalCommissions) {
          summaryData.push(['Commissions totales', `${(reportData.summary.totalCommissions / 1000).toFixed(0)}k€`])
        }
        if (reportData.summary.totalContracts) {
          summaryData.push(['Nombre de contrats', reportData.summary.totalContracts.toString()])
        }
        if (reportData.summary.totalProjects) {
          summaryData.push(['Nombre de projets', reportData.summary.totalProjects.toString()])
        }
        if (reportData.summary.conversionRate) {
          summaryData.push(['Taux de conversion', `${reportData.summary.conversionRate.toFixed(1)}%`])
        }

        pdf.autoTable({
          startY: currentY,
          head: [['Métrique', 'Valeur']],
          body: summaryData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 }
        })

        currentY = pdf.lastAutoTable.finalY + 15
      }

      // Tables de données
      if (reportData.tables && reportData.tables.length > 0) {
        for (const table of reportData.tables) {
          checkPageSpace(30 + (table.rows.length * 8))
          
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(table.title, margin, currentY)
          currentY += 10

          pdf.autoTable({
            startY: currentY,
            head: [table.headers],
            body: table.rows,
            theme: 'grid',
            headStyles: { 
              fillColor: [16, 185, 129], // Vert
              textColor: [255, 255, 255]
            },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: margin, right: margin },
            styles: { 
              fontSize: 9,
              cellPadding: 3
            }
          })

          currentY = pdf.lastAutoTable.finalY + 15
        }
      }

      // Insights et recommandations
      if (reportData.insights && reportData.insights.length > 0) {
        checkPageSpace(30 + (reportData.insights.length * 15))
        
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('INSIGHTS & RECOMMANDATIONS', margin, currentY)
        currentY += 10

        reportData.insights.forEach((insight, index) => {
          checkPageSpace(15)
          
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          
          // Puce
          pdf.circle(margin + 2, currentY - 2, 1, 'F')
          
          // Texte de l'insight
          currentY = addWrappedText(insight, margin + 8, currentY, pageWidth - margin - 30, 10)
          currentY += 5
        })
      }

      // Note de bas de page
      const footerY = pageHeight - 15
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text('Rapport généré par Premunia IA - Confidentiel', margin, footerY)
      pdf.text(`Page 1/${pdf.getNumberOfPages()}`, pageWidth - margin - 20, footerY)

      // Télécharger le PDF
      const timestamp = new Date().toISOString().split('T')[0]
      pdf.save(`${filename}-${timestamp}.pdf`)

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    }
  }

  return (
    <Button 
      onClick={generatePDF}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <FileText className="w-4 h-4" />
      Export PDF
    </Button>
  )
}

// Hook pour préparer les données de rapport
export const useReportData = () => {
  const prepareCommissionReport = (commissionAnalytics: any, period: string) => {
    // Vérifications de sécurité pour éviter les erreurs undefined
    const safeAnalytics = {
      totalCommissionsAnnee1: commissionAnalytics?.totalCommissionsAnnee1 || 0,
      nombreContrats: commissionAnalytics?.nombreContrats || 0,
      tauxCommissionMoyen: commissionAnalytics?.tauxCommissionMoyen || 0,
      topCommerciaux: commissionAnalytics?.topCommerciaux || [],
      topCompagnies: commissionAnalytics?.topCompagnies || [],
      projectionAnnuelle: commissionAnalytics?.projectionAnnuelle || 0,
      croissanceMensuelle: commissionAnalytics?.croissanceMensuelle || 0,
      valeurVieClient: commissionAnalytics?.valeurVieClient || 0,
      potentielRecurrentTotal: commissionAnalytics?.potentielRecurrentTotal || 0
    }

    const reportData: ReportData = {
      title: 'Rapport d\'Analytics des Commissions',
      period,
      generatedAt: new Date().toLocaleDateString('fr-FR'),
      summary: {
        totalCommissions: safeAnalytics.totalCommissionsAnnee1,
        totalContracts: safeAnalytics.nombreContrats,
        conversionRate: safeAnalytics.tauxCommissionMoyen
      },
      tables: [],
      insights: [
        `Total commissions année 1: ${safeAnalytics.totalCommissionsAnnee1.toFixed(0)}€`,
        `Nombre de contrats: ${safeAnalytics.nombreContrats}`,
        `Taux de commission moyen: ${safeAnalytics.tauxCommissionMoyen.toFixed(1)}%`,
        'Rapport basé sur les calculs du CommissionService fiable'
      ]
    }

    // Ajouter les tables seulement si les données existent
    if (safeAnalytics.topCommerciaux && safeAnalytics.topCommerciaux.length > 0) {
      reportData.tables?.push({
        title: 'Performance des Commerciaux',
        headers: ['Commercial', 'Contrats', 'Commissions (€)', 'Taux (%)', 'Produits'],
        rows: safeAnalytics.topCommerciaux.slice(0, 10).map((c: any) => [
          c.commercial || 'N/A',
          (c.contrats || 0).toString(),
          (c.commissionsAnnee1 || 0).toFixed(0),
          (c.tauxCommission || 0).toFixed(1),
          (c.produitsCount || 0).toString()
        ])
      })
    }

    if (safeAnalytics.topCompagnies && safeAnalytics.topCompagnies.length > 0) {
      reportData.tables?.push({
        title: 'Performance des Compagnies',
        headers: ['Compagnie', 'Contrats', 'Commissions (€)', 'Taux (%)'],
        rows: safeAnalytics.topCompagnies.slice(0, 10).map((c: any) => [
          c.compagnie || 'N/A',
          (c.contrats || 0).toString(),
          (c.commissions || 0).toFixed(0),
          (c.tauxCommission || 0).toFixed(1)
        ])
      })
    }

    return reportData
  }

  const prepareEmailReport = (emailAnalytics: any, period: string) => {
    const reportData: ReportData = {
      title: 'Rapport d\'Analytics Email Marketing',
      period,
      generatedAt: new Date().toLocaleDateString('fr-FR'),
      summary: {
        totalContracts: emailAnalytics.totalSent
      },
      tables: [
        {
          title: 'Métriques de Performance Email',
          headers: ['Métrique', 'Valeur', 'Benchmark', 'Statut'],
          rows: [
            ['Taux de livraison', `${emailAnalytics.deliveryRate.toFixed(1)}%`, `${emailAnalytics.benchmarks.deliveryRate}%`, 
             emailAnalytics.deliveryRate >= emailAnalytics.benchmarks.deliveryRate ? '✓' : '✗'],
            ['Taux d\'ouverture', `${emailAnalytics.openRate.toFixed(1)}%`, `${emailAnalytics.benchmarks.openRate}%`,
             emailAnalytics.openRate >= emailAnalytics.benchmarks.openRate ? '✓' : '✗'],
            ['Taux de clic', `${emailAnalytics.clickRate.toFixed(2)}%`, `${emailAnalytics.benchmarks.clickRate}%`,
             emailAnalytics.clickRate >= emailAnalytics.benchmarks.clickRate ? '✓' : '✗'],
            ['Taux de rebond', `${emailAnalytics.bounceRate.toFixed(2)}%`, `${emailAnalytics.benchmarks.bounceRate}%`,
             emailAnalytics.bounceRate <= emailAnalytics.benchmarks.bounceRate ? '✓' : '✗']
          ]
        },
        {
          title: 'Performance par Type de Campagne',
          headers: ['Type', 'Envoyés', 'Ouverts (%)', 'Clics (%)'],
          rows: emailAnalytics.performanceByType.map((p: any) => [
            p.type,
            p.sent.toString(),
            p.openRate.toFixed(1),
            p.clickRate.toFixed(2)
          ])
        }
      ],
      insights: [
        `Score de santé global: ${emailAnalytics.healthScore}/100`,
        `Total emails envoyés: ${emailAnalytics.totalSent.toLocaleString()}`,
        `Taux d'engagement moyen: ${emailAnalytics.clickToOpenRate.toFixed(1)}%`,
        emailAnalytics.healthScore >= 80 ? 'Performance excellente - Continuez!' : 
        emailAnalytics.healthScore >= 60 ? 'Performance correcte - Optimisations possibles' :
        'Performance à améliorer - Actions correctives nécessaires'
      ]
    }
    return reportData
  }

  const prepareRevenueReport = (revenueData: any, period: string) => {
    const reportData: ReportData = {
      title: 'Rapport d\'Analytics des Revenus',
      period,
      generatedAt: new Date().toLocaleDateString('fr-FR'),
      summary: {
        totalRevenue: revenueData.totalRevenue
      },
      insights: [
        'Analyse des revenus par période sélectionnée',
        'Projection basée sur les tendances actuelles',
        'Recommandations pour optimiser les performances'
      ]
    }
    return reportData
  }

  return {
    prepareCommissionReport,
    prepareEmailReport,
    prepareRevenueReport
  }
}
