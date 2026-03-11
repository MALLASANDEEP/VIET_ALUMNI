import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const ProfessionalGallery = lazy(() => import("@/pages/Contet"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const AlumniMarquee = lazy(() => import("@/components/AlumniMarquee"));
const EventsSlider = lazy(() => import("@/components/Events"));
const GallerySection = lazy(() => import("@/components/GallerySection"));
const StudentMarquee = lazy(() => import("@/components/Messages"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<div className="h-24" />}>
        <ProfessionalGallery />
        <StatsSection />
        <AlumniMarquee />
        <EventsSlider />
        <GallerySection />
        <StudentMarquee />
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;