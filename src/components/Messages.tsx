import { useAlumniMessage } from "@/hooks/useAlumniMessage";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Messages = () => {
  const { data, isLoading, error } = useAlumniMessage();
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Error loading messages</p>;
  if (!data || data.length === 0) return null;

  const itemWidth = 360 + 24; // card width + gap
  const totalItems = data.length;

  const moveLeft = () => {
    setOffset((prev) => Math.max(prev - 1, 0));
  };

  const moveRight = () => {
    setOffset((prev) => Math.min(prev + 1, totalItems - 1));
  };

  return (
    <div className="w-full overflow-hidden py-10 bg-gray-50 relative">
      
      {/* Left Button */}
      <button
        onClick={moveLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Right Button */}
      <button
        onClick={moveRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      <div
        className="flex transition-transform duration-500 gap-6"
        style={{ transform: `translateX(-${offset * itemWidth}px)` }}
        ref={containerRef}
      >
        {data.map((alumni, index) => (
          <div
            key={index}
            className="w-[360px] flex-shrink-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:scale-105"
          >
            <div className="flex items-center gap-4">
              {/* AVATAR WITH SMALL PROFILE PIC */}
              <div className="relative">
                {alumni.photo_url ? (
                  <img
                    src={alumni.photo_url}
                    alt={alumni.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-50"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-400">
                    {alumni.name.charAt(0)}
                  </div>
                )}

                {/* SMALL PROFILE PIC (BADGE) */}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center ring-2 ring-white">
                  {alumni.name.charAt(0)}
                </div>
              </div>

              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 truncate">
                  {alumni.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {alumni.department} • {alumni.batch}
                </p>
                <p className="text-xs font-medium text-blue-600 truncate">
                  {alumni.current_position} @ {alumni.company}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 line-clamp-4">
              “{alumni.message}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
