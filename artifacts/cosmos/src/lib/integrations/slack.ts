// Slack Integration stub — wire OAuth bot token to activate
export interface SlackMessage { ts: string; text: string; user: string; channel: string; }

export class SlackIntegration {
  private connected = false;
  constructor(private token = "") { this.connected = !!token; }
  isConnected() { return this.connected; }
  async postMessage(channel: string, text: string): Promise<boolean> {
    if (!this.connected) { console.log("[Slack] postMessage (demo):", text); return true; }
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel, text }),
    });
    const data = await res.json();
    return data.ok;
  }
  async getChannelHistory(channel: string, limit = 5): Promise<SlackMessage[]> {
    if (!this.connected) return [{ ts: "demo", text: "COSMOS is now intelligent!", user: "cosmos-bot", channel }];
    const res = await fetch(`https://slack.com/api/conversations.history?channel=${channel}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json();
    return (data.messages ?? []).map((m: any) => ({ ts: m.ts, text: m.text, user: m.user ?? "bot", channel }));
  }
}
