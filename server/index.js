import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
const app = express();
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
}
app.use(cors({
    origin: true, // change if needed
    credentials: true,
}));
app.use(express.json());
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
/* ================= DELETE USER ================= */
app.post("/delete-user", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        // 1️⃣ Delete from Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
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
    }
    catch (err) {
        console.error("Server error:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/* ================= CREATE ADMIN ================= */
app.post("/create-admin", async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    try {
        // 1️⃣ Create auth user with service role (no email confirmation required)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }
        const userId = authData.user?.id;
        if (!userId) {
            return res.status(500).json({ error: "User creation failed" });
        }
        // 2️⃣ Insert profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
            user_id: userId,
            email,
            full_name: full_name || "Admin User",
            status: "pending",
            requested_role: "student",
            batch: "Admin",
            department: "Administration",
        });
        if (profileError) {
            // Cleanup auth user so we don't leave orphaned records
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(400).json({ error: profileError.message });
        }
        // 3️⃣ Insert admin role
        const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: userId, role: "admin" });
        if (roleError) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(400).json({ error: roleError.message });
        }
        // Safety cleanup: if any automation mirrored this profile into alumni,
        // remove that synthetic row so admin users never appear in alumni lists.
        const { error: alumniCleanupError } = await supabaseAdmin
            .from("alumni")
            .delete()
            .eq("email", email)
            .eq("batch", "Admin")
            .eq("department", "Administration");
        if (alumniCleanupError) {
            console.warn("Alumni cleanup warning:", alumniCleanupError.message);
        }
        return res.status(200).json({ success: true, message: "Admin created successfully" });
    }
    catch (err) {
        console.error("Create admin error:", err.message);
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
