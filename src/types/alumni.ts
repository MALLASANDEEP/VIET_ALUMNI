export interface Alumni {
  id: string;
  name: string;
  batch: string;
  department: string;
  email: string | null;
  photo_url: string | null;
  current_position: string | null;
  company: string | null;
  linkedin: string | null;
  lpa: number | null;
  message: string | null;
  status?: string;
  roll_no?: string;

}

export interface AlumniInsert {
  name: string;
  batch: string;
  department: string;
  email?: string | null;
  photo_url?: string | null;
  current_position?: string | null;
  company?: string | null;
  linkedin?: string | null;
  lpa?: number | null;
  message?: string | null;
  roll_no?: string;

}
