import { useGetGraphAnalytics, getGetGraphAnalyticsQueryKey, useGetGraphNodes, getGetGraphNodesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, Orbit, AlertTriangle, Lightbulb } from "lucide-react";

export default function KnowledgeGalaxy() {
  const { data: analytics, isLoading: analyticsLoading } = useGetGraphAnalytics({
    query: { queryKey: getGetGraphAnalyticsQueryKey() }
  });

  const { data: nodes, isLoading: nodesLoading } = useGetGraphNodes({
    query: { queryKey: getGetGraphNodesQueryKey() }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold font-sans tracking-tight flex items-center gap-3">
          <Network className="w-8 h-8 text-purple-400" /> Knowledge Galaxy
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">Neural network topology and structural analytics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-28 bg-white/5 rounded-xl" />)
        ) : (
          <>
            <MetricCard title="Network Density" value={analytics?.density ? `${(analytics.density * 100).toFixed(1)}%` : '0%'} />
            <MetricCard title="Constellations" value={analytics?.clusterCount} />
            <MetricCard title="Orphan Nodes" value={analytics?.orphanCount} color="text-destructive" />
            <MetricCard title="Connectivity" value={analytics?.connectivity ? analytics.connectivity.toFixed(2) : '0'} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Orbit className="w-5 h-5 text-purple-400" /> Supermassive Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
               <Skeleton className="h-40 bg-white/5 rounded-lg" />
            ) : analytics?.topNodes?.length ? (
              <div className="space-y-3">
                {analytics.topNodes.map(node => (
                  <div key={node.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="font-medium text-sm truncate pr-4">{node.label}</span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-mono shrink-0">W: {node.weight}</Badge>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground text-sm font-mono p-4 text-center">Insufficient gravity data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" /> Emerging Nebulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
               <Skeleton className="h-40 bg-white/5 rounded-lg" />
            ) : analytics?.emergingTopics?.length ? (
              <div className="flex flex-wrap gap-2">
                {analytics.emergingTopics.map((topic, i) => (
                  <Badge key={i} className="bg-accent/20 text-accent hover:bg-accent/30 text-sm py-1.5 px-3 border border-accent/20 cosmic-glow-cyan">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground text-sm font-mono p-4 text-center">No emerging topics detected yet.</p>
            )}
            
            {analytics?.knowledgeGaps && analytics.knowledgeGaps.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Structural Voids
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analytics.knowledgeGaps.map((gap, i) => (
                    <Badge key={i} variant="outline" className="border-destructive/30 text-destructive/80 text-xs border-dashed">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Node List Fallback (since we don't have a real vis library here, we list them nicely) */}
      <Card className="glass-panel mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-mono">Raw Node Data</CardTitle>
        </CardHeader>
        <CardContent>
           {nodesLoading ? (
               <Skeleton className="h-20 bg-white/5 rounded-lg" />
           ) : nodes?.nodes?.length ? (
             <div className="flex flex-wrap gap-2">
               {nodes.nodes.slice(0, 50).map(n => (
                 <div key={n.id} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 flex items-center gap-2 cursor-default hover:bg-white/10">
                   <div className="w-2 h-2 rounded-full bg-primary/50" />
                   <span className="max-w-[150px] truncate">{n.label}</span>
                 </div>
               ))}
               {nodes.nodes.length > 50 && <span className="text-xs text-muted-foreground py-1 px-2">+ {nodes.nodes.length - 50} more</span>}
             </div>
           ) : (
             <p className="text-muted-foreground text-sm font-mono">No nodes identified.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, color = "text-primary" }: { title: string, value?: number | string, color?: string }) {
  return (
    <Card className="bg-black/20 border-white/5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
         <Orbit className="w-16 h-16 -mr-4 -mt-4" />
      </div>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold font-sans ${color}`}>{value ?? 0}</p>
      </CardContent>
    </Card>
  )
}
