import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Open profile dialog */}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            My Profile
          </DropdownMenuItem>

          {/* Navigate to dashboard */}
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PROFILE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16" />
              )}
            </div>

            <h3 className="text-xl font-bold">{profile.full_name}</h3>

            <p className="text-muted-foreground">
              {profile.current_position}{" "}
              {profile.company && `at ${profile.company}`}
            </p>

            <div className="text-sm text-muted-foreground">
              <p><strong>Department:</strong> {profile.department}</p>
              <p><strong>Batch:</strong> {profile.batch}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;