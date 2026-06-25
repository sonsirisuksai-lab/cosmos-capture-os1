import { useGetDashboardStats, useGetDashboardActivity, getGetDashboardStatsQueryKey, getGetDashboardActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Star, Activity, Network } from "lucide-react";

export default function CommandCenter() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });
  const { data: activity, isLoading: activityLoading } = useGetDashboardActivity(
    { limit: 10 },
    { query: { queryKey: getGetDashboardActivityQueryKey({ limit: 10 }) } }
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-sans tracking-tight mb-2">Command Center</h1>
        <p className="text-muted-foreground font-mono text-sm">System status: Optimal. Awaiting directives.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Notes" 
          value={stats?.totalNotes} 
          icon={<Brain className="w-5 h-5 text-primary" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Starred Ideas" 
          value={stats?.starredNotes} 
          icon={<Star className="w-5 h-5 text-yellow-500" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="AI Interactions" 
          value={stats?.totalInteractions} 
          icon={<Activity className="w-5 h-5 text-accent" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Graph Density" 
          value={stats?.graphDensity ? `${(stats.graphDensity * 100).toFixed(1)}%` : undefined} 
          icon={<Network className="w-5 h-5 text-purple-500" />} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <Card className="lg:col-span-2 glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-lg" />)}
              </div>
            ) : activity?.length ? (
              <div className="space-y-4">
                {activity.map(item => (
                  <div key={item.id} className="flex gap-4 items-start p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">
                      {item.agentEmoji || "🤖"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                        <span className="text-primary font-mono">{item.agentName}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-white/10 rounded-lg">
                No recent activity. Initiate a thought sequence.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Domains */}
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-mono">Top Domains</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
               <div className="space-y-3">
                 {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full bg-white/5 rounded-md" />)}
               </div>
            ) : stats?.topDomains?.length ? (
              <div className="space-y-3">
                {stats.topDomains.map((domain, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                    <span className="text-sm font-medium">{domain.domain}</span>
                    <span className="text-xs font-mono text-muted-foreground">{domain.count} notes</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Insufficient data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string; value?: string | number; icon: React.ReactNode; loading: boolean }) {
  return (
    <Card className="glass-panel border-white/5 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="p-2 rounded-md bg-white/5">{icon}</div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-white/10 rounded" />
        ) : (
          <div className="text-3xl font-bold font-sans tracking-tight">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
