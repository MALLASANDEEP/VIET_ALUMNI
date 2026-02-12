import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { motion, AnimatePresence } from "framer-motion";

const AdminEvents = () => {
  const {
    data = [],
    isLoading,
    addEvent,
    deleteEvent,
    updateSection,
    updateEvent,
  } = useEvents();

  const section = data.find((item) => item.type === "section") || null;
  const events = data.filter((item) => item.type === "event");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [eventData, setEventData] = useState({
    id: "",
    title: "",
    description: "",
    event_date: "",
    venue: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Sync section
  useEffect(() => {
    if (section) {
      setTitle(section.title || "");
      setDescription(section.description || "");
    }
  }, [section]);

  const resetForm = () => {
    setEventData({
      id: "",
      title: "",
      description: "",
      event_date: "",
      venue: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = () => {
    if (!eventData.title || !eventData.event_date) {
      alert("Title and Date are required");
      return;
    }

    if (isEditing) {
      updateEvent.mutate(eventData, {
        onSuccess: () => resetForm(),
      });
    } else {
      const { id, ...newEvent } = eventData;

      addEvent.mutate(
        {
          ...newEvent,
          type: "event",
        },
        {
          onSuccess: () => resetForm(),
        }
      );
    }
  };

  const handleEdit = (event: any) => {
    setEventData({
      id: event.id,
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date || "",
      venue: event.venue || "",
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id);
  };

  if (isLoading) {
    return <div className="px-8 pb-8">Loading...</div>;
  }

  return (
    <div className="px-8 pb-8 space-y-10">

      {/* SECTION EDIT */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4 text-lg">Edit Section</h2>

        <input
          className="border p-2 w-full mb-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Section Title"
        />

        <textarea
          className="border p-2 w-full mb-3 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Section Description"
        />

        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={() =>
            updateSection.mutate({ title, description })
          }
        >
          Save Section
        </button>
      </div>

      {/* ADD / EDIT EVENT */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4 text-lg">
          {isEditing ? "Edit Event" : "Add Event"}
        </h2>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Event Title"
          value={eventData.title}
          onChange={(e) =>
            setEventData({ ...eventData, title: e.target.value })
          }
        />

        <textarea
          className="border p-2 w-full mb-3 rounded"
          placeholder="Description"
          value={eventData.description}
          onChange={(e) =>
            setEventData({ ...eventData, description: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 w-full mb-3 rounded"
          value={eventData.event_date}
          onChange={(e) =>
            setEventData({ ...eventData, event_date: e.target.value })
          }
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Venue"
          value={eventData.venue}
          onChange={(e) =>
            setEventData({ ...eventData, venue: e.target.value })
          }
        />

        <div className="flex gap-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {isEditing ? "Update Event" : "Add Event"}
          </button>

          {isEditing && (
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* EVENTS LIST */}
      <div>
        <h2 className="font-bold mb-4 text-lg">All Events</h2>

        {events.length === 0 && (
          <p className="text-gray-500">No events added yet.</p>
        )}

        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              layout
              className="bg-gray-100 p-4 rounded mb-3"
            >
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p>{event.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {event.event_date} | {event.venue}
              </p>

              <div className="flex gap-4 mt-3">
                <button
                  className="text-blue-600 font-medium"
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </button>

                <button
                  className="text-red-600 font-medium"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default AdminEvents;
