import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
const ALUMNI_TIMEOUT_MS = 9000;
const withTimeout = (promise, timeoutMs, message) => {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((value) => resolve(value))
            .catch((error) => reject(error))
            .finally(() => window.clearTimeout(timer));
    });
};
// ---------------- FETCH ALUMNI ----------------
export const useAlumni = () => {
    return useQuery({
        queryKey: ["alumni", "settings"],
        queryFn: async () => {
            const [alumniRes, settingsRes, adminRolesRes] = await withTimeout(Promise.all([
                supabase
                    .from("alumni")
                    .select("*")
                    .order("created_at", { ascending: false }),
                supabase
                    .from("site_settings")
                    .select("value")
                    .eq("id", "alumni_section_title")
                    .maybeSingle(),
                supabase
                    .from("user_roles")
                    .select("user_id")
                    .eq("role", "admin"),
            ]), ALUMNI_TIMEOUT_MS, "Alumni request timed out");
            if (alumniRes.error)
                throw alumniRes.error;
            if (adminRolesRes.error)
                throw adminRolesRes.error;
            const adminUserIds = (adminRolesRes.data || []).map((row) => row.user_id);
            let adminEmails = new Set();
            if (adminUserIds.length > 0) {
                const { data: adminProfiles, error: adminProfilesError } = await supabase
                    .from("profiles")
                    .select("email")
                    .in("user_id", adminUserIds);
                if (adminProfilesError)
                    throw adminProfilesError;
                adminEmails = new Set((adminProfiles || [])
                    .map((profile) => profile.email)
                    .filter((email) => Boolean(email)));
            }
            const formattedAlumni = alumniRes.data.map(item => ({
                id: item.id,
                name: item.name,
                batch: item.batch,
                department: item.department,
                email: item.email,
                photo_url: item.photo_url,
                current_position: item.current_position,
                company: item.company,
                linkedin: item.linkedin || item.linkedin_url || null,
                lpa: item.lpa ?? null,
                message: item.message ?? null,
                created_at: item.created_at,
                updated_at: item.updated_at,
                status: item.status ?? null,
                roll_no: item.roll_no ?? null,
                is_verified: item.is_verified ?? false,
            })).filter((item) => !item.email || !adminEmails.has(item.email));
            return {
                alumni: formattedAlumni,
                sectionTitle: settingsRes?.data?.value || "Distinguished Alumni"
            };
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });
};
// ---------------- ADD ----------------
export const useAddAlumni = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (alumni) => {
            const { data, error } = await supabase
                .from("alumni")
                .insert(alumni)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alumni"] });
            toast({ title: "Success", description: "Alumni added successfully" });
        }
    });
};
// ---------------- UPDATE ----------------
export const useUpdateAlumni = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from("alumni")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alumni"] });
            toast({ title: "Success", description: "Alumni updated successfully" });
        }
    });
};
// ---------------- DELETE ----------------
export const useDeleteAlumni = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("alumni").delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alumni"] });
            toast({ title: "Deleted", description: "Record removed successfully" });
        }
    });
};
// ---------------- UPDATE TITLE ----------------
export const useUpdateAlumniTitle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTitle) => {
            const { error } = await supabase
                .from("site_settings")
                .upsert({ id: "alumni_section_title", value: newTitle });
            if (error)
                throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alumni", "settings"] });
            toast({ title: "Updated", description: "Section title saved." });
        }
    });
};
// ---------------- UPLOAD PHOTO ----------------
export const uploadAlumniPhoto = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
        .from("alumni-photos")
        .upload(fileName, file, { upsert: false });
    if (uploadError)
        throw uploadError;
    const { data } = supabase.storage.from("alumni-photos").getPublicUrl(fileName);
    return data.publicUrl;
};
