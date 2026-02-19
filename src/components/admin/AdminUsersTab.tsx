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

  const handleApprove = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({ id: profile.id, status: "approved" });
      const role = profile.requested_role === "alumni" ? "alumni" : "student";
      const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role });
      if (error) throw error;
      toast({ title: "Success", description: `${profile.full_name} approved as ${profile.requested_role}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({ id: profile.id, status: "rejected" });
      toast({ title: "Success", description: `${profile.full_name}'s registration rejected` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

const handleDelete = async (profile: Profile) => {
  if (!confirm(`Are you sure you want to delete ${profile.full_name}?`)) return;

  try {
    // 1️⃣ Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (profileError) throw profileError;

    // 2️⃣ Call backend to delete auth user
    const response = await fetch("http://localhost:4000/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: profile.user_id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete auth user");
    }

    toast({
      title: "Deleted",
      description: `${profile.full_name} has been deleted.`,
    });

  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};


  const handleSaveEdit = async (profile: Profile) => {
    try {
      await updateProfile.mutateAsync({ id: profile.id, ...editData });
      toast({ title: "Updated", description: `${profile.full_name}'s details updated.` });
      setEditingUserId(null);
      setEditData({});
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredUsers = (view === "pending" ? pendingUsers : allUsers)?.filter(user => 
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "alumni" 
      ? <Badge variant="outline" className="border-gold text-gold"><UserCheck className="w-3 h-3 mr-1" /> Alumni</Badge>
      : <Badge variant="outline" className="border-blue-500 text-blue-500"><GraduationCap className="w-3 h-3 mr-1" /> Student</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            User Management
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("pending")}
              className={view === "pending" ? "bg-gold text-navy-dark hover:bg-gold/90" : ""}
            >
              <Clock className="w-4 h-4 mr-1" />
              Pending ({pendingUsers?.length || 0})
            </Button>
            <Button
              variant={view === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("all")}
              className={view === "all" ? "bg-gold text-navy-dark hover:bg-gold/90" : ""}
            >
              <Users className="w-4 h-4 mr-1" />
              All Users
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {(view === "pending" ? pendingLoading : allLoading) ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-muted/50 rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-gold font-bold text-lg">{user.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {editingUserId === user.id ? (
                        <>
                          <Input value={editData.full_name || user.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} className="text-sm"/>
                          <Input value={editData.email || user.email} onChange={e => setEditData({...editData, email: e.target.value})} className="text-sm"/>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-foreground">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getRoleBadge(user.requested_role)}
                        {getStatusBadge(user.status)}
                        {user.department && (
                          <Badge variant="secondary" className="text-xs">{user.department}</Badge>
                        )}
                        {user.batch && (
                          <Badge variant="secondary" className="text-xs">Batch {user.batch}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {user.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => handleApprove(user)} disabled={updateProfile.isPending}>
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(user)} disabled={updateProfile.isPending}>
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </>
                    )}
                    {editingUserId === user.id ? (
                      <Button size="sm" className="bg-blue-600 text-white gap-1" onClick={() => handleSaveEdit(user)}>Save</Button>
                    ) : (
                      <Button size="sm" className="bg-yellow-500 text-white gap-1" onClick={() => {setEditingUserId(user.id); setEditData(user);}}><Edit className="w-4 h-4"/> Edit</Button>
                    )}
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(user)}><Trash className="w-4 h-4"/> Delete</Button>
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground flex flex-col gap-1">
                  {user.roll_no && <span>Roll No: {user.roll_no}</span>}
                  {user.phone && <span>Phone: {user.phone}</span>}
                  {user.company && user.current_position && (
                    <span>Position: {user.current_position} at <span className="text-gold">{user.company}</span></span>
                  )}
                  {user.linkedin_url && (
                    <span>
                      LinkedIn: <a href={user.linkedin_url} target="_blank" className="text-blue-500 underline">{user.linkedin_url}</a>
                    </span>
                  )}
                  {user.lpa && <span>LPA: {user.lpa} LPA</span>}
                  {user.bio && <span>Bio: {user.bio}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {view === "pending" ? "No pending registrations" : "No users found"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
