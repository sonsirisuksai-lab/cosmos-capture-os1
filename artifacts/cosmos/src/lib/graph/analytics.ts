export interface GraphNodeLocal {
  id: string;
  label: string;
  type: string;
  weight: number;
  tags: string[];
}

export interface GraphEdgeLocal {
  source: string;
  target: string;
  weight: number;
}

export interface GraphMetrics {
  density: number;
  orphanCount: number;
  clusterCount: number;
  connectivity: number;
  bridgeNodes: string[];
  topNodes: GraphNodeLocal[];
  emergingTopics: string[];
  knowledgeGaps: string[];
}

export function calculateDensity(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): number {
  const n = nodes.length;
  if (n < 2) return 0;
  return edges.length / (n * (n - 1));
}

export function findOrphanNodes(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): GraphNodeLocal[] {
  const connected = new Set<string>();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });
  return nodes.filter((n) => !connected.has(n.id));
}

export function getNodeImportance(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): GraphNodeLocal[] {
  const degreeMap: Record<string, number> = {};
  edges.forEach((e) => {
    degreeMap[e.source] = (degreeMap[e.source] ?? 0) + 1;
    degreeMap[e.target] = (degreeMap[e.target] ?? 0) + 1;
  });
  return [...nodes].sort((a, b) => (degreeMap[b.id] ?? 0) - (degreeMap[a.id] ?? 0));
}

export function getCentrality(nodeId: string, edges: GraphEdgeLocal[]): number {
  const connections = edges.filter((e) => e.source === nodeId || e.target === nodeId);
  return connections.length;
}

export function getConnectivity(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): number {
  if (nodes.length === 0) return 0;
  const orphans = findOrphanNodes(nodes, edges);
  return (nodes.length - orphans.length) / nodes.length;
}

export function findEmergingTopics(nodes: GraphNodeLocal[]): string[] {
  const tagFreq: Record<string, number> = {};
  nodes.forEach((n) => n.tags.forEach((t) => {
    tagFreq[t] = (tagFreq[t] ?? 0) + 1;
  }));
  return Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}

export function detectKnowledgeGap(nodes: GraphNodeLocal[]): string[] {
  const EXPECTED_DOMAINS = ["vision", "execution", "finance", "knowledge", "builder", "health", "memory", "operations", "quality", "social"];
  const presentDomains = new Set(nodes.flatMap((n) => n.tags));
  return EXPECTED_DOMAINS.filter((d) => !presentDomains.has(d));
}

export function findHiddenClusters(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const visited = new Set<string>();

  function bfs(startId: string): string[] {
    const cluster: string[] = [];
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      cluster.push(current);
      const neighbors = edges
        .filter((e) => e.source === current || e.target === current)
        .map((e) => (e.source === current ? e.target : e.source))
        .filter((id) => !visited.has(id));
      queue.push(...neighbors);
    }
    return cluster;
  }

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      const cluster = bfs(n.id);
      if (cluster.length > 1) clusters.set(n.id, cluster);
    }
  });
  return clusters;
}

export function analyzeGraph(nodes: GraphNodeLocal[], edges: GraphEdgeLocal[]): GraphMetrics {
  const orphans = findOrphanNodes(nodes, edges);
  const clusters = findHiddenClusters(nodes, edges);
  const important = getNodeImportance(nodes, edges);
  const degreeMap: Record<string, number> = {};
  edges.forEach((e) => {
    degreeMap[e.source] = (degreeMap[e.source] ?? 0) + 1;
    degreeMap[e.target] = (degreeMap[e.target] ?? 0) + 1;
  });
  const bridgeNodes = nodes.filter((n) => (degreeMap[n.id] ?? 0) >= 3).map((n) => n.id);

  return {
    density: calculateDensity(nodes, edges),
    orphanCount: orphans.length,
    clusterCount: clusters.size,
    connectivity: getConnectivity(nodes, edges),
    bridgeNodes,
    topNodes: important.slice(0, 5),
    emergingTopics: findEmergingTopics(nodes),
    knowledgeGaps: detectKnowledgeGap(nodes),
  };
}
