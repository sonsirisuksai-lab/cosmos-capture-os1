export type EventType =
  | "note_created"
  | "note_updated"
  | "note_deleted"
  | "note_starred"
  | "agent_interaction"
  | "twin_update"
  | "collection_created"
  | "system_event";

export interface AppEvent {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: Date;
  agentName?: string;
}

export type EventHandler = (event: AppEvent) => void;

class EventEngine {
  private handlers = new Map<EventType | "all", EventHandler[]>();
  private history: AppEvent[] = [];

  emit(type: EventType, payload: Record<string, unknown>, agentName?: string): AppEvent {
    const event: AppEvent = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date(),
      agentName,
    };
    this.history.push(event);
    if (this.history.length > 1000) this.history.shift();

    const typeHandlers = this.handlers.get(type) ?? [];
    const allHandlers = this.handlers.get("all") ?? [];
    [...typeHandlers, ...allHandlers].forEach((h) => h(event));
    return event;
  }

  on(type: EventType | "all", handler: EventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
    return () => {
      const handlers = this.handlers.get(type) ?? [];
      this.handlers.set(type, handlers.filter((h) => h !== handler));
    };
  }

  getHistory(limit = 50): AppEvent[] {
    return this.history.slice(-limit).reverse();
  }

  getEventsByType(type: EventType): AppEvent[] {
    return this.history.filter((e) => e.type === type);
  }
}

export const eventEngine = new EventEngine();
