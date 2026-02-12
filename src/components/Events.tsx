import useEvents from "@/hooks/useEvents";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EventsSection = () => {
  const { data } = useEvents();

  const section = data.find((item) => item.type === "section");
  const events = data.filter((item) => item.type === "event");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto slide (2 at a time)
  useEffect(() => {
    if (showAll) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 2 >= events.length) return 0;
        return prev + 2;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [events.length, showAll]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sectionRef.current &&
        !sectionRef.current.contains(e.target as Node)
      ) {
        setShowAll(false);
      }
    };

    if (showAll) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAll]);

  const visibleEvents = events.slice(currentIndex, currentIndex + 2);

  return (
    <section
      id="events"
      className="pt-0 pb-20 bg-gray-50 relative scroll-mt-24"
      ref={sectionRef}
    >
      <div className="max-w-4xl mx-auto px-2">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            {section?.title}
          </h2>
          <p className="text-gray-500 mt-4">
            {section?.description}
          </p>
        </div>

        {!showAll ? (
          <>
            {/* Sliding View (NO FIXED HEIGHT NOW) */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -80 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  {visibleEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-6 bg-white rounded-xl shadow border-l-4 border-indigo-600"
                    >
                      <h3 className="text-xl font-bold">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {event.description}
                      </p>

                      <div className="text-sm text-gray-500 mt-3 flex gap-6">
                        <span>📅 {event.event_date}</span>
                        <span>📍 {event.venue}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Button bottom-right */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:scale-105 transition-transform duration-300"
              >
                See All
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Show All Mode */}
            <div className="space-y-6">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="p-6 bg-white rounded-xl shadow border-l-4 border-indigo-600 cursor-pointer"
                >
                  <h3 className="text-xl font-bold">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {event.description}
                  </p>

                  <div className="text-sm text-gray-500 mt-3 flex gap-6">
                    <span>📅 {event.event_date}</span>
                    <span>📍 {event.venue}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Close button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAll(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:scale-105 transition-transform duration-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
