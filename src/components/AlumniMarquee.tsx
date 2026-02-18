import { useState } from "react";
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
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
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

      <div className="mt-10 flex justify-center md:hidden">
        <Link
          to="/alumni"
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
        >
          <Compass className="w-5 h-5" /> Explore Full Directory
        </Link>
      </div>

      <AnimatePresence>
        {selectedAlumni && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] max-w-lg w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAlumni(null)}
                className="absolute top-6 left-6 z-50 p-2.5 rounded-full bg-white/40 backdrop-blur-md text-slate-900 border border-white/40 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Glassy Header Section */}
              <div className="relative h-48 overflow-visible bg-slate-50 flex items-center px-10">
                {/* Visual Depth Blobs */}
                <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-40 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50" />

                {/* College Logo (Bottom Layer) */}
                <div className="relative z-10 w-full opacity-60 grayscale-[0.5]">
                  <img
                    src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
                    alt="College Logo"
                    className="max-h-24 w-auto object-contain"
                  />
                </div>

                {/* Profile Image (Top Layer - Overlapping Logo) */}
                <div className="absolute bottom-2 right-10 z-40 transform translate-y-1/2">
                  <div className="relative p-1.5 bg-white/30 backdrop-blur-2xl rounded-[2.8rem] shadow-2xl border border-white/50 ring-1 ring-black/5">
                    <div className="w-36 h-36 rounded-[2.4rem] bg-white overflow-hidden shadow-inner">
                      {selectedAlumni.photo_url ? (
                        <img
                          src={selectedAlumni.photo_url}
                          alt={selectedAlumni.name}
                          loading="eager"
                          className="w-full h-full object-cover object-center scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-200 bg-slate-50">
                          {selectedAlumni.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="pt-24 p-10 overflow-y-auto bg-white">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    {selectedAlumni.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {selectedAlumni.department}
                    </span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
                      Batch of {selectedAlumni.batch}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {(selectedAlumni.current_position || selectedAlumni.company) && (
                    <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-slate-50 to-transparent rounded-[2rem] border border-slate-100 transition-hover hover:border-indigo-100">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                        <Building className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Current Role</p>
                        <p className="text-base font-bold text-slate-900 leading-tight">
                          {selectedAlumni.current_position || "Professional"} 
                          <span className="text-indigo-600 ml-1">@ {selectedAlumni.company || "Industry Leader"}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedAlumni.message && (
                  <div className="relative mb-10 pl-4 border-l-4 border-indigo-100">
                    <p className="text-[16px] text-slate-600 italic leading-relaxed font-medium">
                      "{selectedAlumni.message}"
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {selectedAlumni.linkedin && (
                    <a
                      href={selectedAlumni.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex-1 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center gap-3 text-sm font-bold transition-all duration-300 shadow-xl active:scale-[0.98]"
                    >
                      <Linkedin className="w-5 h-5 transition-transform group-hover:scale-110" /> 
                      LinkedIn Profile
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