import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Tabs defaultValue="revenue" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="revenue">Analyse des Revenus</TabsTrigger>
        <TabsTrigger value="products">Analyse Produits</TabsTrigger>
        <TabsTrigger value="pipeline">Analyse du Pipeline</TabsTrigger>
      </TabsList>
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
