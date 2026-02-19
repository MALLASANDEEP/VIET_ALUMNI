import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, X, Linkedin, Building, ArrowRight, Compass
} from "lucide-react";
import { useAlumni } from "@/hooks/useAlumni";
import { Link } from "react-router-dom"; 

const AlumniCard = ({ alumni, onClick }: { alumni: any; onClick: (alumni: any) => void }) => (
  <motion.div
    whileHover={{ y: -8 }}
    onClick={() => onClick(alumni)}
    className="flex-shrink-0 w-72 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 mx-4 group cursor-pointer relative"
  >
    <div className="relative h-64 w-full overflow-hidden bg-slate-900">
      {alumni.photo_url ? (
        <img
          src={alumni.photo_url}
          alt={alumni.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-6xl font-bold">
          {alumni.name.charAt(0)}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      
      <div className="absolute bottom-4 left-6 z-20">
        <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
          {alumni.department}
        </p>
        <h3 className="text-white font-bold text-xl leading-tight">
          {alumni.name}
        </h3>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-black text-[10px] font-bold px-3 py-1 rounded-full">
          Batch {alumni.batch}
        </span>
      </div>
    </div>

    <div className="p-5 bg-white relative">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
        <Building className="w-3 h-3" />
        <p className="font-bold text-[11px] truncate uppercase tracking-tight">
          {alumni.company || "Industry Leader"}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500" />
    </div>
  </motion.div>
);

const AlumniMarquee = () => {
  const { data, isLoading } = useAlumni();
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [speedUp, setSpeedUp] = useState(false);

  useEffect(() => {
    if (selectedAlumni) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    };
  }, [selectedAlumni]);

  const dbAlumni = data?.alumni || [];
  const sectionTitle = data?.sectionTitle || "Distinguished Alumni";

  const alumniData = [...dbAlumni].sort(
    (a, b) => (Number(b.lpa) || 0) - (Number(a.lpa) || 0)
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-[#f8fafc] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-950 font-bold text-sm tracking-widest uppercase">
          Syncing Elite Directory...
        </p>
      </section>
    );
  }

  return (
    <section id="alumni" className="pt-6 pb-20 bg-[#f8fafc] overflow-hidden relative">

      {/* 🔥 NEW EXPLORE BUTTON ADDED */}
      <div className="absolute top-6 right-6 z-40">
        <a
          href="/alumni"
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg transition-all duration-300"
        >
          <Compass className="w-4 h-4" />
          Explore
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="container mx-auto px-6 mb-16 relative text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          {sectionTitle}
        </h2>
        <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
      </div>

      <div className="relative flex gap-4">
        <div
          className={`flex ${speedUp ? "animate-marquee-fast" : "animate-marquee"} hover:[animation-play-state:paused]`}
        >
          {[...alumniData, ...alumniData].map((alumni, index) => (
            <AlumniCard
              key={`marquee-${alumni.id}-${index}`}
              alumni={alumni}
              onClick={setSelectedAlumni}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedAlumni && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full relative overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedAlumni(null)}
                className="absolute top-5 right-5 z-30 p-2 rounded-full bg-slate-100 text-slate-900 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* (Rest of your modal remains unchanged) */}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AlumniMarquee;
