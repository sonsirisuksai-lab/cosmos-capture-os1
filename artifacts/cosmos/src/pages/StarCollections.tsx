import { useState } from "react";
import { 
  useListCollections, getListCollectionsQueryKey,
  useCreateCollection, useDeleteCollection
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Plus, Trash2, Hexagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StarCollections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#8a2be2"); // Default primary

  const { data: collections, isLoading } = useListCollections({
    query: { queryKey: getListCollectionsQueryKey() }
  });

  const createCol = useCreateCollection({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        setIsCreateOpen(false);
        setNewName("");
        setNewDesc("");
        toast({ title: "Collection initialized" });
      }
    }
  });

  const deleteCol = useDeleteCollection({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        toast({ title: "Collection collapsed" });
      }
    }
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCol.mutate({ data: { name: newName, description: newDesc, color: newColor } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" /> Star Collections
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Curated clusters of knowledge.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="cosmic-glow shrink-0">
              <Plus className="w-4 h-4 mr-2" /> New Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Initialize Knowledge Cluster</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="Cluster Designation" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-black/20"
              />
              <Input 
                placeholder="Description / Purpose" 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="bg-black/20"
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground">Aura Color:</span>
                <input 
                  type="color" 
                  value={newColor} 
                  onChange={e => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                />
              </div>
              <Button 
                className="w-full cosmic-glow" 
                onClick={handleCreate}
                disabled={createCol.isPending || !newName.trim()}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-48 bg-white/5 rounded-xl" />)
        ) : collections?.length ? (
          collections.map(col => (
            <Card key={col.id} className="glass-panel group overflow-hidden relative border-white/5 hover:border-white/20 transition-all duration-300">
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ backgroundColor: col.color || 'hsl(var(--primary))' }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Hexagon className="w-8 h-8 opacity-20" style={{ color: col.color || 'hsl(var(--primary))' }} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteCol.mutate({ id: col.id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl mt-2 truncate">{col.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {col.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t border-white/5 mt-4">
                <div className="w-full flex justify-between items-center mt-4">
                  <span className="text-xs font-mono text-muted-foreground">ENTRIES</span>
                  <span className="font-mono font-bold" style={{ color: col.color || 'hsl(var(--primary))' }}>
                    {col.noteCount}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-mono text-sm">No collections initialized.</p>
          </div>
        )}
      </div>
    </div>
  );
}
