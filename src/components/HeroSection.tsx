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
      <div className="relative h-[95vh] bg-slate-900 overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-20 max-w-3xl px-9 md:px-19 text-left pt-32 md:pt-40">
          <div className="h-3 w-20 bg-slate-700 rounded mb-6" />
          <div className="h-14 md:h-20 w-3/4 bg-slate-700 rounded-lg mb-3" />
          <div className="h-14 md:h-20 w-1/2 bg-slate-700 rounded-lg mb-6" />
          <div className="h-4 w-72 bg-slate-700 rounded mb-3" />
          <div className="h-4 w-52 bg-slate-700 rounded mb-10" />
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-slate-700 rounded-lg" />
            <div className="h-12 w-32 bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="h-[95vh] bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Unable to load content</p>
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
