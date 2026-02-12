import bcrypt from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";

const run = async () => {
  const email = "admin@college.edu"; // your admin email
  const password = "Admin123";        // your admin password

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert into admins table
  const { data, error } = await supabase.from("admins").insert([
    { email, password: hashedPassword }
  ]);

  if (error) {
    console.error("Failed to add admin:", error.message);
  } else {
    console.log("Admin created successfully!", data);
  }

  process.exit(0);
};

run();
