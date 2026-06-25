// Google Calendar Integration stub — wire real OAuth token to activate
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  attendees?: string[];
}

export class CalendarIntegration {
  private connected = false;
  constructor(private accessToken = "") {
    this.connected = !!accessToken;
  }
  isConnected() { return this.connected; }
  async getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    if (!this.connected) {
      return [
        { id: "demo-1", title: "Review Weekly Goals", start: new Date(), end: new Date(Date.now() + 3600_000) },
        { id: "demo-2", title: "Deep Work Block", start: new Date(Date.now() + 7200_000), end: new Date(Date.now() + 10800_000) },
      ];
    }
    const params = new URLSearchParams({
      timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: "true", orderBy: "startTime",
    });
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error(`Calendar API ${res.status}`);
    const data = await res.json();
    return (data.items ?? []).map((item: any) => ({
      id: item.id, title: item.summary, start: new Date(item.start.dateTime ?? item.start.date),
      end: new Date(item.end.dateTime ?? item.end.date), location: item.location, description: item.description,
    }));
  }
  async createEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    console.log("[Calendar] createEvent:", event.title);
    return { id: crypto.randomUUID(), ...event };
  }
}
