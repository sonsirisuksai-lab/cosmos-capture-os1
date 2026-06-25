import { useEffect, useState } from "react";
import { Globe, Sparkles, Zap, ShieldCheck, AlertTriangle, Plus, RefreshCw, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import type { Universe } from "@/lib/universe/types";
import type { Galaxy } from "@/lib/galaxy/types";
import type { Planet } from "@/lib/planet/types";
import type { LegacyBook } from "@/lib/legacy/types";
import type { Simulation, SimulationType, SimulationTimeframe } from "@/lib/simulation/types";

import { initUniverses, getAllUniverses, switchUniverse, getUniverseStats } from "@/lib/universe/engine";
import { initGalaxies, getAllGalaxies, createGalaxy } from "@/lib/galaxy/engine";
import { getAllPlanets, createPlanet, addXP, completeMilestone, getLevelProgress } from "@/lib/planet/engine";
import { getAllLegacyBooks, generateLegacyBook, exportBookAsMarkdown } from "@/lib/legacy/engine";
import { getAllSimulations, runSimulation, getSimulationIcon } from "@/lib/simulation/engine";

export default function UniverseOS() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [activeUniverse, setActiveUniverse] = useState<Universe | null>(null);
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [legacyBooks, setLegacyBooks] = useState<LegacyBook[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [simRunning, setSimRunning] = useState(false);
  const [simType, setSimType] = useState<SimulationType>("career");
  const [simTimeframe, setSimTimeframe] = useState<SimulationTimeframe>("1y");
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [newPlanetName, setNewPlanetName] = useState("");
  const [newGalaxyName, setNewGalaxyName] = useState("");
  const [showNewPlanet, setShowNewPlanet] = useState(false);
  const [showNewGalaxy, setShowNewGalaxy] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const uList = await initUniverses();
      setUniverses(uList);
      const active = uList.find((u) => u.status === "active") ?? uList[0] ?? null;
      setActiveUniverse(active);

      const nameToId: Record<string, string> = {};
      uList.forEach((u) => { nameToId[u.name.toLowerCase()] = u.id; });

      const gList = await initGalaxies(nameToId);
      setGalaxies(gList);

      const pList = await getAllPlanets();
      setPlanets(pList);

      const bList = await getAllLegacyBooks();
      setLegacyBooks(bList);

      const sList = await getAllSimulations();
      setSimulations(sList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSwitchUniverse = async (id: string) => {
    await switchUniverse(id);
    const updated = await getAllUniverses();
    setUniverses(updated);
    setActiveUniverse(updated.find((u) => u.status === "active") ?? null);
  };

  const handleRunSim = async () => {
    setSimRunning(true);
    const sim = await runSimulation(simType, `${simType} scenario for ${simTimeframe}`, simTimeframe);
    setSimulations((prev) => [sim, ...prev]);
    setSimRunning(false);
  };

  const handleGenerateLegacy = async () => {
    setLegacyLoading(true);
    const book = await generateLegacyBook("Commander");
    setLegacyBooks((prev) => [book, ...prev]);
    setLegacyLoading(false);
  };

  const handleCreatePlanet = async () => {
    if (!newPlanetName.trim() || galaxies.length === 0) return;
    await createPlanet({
      name: newPlanetName.trim(),
      description: "A new planet in my universe",
      icon: "🪐",
      galaxyId: galaxies[0].id,
      status: "seed",
      health: 80,
      stability: 70,
      priority: 3,
      growthRate: 50,
      risk: 20,
      milestones: [],
    });
    setNewPlanetName("");
    setShowNewPlanet(false);
    setPlanets(await getAllPlanets());
  };

  const handleCreateGalaxy = async () => {
    if (!newGalaxyName.trim() || !activeUniverse) return;
    await createGalaxy({
      name: newGalaxyName.trim(),
      description: "A new galaxy",
      icon: "🌌",
      universeId: activeUniverse.id,
      color: "#6366f1",
      order: galaxies.length,
    });
    setNewGalaxyName("");
    setShowNewGalaxy(false);
    setGalaxies(await getAllGalaxies());
  };

  const handleAddXP = async (planetId: string) => {
    await addXP(planetId, 25);
    setPlanets(await getAllPlanets());
  };

  const stats = getUniverseStats(universes);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Globe className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-mono text-sm">Initializing Universe Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            Universe OS
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Active: {activeUniverse?.icon} {activeUniverse?.name ?? "None"} — {activeUniverse?.mood} mode
          </p>
        </div>
        <Button onClick={loadAll} variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Universe Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Universes", value: stats.total, icon: "🌌" },
          { label: "Galaxies", value: galaxies.length, icon: "✨" },
          { label: "Planets", value: planets.length, icon: "🪐" },
          { label: "Simulations", value: simulations.length, icon: "🔮" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="universes" className="w-full">
        <TabsList className="bg-card/40 border border-white/5 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="universes">🌌 Universes</TabsTrigger>
          <TabsTrigger value="galaxies">✨ Galaxies</TabsTrigger>
          <TabsTrigger value="planets">🪐 Planets</TabsTrigger>
          <TabsTrigger value="legacy">📜 Legacy</TabsTrigger>
          <TabsTrigger value="simulation">🔮 Simulation</TabsTrigger>
        </TabsList>

        {/* UNIVERSES TAB */}
        <TabsContent value="universes" className="mt-4 space-y-3">
          {universes.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSwitchUniverse(u.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                u.status === "active"
                  ? "border-primary/50 bg-primary/10"
                  : "border-white/5 bg-card/30 hover:border-white/20 hover:bg-card/50"
              }`}
            >
              <div className="text-3xl">{u.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{u.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      u.status === "active" ? "border-primary/50 text-primary" : "border-white/10 text-muted-foreground"
                    }`}
                  >
                    {u.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{u.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mood: {u.mood} · Theme: {u.theme}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {u.config.showStats.map((s) => (
                  <span key={s} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* GALAXIES TAB */}
        <TabsContent value="galaxies" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowNewGalaxy((v) => !v)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary"
            >
              <Plus className="w-4 h-4 mr-1" /> New Galaxy
            </Button>
          </div>
          {showNewGalaxy && (
            <div className="bg-card/40 border border-white/10 rounded-xl p-4 flex gap-3">
              <input
                className="flex-1 bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="Galaxy name..."
                value={newGalaxyName}
                onChange={(e) => setNewGalaxyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGalaxy()}
              />
              <Button size="sm" onClick={handleCreateGalaxy}>Create</Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {galaxies.map((g) => {
              const gPlanets = planets.filter((p) => p.galaxyId === g.id);
              return (
                <div key={g.id} className="bg-card/30 border border-white/5 rounded-xl p-4 hover:border-white/15 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background: `${g.color}20`, border: `1px solid ${g.color}40` }}
                    >
                      {g.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{g.name}</div>
                      <p className="text-xs text-muted-foreground">{g.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {gPlanets.length} planet{gPlanets.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* PLANETS TAB */}
        <TabsContent value="planets" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowNewPlanet((v) => !v)}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary"
            >
              <Plus className="w-4 h-4 mr-1" /> New Planet
            </Button>
          </div>
          {showNewPlanet && (
            <div className="bg-card/40 border border-white/10 rounded-xl p-4 flex gap-3">
              <input
                className="flex-1 bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="Planet name..."
                value={newPlanetName}
                onChange={(e) => setNewPlanetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlanet()}
              />
              <Button size="sm" onClick={handleCreatePlanet}>Create</Button>
            </div>
          )}
          {planets.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-3">🪐</div>
              <p>No planets yet. Create your first planet to begin growing your universe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {planets.map((p) => {
                const { level, progress } = getLevelProgress(p.xp);
                const galaxy = galaxies.find((g) => g.id === p.galaxyId);
                return (
                  <div
                    key={p.id}
                    className={`bg-card/30 border rounded-xl p-4 transition-all cursor-pointer ${
                      selectedPlanet?.id === p.id ? "border-primary/40 bg-primary/5" : "border-white/5 hover:border-white/15"
                    }`}
                    onClick={() => setSelectedPlanet(selectedPlanet?.id === p.id ? null : p)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{p.name}</span>
                          <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                            {p.status}
                          </Badge>
                          {galaxy && (
                            <span className="text-xs text-muted-foreground">· {galaxy.icon} {galaxy.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-primary font-mono">Lv.{level}</span>
                          <div className="flex-1">
                            <Progress value={progress} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground">{p.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                          <span>❤️ {p.health}%</span>
                          <span>⚡ {p.growthRate}%</span>
                          <span>🛡️ {p.stability}%</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-primary hover:bg-primary/10"
                        onClick={(e) => { e.stopPropagation(); handleAddXP(p.id); }}
                      >
                        <Zap className="w-3 h-3 mr-1" /> +XP
                      </Button>
                    </div>
                    {selectedPlanet?.id === p.id && p.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Milestones</p>
                        <div className="space-y-1">
                          {p.milestones.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 text-xs">
                              <div className={`w-3 h-3 rounded-full border ${m.achieved ? "bg-green-500 border-green-500" : "border-white/20"}`} />
                              <span className={m.achieved ? "line-through text-muted-foreground" : "text-white"}>{m.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* LEGACY TAB */}
        <TabsContent value="legacy" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleGenerateLegacy}
              disabled={legacyLoading}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {legacyLoading ? "Generating..." : "Generate Legacy Book"}
            </Button>
          </div>
          {legacyBooks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-3">📜</div>
              <p>No legacy books yet. Generate your first Legacy Book to capture your life story.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {legacyBooks.map((book) => (
                <div key={book.id} className="bg-card/30 border border-amber-500/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">Owner: {book.owner} · {book.chapters.length} chapters</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-400 hover:bg-amber-500/10"
                      onClick={() => {
                        const md = exportBookAsMarkdown(book);
                        const blob = new Blob([md], { type: "text/markdown" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `${book.title}.md`;
                        a.click();
                      }}
                    >
                      Export .md
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {book.chapters.map((chapter) => (
                      <div key={chapter.id} className="bg-background/30 rounded-lg p-3">
                        <p className="text-sm font-semibold text-white">{chapter.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">Period: {chapter.period}</p>
                        {chapter.stories.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-amber-400 mb-1">Stories</p>
                            {chapter.stories.slice(0, 2).map((s, i) => (
                              <p key={i} className="text-xs text-muted-foreground">· {s}</p>
                            ))}
                          </div>
                        )}
                        {chapter.lessons.length > 0 && (
                          <div>
                            <p className="text-xs text-amber-400 mb-1">Lessons</p>
                            {chapter.lessons.slice(0, 2).map((l, i) => (
                              <p key={i} className="text-xs text-muted-foreground">· {l}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SIMULATION TAB */}
        <TabsContent value="simulation" className="mt-4 space-y-4">
          <div className="bg-card/40 border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Run Future Simulation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Domain</label>
                <select
                  className="w-full bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as SimulationType)}
                >
                  <option value="career">💼 Career</option>
                  <option value="finance">💰 Finance</option>
                  <option value="health">❤️ Health</option>
                  <option value="learning">📚 Learning</option>
                  <option value="project">🚀 Project</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Timeframe</label>
                <select
                  className="w-full bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
                  value={simTimeframe}
                  onChange={(e) => setSimTimeframe(e.target.value as SimulationTimeframe)}
                >
                  <option value="1y">1 Year</option>
                  <option value="3y">3 Years</option>
                  <option value="5y">5 Years</option>
                  <option value="10y">10 Years</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleRunSim}
              disabled={simRunning}
              className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              {simRunning ? "Simulating..." : "Run Simulation"}
            </Button>
          </div>

          {simulations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="text-5xl mb-3">🔮</div>
              <p>No simulations yet. Run one to see your future trajectory.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {simulations.slice(0, 5).map((sim) => (
                <div key={sim.id} className="bg-card/30 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{getSimulationIcon(sim.type)}</span>
                    <div>
                      <span className="font-semibold text-white capitalize">{sim.type} · {sim.timeframe}</span>
                      <p className="text-xs text-muted-foreground">{new Date(sim.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                        <ShieldCheck className="w-3 h-3 mr-1" /> {sim.confidence}% confidence
                      </Badge>
                      <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                        Risk {sim.riskScore}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {sim.predictions.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5">→</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  {sim.warningSignals.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                      {sim.warningSignals.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-yellow-400/80">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
