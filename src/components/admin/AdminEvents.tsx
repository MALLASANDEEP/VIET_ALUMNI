import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";

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

  useEffect(() => {
    if (section) {
      setTitle(section.title || "");
      setDescription(section.description || "");
    }
  }, [section]);

  const resetForm = () => {
    setEventData({ id: "", title: "", description: "", event_date: "", venue: "" });
    setIsEditing(false);
  };

  const handleSaveSection = () => {
    if (!title.trim()) {
      alert("Please provide a section title.");
      return;
    }
    updateSection.mutate(
      { title, description },
      {
        onSuccess: () => alert("Section header updated successfully!"),
        onError: (error) => {
          console.error("Save failed:", error);
          alert("Save failed. Check console for details.");
        }
      }
    );
  };

  const handleSubmit = () => {
    if (!eventData.title || !eventData.event_date) {
      alert("Title and Date are required");
      return;
    }

    if (isEditing) {
      updateEvent.mutate(eventData, { onSuccess: () => resetForm() });
    } else {
      const { id, ...newEvent } = eventData;
      addEvent.mutate({ ...newEvent, type: "event" }, { onSuccess: () => resetForm() });
    }
  };

  if (isLoading) return <div className="p-8 text-center font-medium">Loading Events...</div>;

  return (
    <div className="p-8 space-y-10 max-w-4xl mx-auto">
      {/* SECTION HEADER EDIT */}
      <div className="bg-white p-6 rounded shadow-md border border-gray-100">
        <h2 className="font-bold mb-4 text-xl text-gray-800">Edit Section Header</h2>
        <div className="space-y-3">
          <input
            className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section Title"
          />
          <textarea
            className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Section Description"
          />
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition-colors"
            onClick={handleSaveSection}
            disabled={updateSection.isPending}
          >
            {updateSection.isPending ? "Saving..." : "Save Section Settings"}
          </button>
        </div>
      </div>

      {/* PREVIEW BOX */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
        <h1 className="text-3xl font-bold text-indigo-900">{section?.title || "Welcome to Events"}</h1>
        <p className="text-indigo-700 mt-2">{section?.description || "Stay updated with our latest gatherings."}</p>
      </div>

      {/* EVENT FORM */}
      <div className="bg-white p-6 rounded shadow-md border border-gray-100">
  <h2 className="font-bold mb-4 text-xl text-gray-800">
    {isEditing ? "Edit Event" : "Add Event"}
  </h2>

  <div className="space-y-3">
    <input
      className="border p-2 w-full rounded"
      placeholder="Event Title"
      value={eventData.title}
      onChange={(e) =>
        setEventData({ ...eventData, title: e.target.value })
      }
    /> 
    <textarea
      className="border p-2 w-full rounded"
      placeholder="Event Description"
      value={eventData.description}
      onChange={(e) =>
        setEventData({ ...eventData, description: e.target.value })
      }
    />

    <div className="grid grid-cols-2 gap-4">
      <input
        type="date"
        className="border p-2 rounded"
        value={eventData.event_date}
        onChange={(e) =>
          setEventData({ ...eventData, event_date: e.target.value })
        }
      />

      <input
        className="border p-2 rounded"
        placeholder="Venue"
        value={eventData.venue}
        onChange={(e) =>
          setEventData({ ...eventData, venue: e.target.value })
        }
      />
    </div>

    <button
      className="bg-green-600 text-white px-6 py-2 rounded"
      onClick={handleSubmit}
    >
      {isEditing ? "Update" : "Publish"}
    </button>
  </div>
</div>

      {/* EVENT LIST */}
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="bg-white border p-4 rounded flex justify-between">
            <div>
              <p className="font-bold">{e.title}</p>
              <p className="text-sm text-gray-500">{e.event_date} @ {e.venue}</p>
            </div>
            <div className="space-x-4">
              <button className="text-blue-600" onClick={() => { setEventData(e as any); setIsEditing(true); }}>Edit</button>
              <button className="text-red-600" onClick={() => deleteEvent.mutate(e.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;