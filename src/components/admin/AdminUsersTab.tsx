import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Search,
  UserCheck,
  GraduationCap,
  Edit,
  Trash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  usePendingRegistrations,
  useAllProfiles,
  useUpdateProfile,
  Profile
} from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export const AdminUsersTab = () => {
  const { data: pendingUsers, isLoading: pendingLoading } = usePendingRegistrations();
  const { data: allUsers, isLoading: allLoading } = useAllProfiles();
  const updateProfile = useUpdateProfile();

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"pending" | "all">("pending");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});

  /* ===================== APPROVE ===================== */
  const handleApprove = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({ id: profile.id, status: "approved" });

      const role =
        profile.requested_role === "alumni" ? "alumni" : "student";

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role });

      if (error) throw error;

      toast({
        title: "Approved",
        description: `${profile.full_name} approved successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  /* ===================== REJECT ===================== */
  const handleReject = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        status: "rejected"
      });

      toast({
        title: "Rejected",
        description: `${profile.full_name} has been rejected`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  /* ===================== DELETE ===================== */
  const handleDelete = async (profile: Profile) => {
    if (!confirm(`Delete ${profile.full_name}? This cannot be undone.`))
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${profile.full_name} removed`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  /* ===================== EDIT SAVE ===================== */
  const handleSaveEdit = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        ...editData
      });

      toast({
        title: "Updated",
        description: `${profile.full_name} updated successfully`
      });

      setEditingUserId(null);
      setEditData({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  /* ===================== FILTER ===================== */
  const users =
    view === "pending" ? pendingUsers : allUsers;

  const isLoading =
    view === "pending" ? pendingLoading : allLoading;

  const filteredUsers =
    users?.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  /* ===================== BADGES ===================== */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) =>
    role === "alumni" ? (
      <Badge variant="outline" className="border-gold text-gold">
        <UserCheck className="w-3 h-3 mr-1" /> Alumni
      </Badge>
    ) : (
      <Badge variant="outline" className="border-blue-500 text-blue-500">
        <GraduationCap className="w-3 h-3 mr-1" /> Student
      </Badge>
    );

  /* ===================== UI ===================== */
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            User Management
          </CardTitle>

          <div className="flex gap-2">
            <Button
              variant={view === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("pending")}
            >
              Pending ({pendingUsers?.length || 0})
            </Button>

            <Button
              variant={view === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("all")}
            >
              All Users
            </Button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-muted/50 rounded-xl p-4"
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {user.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    <div className="flex gap-2 mt-2">
                      {getRoleBadge(user.requested_role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* APPROVE / REJECT ONLY IN PENDING TAB */}
                    {view === "pending" &&
                      user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={() => handleApprove(user)}
                          >
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                    {/* EDIT + DELETE ALWAYS AVAILABLE */}
                    {editingUserId === user.id ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSaveEdit(user)
                        }
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditData(user);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};