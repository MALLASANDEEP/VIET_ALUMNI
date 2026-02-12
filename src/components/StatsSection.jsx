import React from "react";

const statsData = [
  { number: "100%", label: "Enrollment Ratio", description: "Among top engineering institutions" },
  { number: "85+%", label: "Placement Rate", description: "150+ companies visit annually" },
  { number: "16 acres", label: "Lush Green Campus", description: "State-of-the-art infrastructure" },
  { number: "200+", label: "Faculty Members", description: "30% with PhD qualifications" },
  { number: "5000+", label: "Students", description: "From whole india" },
  { number: "12+", label: "Research Projects", description: "With ₹5+lac  in funding" },
  { number: "45+", label: "Academia & Industry", description: "Strong collaboration with Premier institutions and global industries" },
  { number: "42", label: "H-Index", description: "Encourages innovation, publications as key components of academic success" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-2">VSPT GALANCE</h2>
        <p className="text-gray-600 mb-12">A snapshot of our achievements and community</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-bold text-blue-600">{stat.number}</h3>
              <p className="font-semibold mt-2">{stat.label}</p>
              <p className="text-gray-500 mt-1 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
