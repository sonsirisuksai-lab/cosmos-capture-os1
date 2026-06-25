import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import CommandCenter from "@/pages/CommandCenter";
import KnowledgeVault from "@/pages/KnowledgeVault";
import PromptTerminal from "@/pages/PromptTerminal";
import KnowledgeGalaxy from "@/pages/KnowledgeGalaxy";
import DigitalTwin from "@/pages/DigitalTwin";
import StarCollections from "@/pages/StarCollections";
import EventStream from "@/pages/EventStream";
import UniverseOS from "@/pages/UniverseOS";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={CommandCenter} />
        <Route path="/notes" component={KnowledgeVault} />
        <Route path="/maka" component={PromptTerminal} />
        <Route path="/graph" component={KnowledgeGalaxy} />
        <Route path="/twin" component={DigitalTwin} />
        <Route path="/collections" component={StarCollections} />
        <Route path="/timeline" component={EventStream} />
        <Route path="/universe" component={UniverseOS} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
