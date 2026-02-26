import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, X, Linkedin, Building, ArrowRight 
} from "lucide-react";
import { useAlumni } from "@/hooks/useAlumni";
import { Link } from "react-router-dom"; 

// --- Interfaces ---
interface Alumni {
  id: string;
  name: string;
  photo_url?: string;
  department: string;
  batch: string;
  company?: string;
  current_position?: string;
  message?: string;
  linkedin?: string;
  lpa?: string | number;
}

interface AlumniCardProps {
  alumni: Alumni;
  onClick: (alumni: Alumni) => void;
}

const formatBranch = (dept: string) => {
  const branchMap: { [key: string]: string } = {
    "COMPUTER SCIENCE": "CSE",
    "COMPUTER SCIENCE AND ENGINEERING": "CSE",
    "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
    "ELECTRONICS AND COMMUNICATION": "ECE",
    "MECHANICAL ENGINEERING": "MECH",
    "MECHANICAL": "MECH",
    "ELECTRICAL AND ELECTRONICS ENGINEERING": "EEE",
    "ELECTRICAL": "EEE",
    "CIVIL ENGINEERING": "CIVIL",
    "MASTER OF BUSINESS ADMINISTRATION": "MBA",
    "MASTER OF COMPUTER APPLICATIONS": "MCA",
    "BACHELOR OF BUSINESS ADMINISTRATION": "BBA",
  };
  const normalized = dept.toUpperCase().trim();
  return branchMap[normalized] || normalized;
};

const AlumniCard: React.FC<AlumniCardProps> = ({ alumni, onClick }) => (
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
        <span className="inline-block bg-indigo-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-[0.2em] mb-2 px-2 py-0.5 rounded-md shadow-lg">
          {formatBranch(alumni.department)}
        </span>
        <h3 className="text-white font-bold text-xl leading-tight">{alumni.name}</h3>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <span className="bg-slate-900/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-xl">
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

const AlumniMarquee: React.FC = () => {
  const { data, isLoading } = useAlumni();
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);

  useEffect(() => {
    if (selectedAlumni) {
      const scrollY = window.scrollY;
      document.body.setAttribute("data-scroll-y", scrollY.toString());
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const storedScrollY = document.body.getAttribute("data-scroll-y");
      document.body.style.position = "";
      document.body.style.top = "";
      if (storedScrollY) window.scrollTo(0, parseInt(storedScrollY));
    }
    return () => { document.body.style.position = ""; };
  }, [selectedAlumni]);

  const dbAlumni: Alumni[] = data?.alumni || [];
  const sectionTitle: string = data?.sectionTitle || "Distinguished Alumni";
  const alumniData = [...dbAlumni].sort((a, b) => (Number(b.lpa) || 0) - (Number(a.lpa) || 0));

  if (isLoading) {
    return (
      <section className="py-20 bg-[#f8fafc] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-950 font-bold text-sm tracking-widest uppercase">Syncing Elite Directory...</p>
      </section>
    );
  }

  return (
    <section className="pt-6 pb-20 bg-[#f8fafc] overflow-hidden relative">
      <div className="container mx-auto px-6 mb-16 relative flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{sectionTitle}</h2>
          <div className="h-1 w-20 bg-indigo-600 rounded-full mx-auto" />
        </div>
        <Link to="/alumni" className="hidden md:inline-flex absolute right-6 items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all">
          Explore <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative flex gap-4">
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[...alumniData, ...alumniData].map((alumni, index) => (
            <AlumniCard key={`marquee-${alumni.id}-${index}`} alumni={alumni} onClick={setSelectedAlumni} />
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
              {/* Top Banner with Logo */}
              <div className="h-32 bg-orange-500 flex items-center justify-center p-6 relative">
                 <button
                    onClick={() => setSelectedAlumni(null)}
                    className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src="https://www.viet.edu.in/img/header-imgs/viet-logo.svg"
                    alt="College Logo"
                    className="h-10 opacity-90"
                  />
              </div>

              {/* Profile Header (Name and Image Side by Side) */}
              <div className="px-8 -mt-12 relative z-10 flex items-end justify-between gap-4">
                <div className="flex-1 pb-2">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedAlumni.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded uppercase tracking-wider">
                       {formatBranch(selectedAlumni.department)}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                       Batch {selectedAlumni.batch}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <img
                    src={selectedAlumni.photo_url || ""}
                    alt={selectedAlumni.name}
                    className="w-28 h-36 object-cover rounded-2xl border-4 border-white shadow-xl bg-slate-100"
                  />
                </div>
              </div>

              {/* Information Section */}
              <div className="p-8 pt-6 space-y-6">
                {(selectedAlumni.current_position || selectedAlumni.company) && (
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Role</p>
                      <p className="text-sm font-bold text-slate-900">{selectedAlumni.current_position || "Professional"}</p>
                      <p className="text-xs font-semibold text-indigo-600">{selectedAlumni.company || "Industry Leader"}</p>
                    </div>
                  </div>
                )}

                {selectedAlumni.message && (
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border-l-4 border-indigo-600">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{selectedAlumni.message}"
                    </p>
                  </div>
                )}

                {selectedAlumni.linkedin && (
                  <a
                    href={selectedAlumni.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    <Linkedin className="w-4 h-4" />
                    View LinkedIn Profile
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