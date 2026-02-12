import { motion } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { Link } from "react-router-dom";

// Fallback data for when database is empty
const fallbackImages = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop", title: "Annual Reunion 2024", category: "Events" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop", title: "Graduation Ceremony", category: "Graduation" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop", title: "Tech Summit", category: "Events" },
  { id: "4", image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop", title: "Campus Life", category: "Campus" },
  { id: "5", image_url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop", title: "Alumni Meetup", category: "Events" },
  { id: "6", image_url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&h=400&fit=crop", title: "Sports Day", category: "Sports" },
  { id: "7", image_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop", title: "Library Study", category: "Campus" },
  { id: "8", image_url: "alumni-connect-hub-main/public/a/cricket.jpg", title: "Cultural Fest", category: "Events" },
];

const GallerySection = () => {
  const { data: dbGallery, isLoading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Use database gallery if available, otherwise use fallback
  const galleryImages = dbGallery && dbGallery.length > 0 ? dbGallery : fallbackImages;

  // Show only first 6 images
  const previewImages = galleryImages.slice(0, 6);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const goToPrev = () => setSelectedImage((prev) => (prev! > 0 ? prev! - 1 : galleryImages.length - 1));
  const goToNext = () => setSelectedImage((prev) => (prev! < galleryImages.length - 1 ? prev! + 1 : 0));

  if (isLoading) {
    return (
      <section className="pt-6 pb-16 bg-muted/30 flex justify-center" id="gallery">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </section>
    );
  }

  return (
    <section className="pt-6 pb-16 bg-muted/30" id="gallery">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Memory <span className="text-gradient">Gallery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cherished moments from our alumni events and campus life
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              onClick={() => openLightbox(index)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={image.image_url}
                alt={image.title || "Gallery image"}
                className="w-full h-full object-cover min-h-[200px] transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {image.category && (
                  <span className="inline-block px-2 py-1 bg-gold text-navy-dark text-xs font-semibold rounded-full mb-2">
                    {image.category}
                  </span>
                )}
                {image.title && (
                  <h3 className="text-primary-foreground font-serif text-lg font-bold">
                    {image.title}
                  </h3>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* See More Button */}
        <div className="mt-8 text-center">
          <Link
            to="/gallery"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
          >
            See More &rarr;
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-navy-dark/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-6 right-6 text-primary-foreground hover:text-gold transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-6 text-primary-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <motion.img
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={galleryImages[selectedImage].image_url}
            alt={galleryImages[selectedImage].title || "Gallery image"}
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-6 text-primary-foreground hover:text-gold transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-6 text-center">
            <h3 className="text-primary-foreground font-serif text-xl font-bold">
              {galleryImages[selectedImage].title || "Gallery Image"}
            </h3>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default GallerySection;
