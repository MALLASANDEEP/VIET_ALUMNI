import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UserProfile = {
  id: string;
  email: string;
  role: "admin" | "student" | "alumni" | "user";
};

const AdminRoleManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles" as any)
      .select("id, email, role");

    if (error) {
      console.error(error);
      return;
    }

    // Cast data to UserProfile[]
    setUsers((data as unknown as UserProfile[]) || []);
  };

  const makeAdmin = async (id: string) => {
    await supabase
      .from("profiles")
      .update({ role: "admin" } as any) // cast to any to avoid TS error
      .eq("id", id);
    fetchUsers();
  };

  const removeAdmin = async (id: string) => {
    await supabase
      .from("profiles")
      .update({ role: "user" } as any) // cast to any
      .eq("id", id);
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm">Role: {user.role}</p>
            </div>

            {user.role === "admin" ? (
              <Button
                variant="destructive"
                onClick={() => removeAdmin(user.id)}
              >
                Remove Admin
              </Button>
            ) : (
              <Button onClick={() => makeAdmin(user.id)}>
                Make Admin
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminRoleManager;
