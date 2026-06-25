import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey, useCreateTimelineEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Clock, Tag, Orbit, FileText, Bot, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function EventStream() {
  const [filterType, setFilterType] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("manual_log");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: timeline, isLoading } = useGetTimeline(
    { limit: 50, type: filterType },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 50, type: filterType }) } }
  );

  const createEvent = useCreateTimelineEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
        setIsCreateOpen(false);
        setNewTitle("");
        setNewDesc("");
        toast({ title: "Event logged to stream" });
      }
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'note_created': return <FileText className="w-4 h-4 text-green-400" />;
      case 'orchestration': return <Bot className="w-4 h-4 text-primary" />;
      case 'tag_added': return <Tag className="w-4 h-4 text-accent" />;
      default: return <Orbit className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getFilterColor = (type?: string) => {
    if (filterType === type) return "bg-primary text-primary-foreground";
    return "bg-black/40 text-muted-foreground hover:bg-white/10";
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createEvent.mutate({ data: { type: newType, title: newTitle, description: newDesc } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary opacity-80" /> Event Stream
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Chronological record of system events.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className={`cursor-pointer px-3 py-1 ${getFilterColor()}`}
            onClick={() => setFilterType(undefined)}
          >
            ALL
          </Badge>
          <Badge 
            variant="outline" 
            className={`cursor-pointer px-3 py-1 font-mono ${getFilterColor('orchestration')}`}
            onClick={() => setFilterType('orchestration')}
          >
            AI_SYNC
          </Badge>
          <Badge 
            variant="outline" 
            className={`cursor-pointer px-3 py-1 font-mono ${getFilterColor('note_created')}`}
            onClick={() => setFilterType('note_created')}
          >
            CAPTURE
          </Badge>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="ml-2 border-white/10 bg-white/5 font-mono text-xs">
                <Plus className="w-3 h-3 mr-1" /> Log
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel">
              <DialogHeader>
                <DialogTitle>Manual Log Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  placeholder="Event Title" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-black/20"
                />
                <Input 
                  placeholder="Description" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-black/20"
                />
                <Button 
                  className="w-full cosmic-glow" 
                  onClick={handleCreate}
                  disabled={createEvent.isPending || !newTitle.trim()}
                >
                  Append to Stream
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="relative pl-6 md:pl-8 space-y-8">
        {/* Continuous vertical line */}
        <div className="absolute top-0 bottom-0 left-[15px] md:left-[19px] w-px bg-white/10" />

        {isLoading ? (
          [1,2,3,4,5].map(i => (
            <div key={i} className="relative">
              <div className="absolute -left-10 md:-left-[2.1rem] w-6 h-6 rounded-full bg-background border-2 border-white/10 flex items-center justify-center z-10" />
              <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
            </div>
          ))
        ) : timeline?.length ? (
          timeline.map((event, i) => (
            <div key={event.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[30px] md:-left-[35px] w-8 h-8 rounded-full bg-background border border-white/20 flex items-center justify-center z-10 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                {getIconForType(event.type)}
              </div>
              
              <Card className="glass-panel border-white/5 hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">{event.title}</span>
                      {event.agentName && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0 bg-primary/20 text-primary">
                          {event.agentName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <div className="shrink-0 text-xs font-mono text-muted-foreground md:text-right flex items-center md:items-start md:flex-col gap-2">
                    <Clock className="w-3 h-3 md:hidden" />
                    <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                    <span className="opacity-50">{new Date(event.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-black/20 relative z-10">
            <p className="font-mono text-sm">No events recorded in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
}
