import { motion } from "framer-motion";
import { X, Linkedin, Briefcase, Quote } from "lucide-react";

const AlumniDetailModal = ({ alumni, onClose }: { alumni: any; onClose: () => void }) => {
  const bio = alumni.message || alumni.bio || alumni.description || "";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-5xl max-h-[80vh] sm:max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-gold hover:text-black transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex flex-col md:flex-row">

          {/* LEFT — IMAGE */}
          <div className="w-full md:w-2/5 h-56 sm:h-72 md:h-auto">
            {alumni.photo_url ? (
              <img
                src={alumni.photo_url}
                alt={alumni.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center">
                <span className="text-5xl sm:text-7xl font-bold text-gold">
                  {alumni.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — CONTENT */}
          <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-12 flex flex-col justify-between bg-card">

            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-red-400 text-white text-xs font-bold uppercase">
                  {alumni.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-400 text-white text-xs font-bold uppercase">
                  {alumni.batch}
                </span>
              </div>

              {/* Name */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 break-words">
                {alumni.name}
              </h2>

              {/* Bio */}
              {bio && (
                <div className="relative p-4 sm:p-6 bg-muted/30 rounded-2xl border-l-4 border-gold italic text-sm sm:text-base leading-relaxed mb-6">
                  <Quote className="absolute -top-3 -left-1 w-6 h-6 text-gold/20" />
                  "{bio}"
                </div>
              )}

              {/* Position */}
              <div className="flex items-start sm:items-center gap-3 text-sm sm:text-lg">
                <div className="p-2 rounded-lg bg-muted">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                </div>

                <p className="break-words">
                  <span className="font-bold">
                    {alumni.current_position || "Professional"}
                  </span>
                  <span className="text-muted-foreground"> at </span>
                  <span className="text-white bg-red-400 rounded-lg px-2 py-1 font-medium inline-block mt-1 sm:mt-0">
                    {alumni.company || "Leading Firm"}
                  </span>
                </p>
              </div>
            </div>

            {/* LinkedIn Button */}
            {alumni.linkedin && (
              <div className="mt-6 sm:mt-8">
                <a
                  href={alumni.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#0077b5] text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg"
                >
                  <Linkedin className="w-5 h-5" />
                  View LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlumniDetailModal;