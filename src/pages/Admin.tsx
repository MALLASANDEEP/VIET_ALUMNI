import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Image,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";
import { useHero } from "@/hooks/useHero";

import { AdminAlumniTab } from "@/components/admin/AdminAlumniTab";
import { AdminGalleryTab } from "@/components/admin/AdminGalleryTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminLogin } from "@/components/admin/AdminLogin";
import GalleryHeroadmin from "@/components/admin/GalleryHeroAdmin";
import AdminAlumniHeroEditor from "@/components/admin/AdminAlumniHeroEditor";
import ContentGalleryAdmin from "@/components/admin/ContentGalleryAdmin";
import AdminEvents from "@/components/admin/AdminEvents";
import  AdminManageAdmins from "@/components/admin/AdminAddForm";



const Admin = () => {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const { hero, updateHero } = useHero();

  const [heroDraft, setHeroDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hero) setHeroDraft(hero);
  }, [hero]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return <AdminLogin onLogin={signIn} />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <Button onClick={signOut}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header className="bg-none sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:h-16 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-navy-dark" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-navy-dark truncate">Admin Panel</h1>
              <p className="text-xs text-navy-dark/70 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Link to="/dashboard">
              <Button variant="ghost" className="bg-black text-white hover:bg-black/90 w-full sm:w-auto">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard Preview
              </Button>
            </Link>

            <Link to="/">
              <Button variant="ghost" className="bg-black text-white hover:bg-black/90 w-full sm:w-auto">
                <GraduationCap className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={signOut}
              className="bg-black text-white hover:bg-black/90 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="users" className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* LEFT SIDEBAR – FIXED */}
         <TabsList
  className="
    w-full
    lg:w-64
    h-auto
    grid
    grid-cols-2
    sm:grid-cols-3
    lg:flex
    lg:flex-col
    items-stretch
    lg:items-start
    justify-start
    gap-1
    bg-transparent
    rounded-xl
    p-3
    overflow-hidden
    sticky
    top-[72px]
    lg:top-24
    self-start
  "
>
            <TabsTrigger value="users" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>

            <TabsTrigger value="alumni" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <UserCheck className="w-4 h-4" />
              Alumni
            </TabsTrigger>

            <TabsTrigger value="gallery" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Image className="w-4 h-4" />
              Gallery
            </TabsTrigger>

            <TabsTrigger value="settings" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
             Hero Settings
            </TabsTrigger>
          
            <TabsTrigger value="galleryhero" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
             Gallery Hero Settings
            </TabsTrigger>
              <TabsTrigger value="adminalumnihero" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm"> 
              <Shield className="w-4 h-4" />
              Alumni Hero Settings
            </TabsTrigger>
            <TabsTrigger value="contentgallery" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              Content Gallery
            </TabsTrigger>
            <TabsTrigger value="events" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="manageadmins" className="w-full justify-start gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              Manage Admins
            </TabsTrigger>
          </TabsList>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">
            <TabsContent value="users" className="mt-0">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="alumni" className="mt-0">
              <AdminAlumniTab />
            </TabsContent>

            <TabsContent value="gallery" className="mt-0">
              <AdminGalleryTab />
            </TabsContent>
            <TabsContent value="galleryhero" className="mt-0">
              <GalleryHeroadmin />
             </TabsContent>
             <TabsContent value="adminalumnihero" className="mt-0">
              <AdminAlumniHeroEditor />
              </TabsContent>
              <TabsContent value="contentgallery" className="mt-0">
                <ContentGalleryAdmin />
              </TabsContent>
              <TabsContent value="events" className="mt-0">
                <AdminEvents />
              </TabsContent>
              <TabsContent value="manageadmins" className="mt-0">
                <AdminManageAdmins />
              </TabsContent>  

            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section Settings</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {!heroDraft ? (
                    <p>Loading hero...</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={heroDraft.badge_text || ""}
                          onChange={(e) =>
                            setHeroDraft({ ...heroDraft, badge_text: e.target.value })
                          }
                        />
                        <Input
                          value={heroDraft.title || ""}
                          onChange={(e) =>
                            setHeroDraft({ ...heroDraft, title: e.target.value })
                          }
                        />
                      </div>

                      <Input
                        value={heroDraft.subtitle || ""}
                        onChange={(e) =>
                          setHeroDraft({ ...heroDraft, subtitle: e.target.value })
                        }
                      />

                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files) return;
                          const urls: string[] = [];

                          for (const file of Array.from(e.target.files)) {
                            const name = `hero-${Date.now()}-${file.name}`;
                            const { error } = await supabase.storage
                              .from("hero")
                              .upload(name, file);

                            if (!error) {
                              const { data } = supabase.storage
                                .from("hero")
                                .getPublicUrl(name);
                              urls.push(data.publicUrl);
                            }
                          }

                          setHeroDraft({
                            ...heroDraft,
                            bg_type: "image",
                            bg_images: [...(heroDraft.bg_images || []), ...urls],
                          });
                        }}
                      />

                      {heroDraft.bg_images?.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {heroDraft.bg_images.map((img: string, i: number) => (
                            <div key={i} className="relative">
                              <img
                                src={img}
                                className="h-24 w-full object-cover rounded"
                              />
                              <button
                                className="absolute top-1 right-1 bg-black/70 p-1 rounded"
                                onClick={() =>
                                  setHeroDraft({
                                    ...heroDraft,
                                    bg_images: heroDraft.bg_images.filter(
                                      (_: any, idx: number) => idx !== i
                                    ),
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          disabled={saving}
                          onClick={async () => {
                            setSaving(true);
                            await updateHero(heroDraft);
                            setSaving(false);
                          }}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;