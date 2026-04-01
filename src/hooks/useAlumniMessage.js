import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const useAlumniMessage = () => {
    return useQuery({
        queryKey: ["alumni-messages"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("alumni") // 👈 USE THE CORRECT TABLE
                .select(`
          id,
          name,
          batch,
          department,
          company,
          lpa,
          message,
          linkedin
        `)
                .not("message", "is", null);
            if (error)
                throw error;
            // ✅ THIS is the correct cast
            return data;
        },
    });
};
