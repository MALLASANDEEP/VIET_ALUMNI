import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Loader2, Search, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useGallery } from "@/hooks/useGallery";
import GalleryHero from "@/components/Gallery-hero";

/* ---------------- FALLBACK IMAGES ---------------- */
const fallbackImages = [
  {
    id: "1",
    image_url:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    title: "Annual Reunion 2024",
    category: "Events",
    description:
      "A memorable gathering of alumni reconnecting and celebrating together.",
  },
  {
    id: "2",
    image_url:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
    title: "Tech Workshop",
    category: "Education",
    description:
      "Hands-on sessions exploring modern technologies and innovation.",
  },
];

/* -------- SMART DESCRIPTION GENERATOR -------- */
const getDescription = (img: any) => {
  if (img.description && img.description.trim() !== "") {
    return img.description;
  }

  if (img.title && img.category) {
    return `${img.title} – highlights from our ${img.category.toLowerCase()} activities and moments.`;
  }

  if (img.title) {
    return `Moments captured during ${img.title.toLowerCase()}.`;
  }

  return "Special moments captured from our alumni journey.";
};

const GalleryPage = () => {
  const { data: dbGallery, isLoading } = useGallery();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const images = dbGallery?.length ? dbGallery : fallbackImages;

  /* ---------------- CATEGORIES ---------------- */
  const categories = useMemo(() => {
    const unique = new Set(images.map((img) => img.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [images]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchCategory =
        activeCategory === "All" || img.category === activeCategory;

      const matchSearch =
        (img.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (img.category || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [images, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans">
      <Navbar />
      <GalleryHero />

      {/* ---------------- FILTER BAR (NO LONGER STICKY) ---------------- */}
      <div className="container mx-auto px-6 pt-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- GALLERY ---------------- */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <Loader2 className="mx-auto animate-spin w-10 h-10" />
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <ImageIcon size={48} className="mx-auto mb-4" />
              No images found.
            </div>
          ) : (
            <AnimatePresence>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredImages.map((img) => (
                  <motion.div
                    key={img.id}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="group relative break-inside-avoid rounded-3xl overflow-hidden bg-slate-200 shadow-lg hover:shadow-2xl"
                  >
                    <motion.img
                      src={img.image_url}
                      alt={img.title}
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
                      <div className="relative h-full flex items-end p-6">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full"
                        >
                          <p className="text-yellow-400 text-[11px] uppercase tracking-widest mb-1">
                            {img.category}
                          </p>
                          <h3 className="text-white text-lg font-bold mb-1">
                            {img.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {getDescription(img)}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
