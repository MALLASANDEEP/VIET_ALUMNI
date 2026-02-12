export interface GalleryImage {
  id: string;
  image_url: string;
  title?: string | null;
  category?: string | null;
  created_at: string;
}

export interface GalleryContent {
  id: string;
  tag?: string | null;
  title?: string | null;
  description?: string | null;
  updated_at: string;
}
