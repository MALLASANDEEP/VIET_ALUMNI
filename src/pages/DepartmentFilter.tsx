import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  Check,
  Building,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { useAlumni } from "@/hooks/useAlumni";
import { useAlumniHero } from "@/hooks/useAlumniHero";
import { useHero } from "@/hooks/useHero";
import Navbar from "@/components/Navbar";
import AlumniDetailModal from "@/components/AlumniDetailModal";

/* ---------------- CONSTANTS ---------------- */

const departments = [
  "All",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "MBA",
  "IT",
];

const batches = ["All", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

const salaryRanges = [
  { label: "All Packages", min: 0 },
  { label: "5L+ LPA", min: 5 },
  { label: "10L+ LPA", min: 10 },
  { label: "20L+ LPA", min: 20 },
];

/* ---------------- COMPONENT ---------------- */

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
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null); // for modal

  useEffect(() => {
    if (!homeHero?.bg_images || homeHero.bg_images.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % homeHero.bg_images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homeHero?.bg_images]);

  const backgroundImage =
    homeHero?.bg_type === "image" && homeHero.bg_images?.length > 0
      ? homeHero.bg_images[bgIndex]
      : "/default-hero.jpg";

  const heroTitle = alumniHero?.title || "VSPT Elite";
  const heroSubtitle =
    alumniHero?.subtitle || "The premium directory of high-achieving alumni.";
  const applyUrl = alumniHero?.apply_url || "#";

  const filteredAndSortedAlumni = dbAlumni
    .filter((alumni: any) => {
      const matchesDept =
        selectedDept === "All" || alumni.department === selectedDept;
      const matchesBatch =
        selectedBatch === "All" || alumni.batch === selectedBatch;
      const matchesLPA = (Number(alumni.lpa) || 0) >= minLPA;
      const matchesSearch =
        alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.company?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesBatch && matchesLPA && matchesSearch;
    })
    .sort((a: any, b: any) => (Number(b.lpa) || 0) - (Number(a.lpa) || 0));

  const CustomSelect = ({ label, value, options, onChange, id }: any) => {
    const isOpen = openDropdown === id;
    return (
      <div className="relative flex flex-col">
        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1 ml-1">
          {label}
        </label>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className={`h-10 px-3 rounded-xl flex items-center justify-between border text-xs font-bold
            ${
              value !== "All" && value !== "All Packages"
                ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
        >
          {value}
          <ChevronDown
            className={`w-3.5 h-3.5 transition ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenDropdown(null)}
              />
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-[110%] left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-xl"
              >
                {options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex justify-between"
                  >
                    {opt}
                    {value === opt && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
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
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-end overflow-hidden text-white">
        <img
          src={backgroundImage}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          alt="Hero background"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mb-20 ml-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-6xl font-serif font-bold"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg opacity-90"
          >
            {heroSubtitle}
          </motion.p>
          <motion.a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center mt-6 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 font-bold rounded-xl hover:bg-white/30 transition-all"
          >
            Apply Now →
          </motion.a>
        </div>
      </section>

      {/* FILTER BAR */}
      <main className="container mx-auto px-6 relative z-30 pb-20 -mt-10">
        <div className="flex flex-wrap gap-4 bg-white rounded-3xl border p-4 shadow-2xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl text-xs"
            />
          </div>

          <div className="w-36">
            <CustomSelect
              id="dept"
              label="Department"
              value={selectedDept}
              options={departments}
              onChange={setSelectedDept}
            />
          </div>

          <div className="w-24">
            <CustomSelect
              id="batch"
              label="Batch"
              value={selectedBatch}
              options={batches}
              onChange={setSelectedBatch}
            />
          </div>

          <div className="w-32">
            <CustomSelect
              id="salary"
              label="Package"
              value={
                salaryRanges.find((s) => s.min === minLPA)?.label ||
                "All Packages"
              }
              options={salaryRanges.map((s) => s.label)}
              onChange={(label: string) =>
                setMinLPA(
                  salaryRanges.find((s) => s.label === label)?.min || 0
                )
              }
            />
          </div>
        </div>

        {/* ALUMNI GRID */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredAndSortedAlumni.map((alumni: any) => (
              <motion.div
                key={alumni.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 cursor-pointer flex items-center gap-4 p-3 transition-all"
                onClick={() => setSelectedAlumni(alumni)} // open modal
              >
                {/* Profile Image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border border-slate-200">
                  {alumni.photo_url ? (
                    <img
                      src={alumni.photo_url}
                      alt={alumni.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                      {alumni.name[0]}
                    </div>
                  )}
                </div>

                {/* Name & Company */}
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-base text-slate-900">
                    {alumni.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {alumni.company || "Elite Network"}
                  </p>
                </div>
              </motion.div>
            ))}
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
