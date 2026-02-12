import { useEffect, useState } from "react";
import { useHero } from "@/hooks/useHero";

const HeroSection = () => {
  // ✅ hooks at top (unchanged)
  const { hero, loading } = useHero();
  const [bgIndex, setBgIndex] = useState(0);

  // ✅ slider logic (unchanged)
  useEffect(() => {
    if (!hero?.bg_images || hero.bg_images.length === 0) return;

    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % hero.bg_images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hero?.bg_images]);

  // ✅ loading states (unchanged)
  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        Loading hero...
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        No hero data
      </div>
    );
  }

  return (
    <section className="relative h-[95vh] flex items-center text-white overflow-hidden">
      {/* ✅ BACKGROUND IMAGE */}
      {hero.bg_type === "image" &&
        hero.bg_images &&
        hero.bg_images.length > 0 && (
          <img
            key={bgIndex}
            src={hero.bg_images[bgIndex]}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            alt="Hero background"
          />
        )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* ✅ LEFT-ALIGNED CONTENT (MIDDLE OF IMAGE) */}
      <div className="relative z-20 max-w-3xl px-9 md:px-19 text-left pt-19 md:pt-24">
        {hero.badge_text && (
          <span className="uppercase tracking-wide text-sm opacity-80">
            {hero.badge_text}
          </span>
        )}

        <h1 className="text-4xl md:text-6xl font-bold mt-4">
          {hero.title}
        </h1>

        <p className="mt-4 text-lg opacity-90">
          {hero.subtitle}
        </p>

        <div className="mt-8 flex gap-4">
          {hero.primary_btn && (
            <button className="px-6 py-3 bg-white text-black rounded-lg">
              {hero.primary_btn}
            </button>
          )}

          {hero.secondary_btn && (
            <button className="px-6 py-3 border border-white rounded-lg">
              {hero.secondary_btn}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
