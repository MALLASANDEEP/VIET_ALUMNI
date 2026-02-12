import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AlumniMarquee from "@/components/AlumniMarquee";

import DepartmentFilter from "@/pages/DepartmentFilter";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import StudentMarquee from "@/components/Messages";
import ProfessionalGallery from "@/pages/Contet";
import StatsSection from "@/components/StatsSection";
import EventsSlider from "@/components/Events";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProfessionalGallery />
      <StatsSection />
      <AlumniMarquee />
      <EventsSlider  />
      <GallerySection />
      <StudentMarquee />
      <Footer />
    </main>
  );
};

export default Index;