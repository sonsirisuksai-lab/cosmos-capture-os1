import { useState } from "react";
import { 
  useListNotes, getListNotesQueryKey,
  useGetStarredNotes, getGetStarredNotesQueryKey,
  useToggleNoteStar,
  useCreateNote,
  useDeleteNote,
  useUpdateNote,
  useGetNote, getGetNoteQueryKey,
  useGetRecentNotes, getGetRecentNotesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, Star, Plus, Trash2, Tag, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KnowledgeVault() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notes, isLoading: notesLoading } = useListNotes(
    { search: search || undefined },
    { query: { queryKey: getListNotesQueryKey({ search: search || undefined }) } }
  );

  const { data: starredNotes, isLoading: starredLoading } = useGetStarredNotes({
    query: { queryKey: getGetStarredNotesQueryKey() }
  });

  const { data: recentNotes, isLoading: recentLoading } = useGetRecentNotes(
    { limit: 5 },
    { query: { queryKey: getGetRecentNotesQueryKey({ limit: 5 }) } }
  );

  const { data: selectedNote } = useGetNote(
    selectedNoteId as number,
    { query: { enabled: !!selectedNoteId, queryKey: getGetNoteQueryKey(selectedNoteId as number) } }
  );

  // Update edit form when note loads
  if (selectedNote && isEditOpen && editTitle === "" && editContent === "") {
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
  }

  const toggleStar = useToggleNoteStar({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStarredNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });
      }
    }
  });

  const createNote = useCreateNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });
        setIsCreateOpen(false);
        setNewTitle("");
        setNewContent("");
        toast({ title: "Note captured successfully" });
      }
    }
  });

  const updateNote = useUpdateNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStarredNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });
        setIsEditOpen(false);
        setSelectedNoteId(null);
        setEditTitle("");
        setEditContent("");
        toast({ title: "Note parameters updated" });
      }
    }
  });

  const deleteNote = useDeleteNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStarredNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentNotesQueryKey() });
        toast({ title: "Note obliterated" });
      }
    }
  });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createNote.mutate({ data: { title: newTitle, content: newContent } });
  };

  const handleUpdate = () => {
    if (!selectedNoteId || !editTitle.trim()) return;
    updateNote.mutate({ id: selectedNoteId, data: { title: editTitle, content: editContent } });
  };

  const openEdit = (id: number) => {
    setSelectedNoteId(id);
    setEditTitle("");
    setEditContent("");
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight">Knowledge Vault</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Archived thought sequences.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search database..." 
              className="pl-9 bg-card/50 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-notes"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="cosmic-glow shrink-0" data-testid="button-create-note">
                <Plus className="w-4 h-4 mr-2" /> Capture
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>New Neural Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  placeholder="Designation / Title" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-black/20"
                />
                <textarea 
                  className="w-full min-h-[150px] p-3 rounded-md bg-black/20 border border-input focus:outline-none focus:ring-1 focus:ring-ring text-sm resize-none"
                  placeholder="Content parameters..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Button 
                  className="w-full cosmic-glow" 
                  onClick={handleCreate}
                  disabled={createNote.isPending || !newTitle.trim()}
                >
                  {createNote.isPending ? "Transmitting..." : "Save to Vault"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Starred Section */}
      {!search && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Constellations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredLoading ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />)
            ) : starredNotes?.length ? (
              starredNotes.map(note => (
                <Card key={note.id} className="glass-panel border-yellow-500/20 hover:border-yellow-500/50 transition-colors">
                  <CardHeader className="pb-2 flex flex-row justify-between items-start">
                    <CardTitle className="text-base leading-tight truncate">{note.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 -mt-1 -mr-1" 
                      onClick={() => toggleStar.mutate({ id: note.id })}
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground font-mono">No starred constellations found.</p>
            )}
          </div>
        </section>
      )}

      {/* All Notes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data Core</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notesLoading ? (
             [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 bg-white/5 rounded-xl" />)
          ) : notes?.length ? (
            notes.map(note => (
              <Card key={note.id} className="glass-panel hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-2 flex flex-row justify-between items-start gap-4">
                  <CardTitle className="text-base leading-tight line-clamp-1 flex-1">{note.title}</CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => openEdit(note.id)}
                    >
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => deleteNote.mutate({ id: note.id })}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => toggleStar.mutate({ id: note.id })}
                    >
                      <Star className={`w-4 h-4 ${note.starred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                </CardContent>
                {note.tags && note.tags.length > 0 && (
                  <CardFooter className="pt-0 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-white/5 hover:bg-white/10 font-mono">
                        <Tag className="w-3 h-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
             <p className="text-sm text-muted-foreground font-mono">No matching records found.</p>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if(!open) setSelectedNoteId(null); }}>
        <DialogContent className="glass-panel sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Modify Neural Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input 
              placeholder="Designation / Title" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-black/20"
            />
            <textarea 
              className="w-full min-h-[150px] p-3 rounded-md bg-black/20 border border-input focus:outline-none focus:ring-1 focus:ring-ring text-sm resize-none"
              placeholder="Content parameters..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-white/10">Cancel</Button>
              <Button 
                className="cosmic-glow bg-accent text-black hover:bg-accent/80" 
                onClick={handleUpdate}
                disabled={updateNote.isPending || !editTitle.trim()}
              >
                {updateNote.isPending ? "Syncing..." : "Update Vault"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
