import { useState } from "react";
import { User, LogOut, LayoutDashboard, Mail, Phone, Linkedin, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface ProfileMenuProps {
  profile: Profile;
  onLogout: () => void;
}

const ProfileMenu = ({ profile, onLogout }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/20 p-0 overflow-hidden hover:bg-white/10">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 mt-2">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-semibold leading-none">{profile.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{profile.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)}>
            <User className="mr-2 h-4 w-4" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          {/* Cover Header */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-xl">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold tracking-tight">{profile.full_name}</h3>
                <p className="text-lg opacity-90 font-medium">
                  {profile.current_position} {profile.company && `at ${profile.company}`}
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Academic Info */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <GraduationCap className="h-4 w-4" /> Education
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold text-gray-800">{profile.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Batch & Roll No</p>
                    <p className="font-semibold text-gray-800">{profile.batch} {profile.roll_no ? `• ${profile.roll_no}` : ""}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Mail className="h-4 w-4" /> Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-800 break-all">{profile.email}</p>
                  </div>
                  {profile.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-800">{profile.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LinkedIn & Bio */}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                >
                  <Linkedin className="h-4 w-4" /> View LinkedIn Profile
                </a>
              )}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-gray-700 mb-2">About Me</h4>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {profile.bio || "No professional bio provided yet."}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;