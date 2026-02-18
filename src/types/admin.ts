// interfaces/admin.ts

// Profile row type for Admins
export interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
}

// Insert type for adding new admin
export interface AdminInsert {
  user_id: string;
  email: string;
  full_name?: string;
  requested_role: "student" | "alumni";
  role: "admin" | "user";
  status: "pending" | "approved" | "rejected";
}
