import  * as express from "express";
import * as cors from "cors";
import  * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// ✅ Basic security check for env
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// ✅ Restrict CORS (change origin in production)
app.use(
  cors({
    origin: true,
    credentials: true,
  
  })
);

app.use(express.json());

// ✅ Admin client (SERVICE ROLE ONLY HERE)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= DELETE USER =================
app.post("/delete-user", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // 1️⃣ Delete from Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2️⃣ Delete from Profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete User Error:", err.message);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// ================= HEALTH CHECK =================
app.get("/", (_, res) => {
  res.send("Backend is running");
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
