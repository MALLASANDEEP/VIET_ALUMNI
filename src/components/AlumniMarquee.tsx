import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, X, Linkedin, Mail, Briefcase, 
  Building, ArrowRight, Compass 
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
        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full">
          Class of {alumni.batch}
        </span>
      </div>
    </div>

    <div className="p-5 bg-white relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
             <Building className="w-3 h-3" />
             <p className="font-bold text-[11px] truncate uppercase tracking-tight">
               {alumni.company || "Industry Leader"}
             </p>
          </div>
        </div>

        {alumni.lpa && (
          <div className="flex flex-col items-end shrink-0">
            <span className="text-indigo-600 font-black text-sm">
              {alumni.lpa} <span className="text-[9px]">LPA</span>
            </span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500" />
    </div>
  </motion.div>
);

const AlumniMarquee = () => {
  const { data, isLoading } = useAlumni();
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [speedUp, setSpeedUp] = useState(false);

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
    <section className="pt-6 pb-20 bg-[#f8fafc] overflow-hidden relative">
      
      {/* Header */}
      <div className="container mx-auto px-6 mb-16 relative">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {sectionTitle}
          </h2>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
          <Link 
            to="/alumni" 
            className="group flex items-center gap-3 text-indigo-600 font-bold text-sm"
          >
            <div className="p-4 bg-white shadow-xl rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-tighter">
                View All
              </span>
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Marquee Controls */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex justify-between items-center px-3">
        <button
          onMouseEnter={() => setSpeedUp(true)}
          onMouseLeave={() => setSpeedUp(false)}
          className="pointer-events-auto bg-white/80 backdrop-blur-md shadow-xl rounded-full p-3 hover:bg-indigo-600 hover:text-white transition"
        >
          &lt;
        </button>

        <button
          onMouseEnter={() => setSpeedUp(true)}
          onMouseLeave={() => setSpeedUp(false)}
          className="pointer-events-auto bg-white/80 backdrop-blur-md shadow-xl rounded-full p-3 hover:bg-indigo-600 hover:text-white transition"
        >
          &gt;
        </button>
      </div>

      {/* Marquee Row */}
      <div className="relative flex gap-4">
        <div
          className={`flex ${
            speedUp ? "animate-marquee-fast" : "animate-marquee"
          } hover:[animation-play-state:paused]`}
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

      {/* Mobile Explore */}
      <div className="mt-10 flex justify-center md:hidden">
        <Link
          to="/alumni"
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
        >
          <Compass className="w-5 h-5" /> Explore Full Directory
        </Link>
      </div>

      {/* Modal */}
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

              <div className="relative h-32 bg-indigo-600">
                <div className="absolute -bottom-12 left-8">
                  <img
                    src={selectedAlumni.photo_url || ""}
                    alt={selectedAlumni.name}
                    className="w-24 h-24 object-cover rounded-3xl border-4 border-white shadow-xl bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-16 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {selectedAlumni.name}
                </h2>
                <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
                  {selectedAlumni.department} • Class of {selectedAlumni.batch}
                </p>

                <div className="flex gap-3">
                  {selectedAlumni.linkedin && (
                    <a
                      href={selectedAlumni.linkedin}
                      target="_blank"
                      className="flex-1 py-3 bg-[#0077b5] text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {selectedAlumni.email && (
                    <a
                      href={`mailto:${selectedAlumni.email}`}
                      className="p-3 bg-slate-100 rounded-xl hover:bg-indigo-600 hover:text-white transition"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AlumniMarquee;
