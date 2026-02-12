export interface ContentGallery {
  id: string;

  tag: string;
  title: string;
  description: string;

  button_text: string;
  button_link: string;

  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_5: string | null;

  updated_at: string;
}
