export interface MakaSession {
  id: string;
  prompt: string;
  agentName: string;
  agentEmoji: string;
  response: string;
  domain: string;
  suggestions: string[];
  timestamp: Date;
}

export function createMakaSession(
  prompt: string,
  agentName: string,
  agentEmoji: string,
  response: string,
  domain: string,
  suggestions: string[]
): MakaSession {
  return {
    id: crypto.randomUUID(),
    prompt,
    agentName,
    agentEmoji,
    response,
    domain,
    suggestions,
    timestamp: new Date(),
  };
}
