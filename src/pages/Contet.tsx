import { useEffect, useState } from "react";
import { useContentGallery } from "@/hooks/ContentGallery";
import type { ContentGallery } from "@/types/contentgalleryinterface";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ContentGalleryUI = () => {
  const { data, isLoading } = useContentGallery();
  const [content, setContent] = useState<ContentGallery | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (data) setContent(data);
  }, [data]);

  useEffect(() => {
    if (!content) return;
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [content, index]);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!content) return <div className="p-10 text-center">No content available</div>;

  const images = [
    content.image_1,
    content.image_2,
    content.image_3,
    content.image_4,
    content.image_5,
  ].filter(Boolean);

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-[#FDFDFD] py-8 w-full px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 bg-white rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
        
        {/* LEFT — COMPACT IMAGE SLIDER */}
        <div className="md:col-span-5 relative h-[350px] md:h-[480px] flex items-center justify-center bg-[#fafafa] overflow-hidden">
          
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} className="text-slate-800" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {images.map((src, i) => {
                const isActive = i === index;
                const isPrev = i === (index - 1 + images.length) % images.length;
                const isNext = i === (index + 1) % images.length;

                if (!isActive && !isPrev && !isNext) return null;

                return (
                  <motion.img
                    key={src}
                    src={src}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isActive ? 1 : 0.35,
                      scale: isActive ? 1 : 0.75,
                      x: isActive ? 0 : isPrev ? "-60%" : "60%",
                      filter: isActive ? "blur(0px)" : "blur(6px)",
                      zIndex: isActive ? 20 : 10,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                        duration: 0.7, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    // INCREASED HEIGHT HERE from 75% to 92%
                    className="absolute h-[92%] w-[85%] object-cover rounded-[24px] shadow-lg"
                    alt={`Gallery ${i}`}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight size={20} className="text-slate-800" />
          </button>
        </div>

        {/* RIGHT — CONTENT AREA */}
        <div className="md:col-span-7 flex flex-col justify-center px-8 md:px-14 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-blue-500" />
            <span className="text-blue-600 text-[10px] tracking-[0.25em] font-bold uppercase">
              {content.tag}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            {content.title}
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-md leading-relaxed mb-8">
            {content.description}
          </p>

          <a
            href={content.button_link}
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest group w-fit"
          >
            {content.button_text}
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 group-hover:translate-x-1.5 transition-all duration-300">
              <ChevronRight size={14} />
            </span>
          </a>

          {/* INDICATORS */}
          <div className="mt-10 flex gap-2.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index 
                    ? "w-10 bg-slate-900" 
                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentGalleryUI;