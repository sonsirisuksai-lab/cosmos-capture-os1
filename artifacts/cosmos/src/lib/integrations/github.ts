// GitHub Integration stub — wire personal access token to activate
export interface GitHubRepo { id: number; name: string; description: string; stars: number; updatedAt: string; }
export interface GitHubCommit { sha: string; message: string; date: string; repo: string; }

export class GitHubIntegration {
  private connected = false;
  constructor(private token = "") { this.connected = !!token; }
  isConnected() { return this.connected; }
  private get headers() { return { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }; }
  async getRepos(): Promise<GitHubRepo[]> {
    if (!this.connected) return [{ id: 1, name: "cosmos-os", description: "Personal Knowledge OS", stars: 42, updatedAt: new Date().toISOString() }];
    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=10", { headers: this.headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    return data.map((r: any) => ({ id: r.id, name: r.name, description: r.description ?? "", stars: r.stargazers_count, updatedAt: r.updated_at }));
  }
  async getRecentCommits(repo: string, owner: string): Promise<GitHubCommit[]> {
    if (!this.connected) return [{ sha: "abc123", message: "feat: add intelligence engine", date: new Date().toISOString(), repo }];
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers: this.headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    return data.map((c: any) => ({ sha: c.sha.slice(0, 7), message: c.commit.message.split("\n")[0], date: c.commit.author.date, repo }));
  }
}
