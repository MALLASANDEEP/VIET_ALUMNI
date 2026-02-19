import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, X, Linkedin, Building
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
        
        {/* ✅ Glass Department Badge */}
        <div className="mb-2">
          <span className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] 
           bg-[#4f46e5] backdrop-blur-xl 
            border border-white/20 
            text-white 
            rounded-full 
            shadow-lg 
            inline-block">
            {alumni.department}
          </span>
        </div>

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

              <div className="relative h-44 flex items-center justify-center overflow-visible">
                <div className="absolute inset-0 bg-orange-500/70 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent" />

                <img
                  src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
                  alt="College Logo"
                  className="relative z-10 max-h-20 max-w-[70%] object-contain"
                />

                <div className="absolute right-6 top-full -translate-y-1/3 z-20">
                  <img
                    src={selectedAlumni.photo_url || ""}
                    alt={selectedAlumni.name}
                    className="w-32 h-44 object-cover rounded-3xl border-4 border-white shadow-2xl bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-18 px-8 pb-8 bg-white">
                <div className="mb-4 border-b border-slate-200 pb-4">
                  <h2 className="text-2l font-bold text-slate-900 tracking-tight">
                    {selectedAlumni.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Distinguished Alumni Profile
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-full uppercase tracking-wide">
                    {selectedAlumni.department}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full uppercase tracking-wide">
                    Batch {selectedAlumni.batch}
                  </span>
                </div>

                {(selectedAlumni.current_position || selectedAlumni.company) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200">
                        <Building className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Current Position
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {selectedAlumni.current_position || "Professional"}
                        </p>
                        <p className="text-sm font-medium text-indigo-600">
                          {selectedAlumni.company || "Industry Leader"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedAlumni.linkedin && (
                  <a
                    href={selectedAlumni.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all"
                  >
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn
                  </a>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AlumniMarquee;
