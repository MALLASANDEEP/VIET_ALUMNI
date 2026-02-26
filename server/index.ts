import * as express from "express";
import * as cors from "cors";
import  * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

app.use(
  cors({
    origin: ["http://localhost:5173"], // change if needed
    credentials: true,
  })
);

app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ================= DELETE USER ================= */
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
      console.error("Auth delete error:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    // 2️⃣ Delete from Profiles (safety cleanup)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      console.error("Profile delete error:", profileError.message);
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted completely",
    });
  } catch (err: any) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (_, res) => {
  res.send("Backend is running");
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});