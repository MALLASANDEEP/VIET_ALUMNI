import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useHero } from "@/hooks/useHero";

/* 🔁 Reusable About Section */

interface AboutSectionProps {
  title: string;
  content: string;
  image: string;
  reverse?: boolean; // ✅ made optional
  link?: string;
}

const AboutSection = ({
  title,
  content,
  image,
  reverse = false, // ✅ default value
  link,
}: AboutSectionProps) => {
  return (
    <section className="py-6 overflow-hidden">
      <div className="grid md:grid-cols-2 items-center md:gap-4 max-w-8xl mx-auto">
        {/* IMAGE */}
        <div
          className={`${
            reverse ? "md:order-2 md:ml-auto" : "md:order-1 md:mr-auto"
          } w-screen md:w-full`}
        >
          {image && (
            <img
              src={image}
              alt={title}
              className={`h-[380px] w-full object-cover ${
                reverse ? "rounded-l-[140px]" : "rounded-r-[140px]"
              }`}
            />
          )}
        </div>

        {/* CONTENT */}
        <div
          className={`px-4 md:px-6 max-w-xl mx-auto ${
            reverse ? "md:order-1" : "md:order-2"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg mb-4">
            {content}
          </p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            >
              Know More →
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

/* 📄 Main Page */

const AboutUs = () => {
  const { hero: homeHero } = useHero();
  const [bgIndex, setBgIndex] = useState(0);

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

  return (
    <div className="w-full">
      <Navbar />

      {/* HERO */}
      <section className="relative text-white h-[85vh] flex items-end overflow-hidden">
        {/* Sliding Background */}
        <div className="absolute inset-0 -z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={backgroundImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          </AnimatePresence>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 -z-10" />

        {/* Bottom Left Content */}
        <div className="relative z-10 px-10 pb-20 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            About Visakha College
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Empowering students through excellence in education, innovation,
            and social responsibility.
          </p>
        </div>
      </section>

      {/* SECTIONS */}
      <div className="bg-gray-50">
        <AboutSection
          title="Our Mission"
          content="Our mission is to provide a transformative education that nurtures intellectual curiosity, creativity, and leadership in every student. We focus on ethical values, social responsibility, and personal growth to prepare students to thrive in a competitive and evolving world. Through modern teaching methods, industry-oriented programs, and mentorship from experienced faculty, we aim to empower students to become competent professionals, innovative thinkers, and compassionate citizens who contribute meaningfully to society."
          image="https://www.viet.edu.in/img/facilities-imgs/placements-left-bg.jpeg"
          link="https://your-mission-page.com"
        />

        <AboutSection
          title="Our Vision"
          content="To be a leading institution recognized nationally and globally for academic excellence, innovation, and societal impact. We aspire to cultivate an environment where students, faculty, and researchers collaborate to drive progress in science, technology, arts, and humanities. By fostering creativity, critical thinking, and global perspectives, our vision is to produce professionals who are capable of shaping a better and sustainable future."
          image="https://www.viet.edu.in/admin-center/uploads/d5ab845e93f8bbdee676bb618dda6158.jpeg"
          reverse
          link="https://your-vision-page.com"
        />

        <AboutSection
          title="Research & Innovation"
          content="We are committed to promoting a culture of research, experimentation, and innovation across all disciplines. Our state-of-the-art laboratories, research centers, and innovation hubs provide students and faculty with the tools to explore cutting-edge technologies and solutions to real-world challenges. From participating in national and international competitions to publishing research in reputed journals, our students are encouraged to think critically, experiment boldly, and innovate fearlessly."
          image="https://www.viet.edu.in/admin-center/uploads/dc186c024cfe744162f9600705a8742b.jpeg"
          link="https://your-research-page.com"
        />
      </div>

      {/* CTA */}
      <section className="py-6 text-center bg-[url('/images/hero-bg.jpg')] bg-cover bg-center relative">
        <div className="max-w-4xl mx-auto p-12 bg-black/20 backdrop-blur-md rounded-3xl shadow-xl">
          <h2 className="text-4xl font-bold mb-6 text-black/90">
            Join the Visakha College Family
          </h2>
          <p className="text-lg mb-8 text-black/90">
            Begin your journey of knowledge, growth, and success with us.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSe8Ca17CXUJLTO2ZYkfLUveic3f8DUo1cMEtLYToUE_Iu6TOw/viewform?pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
