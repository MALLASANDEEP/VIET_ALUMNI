import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGalleryHero } from "@/hooks/useGalleryHero";
import { useHero } from "@/hooks/useHero"; // Home hero hook for bg images

const GalleryHero = () => {
  const { data: heroData, isLoading } = useGalleryHero(); // gallery text
  const { hero: homeHero, loading: homeLoading } = useHero(); // home hero bg

  const [bgIndex, setBgIndex] = useState(0);

  // ✅ slide effect for background images
  useEffect(() => {
    if (!homeHero?.bg_images || homeHero.bg_images.length === 0) return;

    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % homeHero.bg_images.length);
    }, 5000); // change slide every 5 seconds

    return () => clearInterval(interval);
  }, [homeHero?.bg_images]);

  if (isLoading || homeLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!homeHero) return null;

  const backgroundImage =
    homeHero.bg_type === "image" && homeHero.bg_images?.length > 0
      ? homeHero.bg_images[bgIndex]
      : "/default-hero.jpg";

  return (
    <section className="relative h-[70vh] flex items-end text-white overflow-hidden">
      {/* Sliding Background Image */}
      <img
        src={backgroundImage}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        alt="Gallery hero background"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content from gallery (moved down and aligned left) */}
      <div className="relative z-10 max-w-2xl mb-16 ml-8">
        {heroData?.title && (
          <h1 className="text-4xl md:text-6xl font-bold">{heroData.title}</h1>
        )}
        {heroData?.subtitle && (
          <p className="mt-4 text-lg opacity-90">{heroData.subtitle}</p>
        )}
      </div>
    </section>
  );
};

export default GalleryHero;
