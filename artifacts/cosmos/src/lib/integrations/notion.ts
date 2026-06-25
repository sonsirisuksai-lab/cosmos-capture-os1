// Notion Integration stub — wire Notion API token to activate
export interface NotionPage { id: string; title: string; url: string; lastEdited: string; }

export class NotionIntegration {
  private connected = false;
  constructor(private token = "") { this.connected = !!token; }
  isConnected() { return this.connected; }
  async getPages(): Promise<NotionPage[]> {
    if (!this.connected) {
      return [
        { id: "notion-1", title: "Project Roadmap", url: "#", lastEdited: new Date().toISOString() },
        { id: "notion-2", title: "Personal OKRs", url: "#", lastEdited: new Date().toISOString() },
      ];
    }
    const res = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ filter: { value: "page", property: "object" }, page_size: 10 }),
    });
    if (!res.ok) throw new Error(`Notion API ${res.status}`);
    const data = await res.json();
    return (data.results ?? []).map((p: any) => ({
      id: p.id, url: p.url, lastEdited: p.last_edited_time,
      title: p.properties?.title?.title?.[0]?.plain_text ?? p.properties?.Name?.title?.[0]?.plain_text ?? "Untitled",
    }));
  }
}
