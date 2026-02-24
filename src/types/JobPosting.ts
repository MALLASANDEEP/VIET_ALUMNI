type CreateJobPostingInput = {
  alumni_id: string;
  title: string;
  company: string;
  description: string;

  location?: string | null;
  apply_link?: string | null;

  job_type?: string | null;
  experience_required?: string | null;
  salary_range?: string | null;
  skills_required?: string[] | null;

  responsibilities?: string | null;
  eligibility?: string | null;
  selection_process?: string | null;
  application_deadline?: string | null;

  referral_type: "direct_apply" | "resume_upload" | "internal_referral";
  referral_slots?: number | null;
};



export interface JobPosting {
  id: string;
  alumni_id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  apply_link: string | null;

  job_type: string | null;
  experience_required: string | null;
  salary_range: string | null;
  skills_required: string[] | null;

  responsibilities: string | null;
  eligibility: string | null;
  selection_process: string | null;
  application_deadline: string | null;

  referral_type: "direct_apply" | "resume_upload" | "internal_referral";
  referral_slots: number | null;

  is_active: boolean;
  is_closed: boolean;

  created_at: string;
  updated_at: string;

  alumni?: {
    full_name: string;
    photo_url: string | null;
  };
}