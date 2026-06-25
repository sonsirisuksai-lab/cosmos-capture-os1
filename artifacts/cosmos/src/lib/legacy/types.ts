export interface LegacyChapter {
  id: string;
  title: string;
  period: string;
  stories: string[];
  lessons: string[];
  beliefs: string[];
  photos: string[];
  soulCardIds: string[];
  createdAt: number;
}

export interface LegacyBook {
  id: string;
  title: string;
  owner: string;
  chapters: LegacyChapter[];
  createdAt: number;
  updatedAt: number;
}
