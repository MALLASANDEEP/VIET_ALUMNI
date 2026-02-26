export interface GalleryHero {
  id: string;
  title: string | null;
  subtitle: string | null;
  bg_image: string | null;
  updated_at?: string | null;
}

export interface GalleryHeroInsert {
  title?: string | null;
  subtitle?: string | null;
  bg_image?: string | null;
}

export interface GalleryHeroUpdate {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  bg_image?: string | null;
}
