import { useState, useEffect } from "react";
import { useGetTwinProfile, getGetTwinProfileQueryKey, useUpdateTwinProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Zap, BrainCircuit, Target, Save, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DigitalTwin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editFocusAreas, setEditFocusAreas] = useState("");

  const { data: profile, isLoading } = useGetTwinProfile({
    query: { queryKey: getGetTwinProfileQueryKey() }
  });

  const updateProfile = useUpdateTwinProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTwinProfileQueryKey() });
        setIsEditing(false);
        toast({ title: "Twin Identity Synchronized" });
      }
    }
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setEditName(profile.name);
      setEditRole(profile.role || "");
      setEditFocusAreas(profile.focusAreas?.join(", ") || "");
    }
  }, [profile, isEditing]);

  const handleSave = () => {
    updateProfile.mutate({
      data: {
        name: editName,
        role: editRole,
        focusAreas: editFocusAreas.split(",").map(s => s.trim()).filter(Boolean)
      }
    });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!profile) return <div className="text-center p-8 text-destructive">Profile Error: Connection Lost.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-accent" /> Digital Twin Status
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Cybernetic representation of your mind map.</p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/5 border-white/10 font-mono text-xs"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Modify Parameters"}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card className="md:col-span-1 glass-panel border-accent/20 relative overflow-hidden flex flex-col justify-center items-center p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          
          <div className="w-32 h-32 rounded-full border-2 border-accent/50 bg-accent/10 flex items-center justify-center cosmic-glow-cyan mb-6 relative">
            <User className="w-16 h-16 text-accent/80" />
            {profile.energyLevel > 80 && (
              <span className="absolute -bottom-2 right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-3">
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Identity Name" className="text-center font-bold font-mono" />
              <Input value={editRole} onChange={e => setEditRole(e.target.value)} placeholder="Primary Function/Role" className="text-center text-sm" />
              <Button className="w-full mt-4 cosmic-glow-cyan bg-accent text-black hover:bg-accent/80" onClick={handleSave} disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" /> Sync
              </Button>
            </div>
          ) : (
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold font-sans tracking-tight truncate">{profile.name}</h2>
              <p className="text-accent text-sm font-mono mt-1">{profile.role || "Unassigned Function"}</p>
              <div className="mt-4 text-xs text-muted-foreground border-t border-white/10 pt-4 w-full">
                Last Active: {new Date(profile.lastActive).toLocaleString()}
              </div>
            </div>
          )}
        </Card>

        {/* Metrics Grid */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Twin Energy Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={profile.energyLevel} className="h-3 flex-1 bg-white/5" />
                <span className="font-mono font-bold text-yellow-500">{profile.energyLevel}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono opacity-60">Energy determined by recent interactions and captures.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-panel bg-black/40">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-2">
                  <BrainCircuit className="w-4 h-4 text-primary" /> Knowledge Score
                </div>
                <div className="text-4xl font-bold text-primary">{profile.knowledgeScore}</div>
              </CardContent>
            </Card>

            <Card className="glass-panel bg-black/40">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-2">
                  <Target className="w-4 h-4 text-purple-400" /> Dominant Domain
                </div>
                <div className="text-xl font-bold text-purple-400 truncate capitalize">{profile.dominantDomain}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-muted-foreground">Active Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
               {isEditing ? (
                 <Input 
                   value={editFocusAreas} 
                   onChange={e => setEditFocusAreas(e.target.value)} 
                   placeholder="e.g. AI, Space, Code (comma separated)" 
                   className="font-mono text-sm"
                 />
               ) : (
                 <div className="flex flex-wrap gap-2">
                   {profile.focusAreas && profile.focusAreas.length > 0 ? (
                     profile.focusAreas.map((area, i) => (
                       <Badge key={i} variant="outline" className="border-accent/30 text-accent/90 bg-accent/5 px-3 py-1 text-xs">
                         {area}
                       </Badge>
                     ))
                   ) : (
                     <span className="text-sm text-muted-foreground font-mono">No specific focus parameters defined.</span>
                   )}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
