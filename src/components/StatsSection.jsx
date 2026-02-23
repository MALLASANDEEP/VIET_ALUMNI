import React from "react";
import { motion } from "framer-motion";

const statsData = [
  { number: "100%", label: "Enrollment Ratio", description: "Among top engineering institutions" },
  { number: "85+%", label: "Placement Rate", description: "150+ companies visit annually" },
  { number: "16 acres", label: "Lush Green Campus", description: "State-of-the-art infrastructure" },
  { number: "200+", label: "Faculty Members", description: "30% with PhD qualifications" },
  { number: "5000+", label: "Students", description: "From whole India" },
  { number: "12+", label: "Research Projects", description: "With ₹5+lac in funding" },
  { number: "45+", label: "Academia & Industry", description: "Strong collaboration with industry" },
  { number: "42", label: "H-Index", description: "Encourages innovation & success" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">VSPT AT A GLANCE</h2>
          <p className="text-gray-600 mb-12">A snapshot of our achievements and community</p>
        </motion.div>

        {/* grid-cols-2: 2 items per row on mobile
          md:grid-cols-3: 3 items per row on tablets
          lg:grid-cols-4: 4 items per row on desktop
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-md rounded-xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-center border border-gray-100"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-blue-600">
                {stat.number}
              </h3>
              <p className="font-bold text-gray-800 mt-2 text-sm md:text-base leading-tight">
                {stat.label}
              </p>
              <p className="text-gray-500 mt-1 text-[10px] md:text-sm leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;