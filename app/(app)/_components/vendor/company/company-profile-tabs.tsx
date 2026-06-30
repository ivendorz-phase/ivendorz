"use client";

// Tabbed Company Profile surface (companion §4: S1–S4 all map to (app)/company). Thin client wrapper
// around the kit Tabs; the four section contents are server-rendered and passed in as props (no data,
// no logic here). Reuses the kit Tabs primitive (no duplication).
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface CompanyProfileTabsProps {
  overview: ReactNode;
  identity: ReactNode;
  capabilities: ReactNode;
  financialTier: ReactNode;
}

export function CompanyProfileTabs({
  overview,
  identity,
  capabilities,
  financialTier,
}: CompanyProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="identity">Identity &amp; geography</TabsTrigger>
        <TabsTrigger value="capabilities">Capabilities &amp; capacity</TabsTrigger>
        <TabsTrigger value="financial-tier">Financial tier</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        {overview}
      </TabsContent>
      <TabsContent value="identity" className="mt-4">
        {identity}
      </TabsContent>
      <TabsContent value="capabilities" className="mt-4">
        {capabilities}
      </TabsContent>
      <TabsContent value="financial-tier" className="mt-4">
        {financialTier}
      </TabsContent>
    </Tabs>
  );
}
