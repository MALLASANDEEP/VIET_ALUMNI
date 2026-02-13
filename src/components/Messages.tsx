import { useAlumniMessage } from "@/hooks/useAlumniMessage";

const Messages = () => {
  const { data, isLoading, error } = useAlumniMessage();

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Error loading messages</p>;
  if (!data || data.length === 0) return null;

  const marqueeData = [...data, ...data];

  return (
    <div className="w-full overflow-hidden py-10 bg-gray-50">
      <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
        {marqueeData.map((alumni, index) => (
          <div
            key={index}
            className="w-[360px] flex-shrink-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
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
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center ring-2 ring-white">
                  {alumni.name.charAt(0)}
                </div>
              </div>

              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 truncate">{alumni.name}</h3>
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
