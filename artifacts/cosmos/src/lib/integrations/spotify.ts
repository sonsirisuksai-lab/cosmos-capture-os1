// Spotify Integration stub — wire OAuth access token to activate
export interface SpotifyTrack { id: string; name: string; artist: string; album: string; isPlaying: boolean; }

export class SpotifyIntegration {
  private connected = false;
  constructor(private token = "") { this.connected = !!token; }
  isConnected() { return this.connected; }
  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    if (!this.connected) return { id: "demo", name: "Binks' Sake", artist: "One Piece OST", album: "Grand Line Sessions", isPlaying: false };
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`Spotify API ${res.status}`);
    const data = await res.json();
    return {
      id: data.item?.id, name: data.item?.name, artist: data.item?.artists?.[0]?.name ?? "Unknown",
      album: data.item?.album?.name ?? "Unknown", isPlaying: data.is_playing,
    };
  }
  async getFocusPlaylist(): Promise<SpotifyTrack[]> {
    return [{ id: "fp-1", name: "Lofi Focus", artist: "COSMOS Radio", album: "Deep Work", isPlaying: false }];
  }
}
