import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  Check,
  Filter,
  X,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { useAlumni } from "@/hooks/useAlumni";
import { useAlumniHero } from "@/hooks/useAlumniHero";
import { useHero } from "@/hooks/useHero";
import Navbar from "@/components/Navbar";
import AlumniDetailModal from "@/components/AlumniDetailModal";

/* ---------------- CONSTANTS ---------------- */
const departments = ["All", "Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "MBA", "IT"];
const batches = ["All", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];
const salaryRanges = [
  { label: "All Packages", min: 0 },
  { label: "5L+ LPA", min: 5 },
  { label: "10L+ LPA", min: 10 },
  { label: "20L+ LPA", min: 20 },
];

const DepartmentFilter = () => {
  const { data: alumniData, isLoading: alumniLoading } = useAlumni();
  const dbAlumni = alumniData?.alumni || [];
  const { data: alumniHero, isLoading: alumniHeroLoading } = useAlumniHero();
  const { hero: homeHero, loading: homeHeroLoading } = useHero();

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [minLPA, setMinLPA] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (!homeHero?.bg_images || homeHero.bg_images.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % homeHero.bg_images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homeHero?.bg_images]);

  const backgroundImage = homeHero?.bg_type === "image" && homeHero.bg_images?.length > 0
      ? homeHero.bg_images[bgIndex]
      : "/default-hero.jpg";

  const filteredAndSortedAlumni = dbAlumni
    .filter((alumni: any) => {
      const matchesDept = selectedDept === "All" || alumni.department === selectedDept;
      const matchesBatch = selectedBatch === "All" || alumni.batch === selectedBatch;
      const matchesLPA = (Number(alumni.lpa) || 0) >= minLPA;
      const matchesSearch = alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.company?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesBatch && matchesLPA && matchesSearch;
    })
    .sort((a: any, b: any) => (Number(b.lpa) || 0) - (Number(a.lpa) || 0));

  const CustomSelect = ({ label, value, options, onChange, id }: any) => {
    const isOpen = openDropdown === id;
    return (
      <div className="relative flex flex-col w-full">
        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5 ml-1">
          {label}
        </label>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className={`h-12 md:h-10 px-4 rounded-xl flex items-center justify-between border text-sm md:text-xs font-semibold transition-all
            ${value !== "All" && value !== "All Packages" 
              ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/10" 
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute top-[115%] left-0 w-full z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-1"
              >
                {options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => { onChange(opt); setOpenDropdown(null); }}
                    className="w-full px-4 py-3 md:py-2 text-left text-sm md:text-xs font-medium hover:bg-slate-50 flex justify-between items-center transition-colors"
                  >
                    {opt}
                    {value === opt && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (alumniLoading || alumniHeroLoading || homeHeroLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-400 font-medium animate-pulse">Curating Excellence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* HERO SECTION - Optimized for Mobile Viewport */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-end overflow-hidden">
        <motion.img
          key={backgroundImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          src={backgroundImage}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 w-full container mx-auto px-6 pb-24 md:pb-32">
          <div className="max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4"
            >
              Exclusively for VSPT
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight"
            >
              {alumniHero?.title || "VSPT Elite"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-slate-200/90 max-w-xl font-light leading-relaxed"
            >
              {alumniHero?.subtitle || "The premium directory of high-achieving alumni."}
            </motion.p>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER BAR - Floating Card Design */}
      <main className="container mx-auto px-4 relative z-30 pb-20 -mt-12 md:-mt-16">
        <div className="bg-white rounded-[2rem] md:rounded-3xl border border-slate-200/60 p-3 md:p-5 shadow-2xl shadow-indigo-900/10">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search name, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 md:h-10 rounded-2xl md:rounded-xl border-slate-200 focus:ring-indigo-500/20 text-base md:text-xs transition-all"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center justify-center gap-2 h-14 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700"
            >
              <Filter className="w-4 h-4" />
              {isMobileFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Filters - Responsive visibility */}
            <div className={`${isMobileFilterOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-4 md:gap-3 w-full md:w-auto mt-2 md:mt-0`}>
              <div className="w-full md:w-44">
                <CustomSelect id="dept" label="Department" value={selectedDept} options={departments} onChange={setSelectedDept} />
              </div>
              <div className="w-full md:w-28">
                <CustomSelect id="batch" label="Batch" value={selectedBatch} options={batches} onChange={setSelectedBatch} />
              </div>
              <div className="w-full md:w-40">
                <CustomSelect 
                  id="salary" 
                  label="Package" 
                  value={salaryRanges.find((s) => s.min === minLPA)?.label || "All Packages"} 
                  options={salaryRanges.map((s) => s.label)} 
                  onChange={(label: string) => setMinLPA(salaryRanges.find((s) => s.label === label)?.min || 0)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ALUMNI GRID - Modern Card Layout */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedAlumni.length > 0 ? (
              filteredAndSortedAlumni.map((alumni: any) => (
                <motion.div
                  layout
                  key={alumni.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedAlumni(alumni)}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-indigo-100 transition-colors">
                        {alumni.photo_url ? (
                          <img src={alumni.photo_url} alt={alumni.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                            {alumni.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" title="Verified Alumni" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {alumni.name}
                      </h3>
                      
                      
                      <p className="text-slate-500 text-sm font-medium truncate flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        {alumni.company || "Elite Network"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODAL */}
      {selectedAlumni && (
        <AlumniDetailModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
        />
      )}
    </div>
  );
};

export default DepartmentFilter;