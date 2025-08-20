import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CommercialPerformanceAnalytics } from './analytics/CommercialPerformanceAnalytics';
import { RevenueAnalytics } from './analytics/RevenueAnalytics';
import { ProductAnalytics } from './analytics/ProductAnalytics';
import { PipelineAnalytics } from './analytics/PipelineAnalytics';
import { Contact, Projet, Contrat } from '../lib/types';

interface CommercialAnalyticsProps {
  contacts: Contact[];
  projets: Projet[];
  contrats: Contrat[];
}

export function CommercialAnalytics({ contacts = [], projets = [], contrats = [] }: CommercialAnalyticsProps) {
  return (
    <Tabs defaultValue="performance" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="performance">Performance Commerciale</TabsTrigger>
        <TabsTrigger value="revenue">Analyse des Revenus</TabsTrigger>
        <TabsTrigger value="products">Analyse Produits</TabsTrigger>
        <TabsTrigger value="pipeline">Analyse du Pipeline</TabsTrigger>
      </TabsList>
      <TabsContent value="performance">
        <CommercialPerformanceAnalytics contacts={contacts} projets={projets} contrats={contrats} />
      </TabsContent>
      <TabsContent value="revenue">
        <RevenueAnalytics projets={projets} contrats={contrats} />
      </TabsContent>
      <TabsContent value="products">
        <ProductAnalytics projets={projets} contrats={contrats} />
      </TabsContent>
      <TabsContent value="pipeline">
        <PipelineAnalytics projets={projets} contrats={contrats} />
      </TabsContent>
    </Tabs>
  );
}
