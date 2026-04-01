// src/hooks/useAddAdmin.ts
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
export const useAddAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    // ✅ Add a new admin via the secure backend endpoint
    const addAdmin = async (email, password, full_name = "") => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!email || !password)
                throw new Error("Email and password required");
            const response = await fetch(`${SERVER_URL}/create-admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, full_name }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to create admin");
            }
            setSuccess("Admin created successfully!");
        }
        catch (err) {
            setError(err?.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };
    // ✅ Remove admin access
    const deleteAdmin = async (userId) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!userId)
                throw new Error("User ID required");
            // 1️⃣ Delete role from user_roles table
            const { error: roleError } = await supabase
                .from("user_roles")
                .delete()
                .eq("user_id", userId);
            if (roleError)
                throw roleError;
            setSuccess("Admin access removed successfully!");
        }
        catch (err) {
            setError(err?.message || "Delete failed");
        }
        finally {
            setLoading(false);
        }
    };
    return {
        addAdmin,
        deleteAdmin,
        loading,
        error,
        success,
    };
};
