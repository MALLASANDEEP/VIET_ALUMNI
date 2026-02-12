export interface AlumniHero {
  id: string;
  title: string | null;
  subtitle: string | null;
  apply_text: string | null;
  apply_url: string | null;
  bg_type: string | null; // e.g., "image" or "video"
  updated_at?: string | null;
  created_at?: string | null;
}

export interface AlumniHeroInsert {
  title?: string | null;
  subtitle?: string | null;
  apply_text?: string | null;
  apply_url?: string | null;
  bg_type?: string | null;
}

export interface AlumniHeroUpdate {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  apply_text?: string | null;
  apply_url?: string | null;
  bg_type?: string | null;
}
