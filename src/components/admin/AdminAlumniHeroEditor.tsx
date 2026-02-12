import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlumniHero } from "@/types/alumniDirectoryHero";

const AdminAlumniHeroEditor = () => {
  const [hero, setHero] = useState<AlumniHero | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current hero
  useEffect(() => {
    const fetchHero = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("alumni_hero")
        .select("*")
        .single<AlumniHero>();

      if (error) {
        console.error(error);
        toast({ title: "Failed to load hero", variant: "destructive" });
      } else if (data) {
        setHero(data);
      }
      setLoading(false);
    };

    fetchHero();
  }, []);

  const handleSave = async () => {
    if (!hero) return;
    setLoading(true);

    const { error } = await supabase
      .from("alumni_hero" as any)
      .update({
        title: hero.title,
        subtitle: hero.subtitle,
        apply_text: hero.apply_text,
        apply_url: hero.apply_url,
        bg_type: hero.bg_type,
      })
      .eq("id", hero.id);

    if (error) {
      console.error(error);
      toast({ title: "Failed to save hero", variant: "destructive" });
    } else {
      toast({ title: "Hero updated successfully!" });
    }

    setLoading(false);
  };

  if (!hero) {
    return (
      <div className="h-40 flex items-center justify-center">
        {loading ? "Loading..." : "No hero found"}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Edit Alumni Hero Section</h2>

      {/* Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Hero Title</label>
        <Input
          value={hero.title || ""}
          onChange={(e) => setHero({ ...hero, title: e.target.value })}
          placeholder="Enter hero title"
        />
      </div>

      {/* Subtitle */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Hero Subtitle</label>
        <Input
          value={hero.subtitle || ""}
          onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
          placeholder="Enter hero subtitle"
        />
      </div>

      {/* Apply Button Text */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Apply Button Text</label>
        <Input
          value={hero.apply_text || ""}
          onChange={(e) => setHero({ ...hero, apply_text: e.target.value })}
          placeholder="Apply Now"
        />
      </div>

      {/* Apply Button URL */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Apply Button URL</label>
        <Input
          value={hero.apply_url || ""}
          onChange={(e) => setHero({ ...hero, apply_url: e.target.value })}
          placeholder="https://example.com/apply"
        />
      </div>

      {/* Background Type */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Background Type</label>
        <select
          value={hero.bg_type || "image"}
          onChange={(e) => setHero({ ...hero, bg_type: e.target.value })}
          className="h-11 px-4 rounded-xl border border-slate-200 text-sm"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default AdminAlumniHeroEditor;
