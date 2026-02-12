export interface EventItem {
  id: string;
  type: "section" | "event";
  title: string;
  description: string;
  event_date?: string;
  venue?: string;
  created_at?: string;
}
