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
  Trash2,
  Shield,
  BadgeCheck,
  Ban,
  UserCog,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  usePendingRegistrations,
  useAllProfiles,
  useUpdateProfile,
  Profile,
} from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/* ──────────────────────────────────────────────────────
   Fetch all user_roles so we can display admin status
   ────────────────────────────────────────────────────── */
const useAllUserRoles = () =>
  useQuery({
    queryKey: ["admin", "allUserRoles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (error) throw error;
      return data || [];
    },
  });

type ViewFilter = "pending" | "all" | "banned";

export const AdminUsersTab = () => {
  const { data: pendingUsers, isLoading: pendingLoading } = usePendingRegistrations();
  const { data: allUsers, isLoading: allLoading } = useAllProfiles();
  const { data: userRoles = [] } = useAllUserRoles();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewFilter>("pending");
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── helpers ── */
  const isAdminUser = (userId: string) =>
    userRoles.some((r) => r.user_id === userId && r.role === "admin");

  const act = async (
    label: string,
    fn: () => Promise<void>,
    successMsg: string
  ) => {
    try {
      await fn();
      toast({ title: label, description: successMsg });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  /* ── approve ── */
  const handleApprove = (profile: Profile) =>
    act("Approved", async () => {
      await updateProfile.mutateAsync({ id: profile.id, status: "approved" });
      const role = profile.requested_role === "alumni" ? "alumni" : "student";
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: profile.user_id, role }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (error) throw error;
    }, `${profile.full_name} approved`);

  /* ── reject ── */
  const handleReject = (profile: Profile) =>
    act("Rejected", async () => {
      await updateProfile.mutateAsync({ id: profile.id, status: "rejected" });
    }, `${profile.full_name} rejected`);

  /* ── ban / unban ── */
  const handleToggleBan = (profile: Profile) =>
    act(
      profile.is_banned ? "Unbanned" : "Banned",
      async () => {
        await updateProfile.mutateAsync({
          id: profile.id,
          is_banned: !profile.is_banned,
        });
      },
      `${profile.full_name} ${profile.is_banned ? "un-banned" : "banned"}`
    );

  /* ── verify / unverify ── */
  const handleToggleVerify = (profile: Profile) =>
    act(
      profile.is_verified ? "Verification removed" : "Verified",
      async () => {
        await updateProfile.mutateAsync({
          id: profile.id,
          is_verified: !profile.is_verified,
        });
      },
      `${profile.full_name} ${profile.is_verified ? "unverified" : "verified"}`
    );

  /* ── change role ── */
  const handleChangeRole = (profile: Profile, newRole: "student" | "alumni") =>
    act("Role changed", async () => {
      await updateProfile.mutateAsync({
        id: profile.id,
        requested_role: newRole,
      });
      // update user_roles table too
      await supabase.from("user_roles").delete().eq("user_id", profile.user_id);
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role: newRole });
      if (error) throw error;
    }, `${profile.full_name} → ${newRole}`);

  /* ── make admin ── */
  const handleMakeAdmin = (profile: Profile) =>
    act("Admin granted", async () => {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: profile.user_id, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin", "allUserRoles"] });
    }, `${profile.full_name} is now admin`);

  /* ── remove admin ── */
  const handleRemoveAdmin = (profile: Profile) =>
    act("Admin removed", async () => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", profile.user_id)
        .eq("role", "admin");
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin", "allUserRoles"] });
    }, `${profile.full_name} admin role removed`);

  /* ── delete ── */
  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const serverBase = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
      const response = await fetch(`${serverBase}/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.user_id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");
      toast({ title: "Deleted", description: `${deleteTarget.full_name} removed` });
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── filter ── */
  const sourceList =
    view === "pending"
      ? pendingUsers
      : view === "banned"
      ? allUsers?.filter((u) => u.is_banned)
      : allUsers;

  const isLoading = view === "pending" ? pendingLoading : allLoading;

  const filteredUsers =
    sourceList?.filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  /* ── badge helpers ── */
  const statusBadge = (status: string) => {
    if (status === "approved")
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-[10px]">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    if (status === "rejected")
      return (
        <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px]">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    return (
      <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-[10px]">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    );
  };

  const roleBadge = (role: string) =>
    role === "alumni" ? (
      <Badge variant="outline" className="border-gold text-gold text-[10px]">
        <UserCheck className="w-3 h-3 mr-1" /> Alumni
      </Badge>
    ) : (
      <Badge variant="outline" className="border-blue-500 text-blue-500 text-[10px]">
        <GraduationCap className="w-3 h-3 mr-1" /> Student
      </Badge>
    );

  /* ── UI ── */
  return (
    <>
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{deleteTarget?.full_name}</strong>'s auth account, profile and all related data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDeleteConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-gold" />
              User Management
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {(["pending", "all", "banned"] as ViewFilter[]).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "default" : "outline"}
                  size="sm"
                  className="capitalize text-xs"
                  onClick={() => setView(v)}
                >
                  {v === "pending"
                    ? `Pending (${pendingUsers?.length ?? 0})`
                    : v === "banned"
                    ? `Banned (${allUsers?.filter((u) => u.is_banned).length ?? 0})`
                    : `All (${allUsers?.length ?? 0})`}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-xl border p-4 transition-colors ${
                    user.is_banned
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/40 border-transparent"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 overflow-hidden border border-gold/20">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gold font-bold text-sm">{user.full_name.charAt(0)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sm">{user.full_name}</span>
                        {user.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" aria-label="Verified alumni" />
                        )}
                        {user.is_banned && (
                          <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px]">
                            <Ban className="w-3 h-3 mr-1" /> Banned
                          </Badge>
                        )}
                        {isAdminUser(user.user_id) && (
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 text-[10px]">
                            <Shield className="w-3 h-3 mr-1" /> Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-all mt-0.5">{user.email}</p>
                      {(user.department || user.batch) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[user.department, user.batch].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {roleBadge(user.requested_role)}
                        {statusBadge(user.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      {/* Approve / Reject for pending */}
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                            onClick={() => handleApprove(user)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs h-8"
                            onClick={() => handleReject(user)}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <UserCog className="w-3 h-3" />
                            Actions
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-xs">Verification</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleVerify(user)}>
                            <BadgeCheck className="w-4 h-4 mr-2 text-blue-500" />
                            {user.is_verified ? "Remove Verified Badge" : "Mark as Verified Alumni"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Role</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "student")}
                            disabled={user.requested_role === "student"}
                          >
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                            Change to Student
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "alumni")}
                            disabled={user.requested_role === "alumni"}
                          >
                            <UserCheck className="w-4 h-4 mr-2 text-gold" />
                            Change to Alumni
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Admin Access</DropdownMenuLabel>
                          {isAdminUser(user.user_id) ? (
                            <DropdownMenuItem onClick={() => handleRemoveAdmin(user)} className="text-orange-500">
                              <Shield className="w-4 h-4 mr-2" />
                              Remove Admin Role
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user)}>
                              <Shield className="w-4 h-4 mr-2 text-purple-500" />
                              Grant Admin Role
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleBan(user)}>
                            <Ban className={`w-4 h-4 mr-2 ${user.is_banned ? "text-green-500" : "text-orange-500"}`} />
                            {user.is_banned ? "Unban User" : "Ban / Suspend User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};