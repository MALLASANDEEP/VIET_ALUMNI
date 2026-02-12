import { motion } from "framer-motion";
import { X, Linkedin, Mail, Briefcase, GraduationCap, Quote } from "lucide-react";

const AlumniDetailModal = ({ alumni, onClose }: { alumni: any; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl bg-card rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-navy-dark/50 text-gold hover:bg-gold hover:text-navy-dark transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left Column: Image & Badge */}
          <div className="w-full md:w-2/5 relative">
            {alumni.photo_url ? (
              <img
                src={alumni.photo_url}
                alt={alumni.name}
                className="w-full h-full object-cover min-h-[300px]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center min-h-[300px]">
                <span className="text-9xl font-bold text-gold">{alumni.name.charAt(0)}</span>
              </div>
            )}
            
            {/* LPA Badge Overlapping Image */}
            {alumni.lpa && (
              <div className="absolute bottom-6 left-6 right-6 bg-gold/90 backdrop-blur-md text-navy-dark p-4 rounded-2xl shadow-lg border border-white/20">
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Annual Package</p>
                <p className="text-3xl font-black">{alumni.lpa} LPA</p>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="p-8 md:p-12 w-full md:w-3/5 text-foreground flex flex-col justify-between bg-card">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-tighter border border-gold/20">
                  {alumni.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-tighter">
                  Class of {alumni.batch}
                </span>
              </div>

              <h2 className="text-5xl font-serif font-bold mb-4 text-foreground">{alumni.name}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-muted">
                    <Briefcase className="w-5 h-5 text-gold" />
                  </div>
                  <p>
                    <span className="font-bold">{alumni.current_position || "Professional"}</span>
                    <span className="text-muted-foreground"> at </span>
                    <span className="text-gold font-medium">{alumni.company || "Leading Firm"}</span>
                  </p>
                </div>
              </div>

              {/* Message / Bio Section */}
              {alumni.message && (
                <div className="relative p-6 bg-muted/30 rounded-2xl border-l-4 border-gold italic text-foreground/80 leading-relaxed mb-8">
                  <Quote className="absolute -top-3 -left-1 w-8 h-8 text-gold/20" />
                  "{alumni.message}"
                </div>
              )}
            </div>

            {/* Social / Contact Actions */}
            <div className="flex flex-wrap gap-4">
              {alumni.linkedin && (
                <a
                  href={alumni.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0077b5] text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn Profile
                </a>
              )}
              {alumni.email && (
                <a
                  href={`mailto:${alumni.email}`}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlumniDetailModal;