/**
 * WhatsApp-style date and time formatting utilities
 */

const getToday = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format date like WhatsApp
 * Returns: "Today", "Yesterday", "Mon 14 Apr", or "14/04/2026"
 */
export const formatWhatsAppDate = (date) => {
  const d = new Date(date);
  const today = getToday();
  const yesterday = getYesterday();

  if (isSameDay(d, today)) {
    return "Today";
  }
  if (isSameDay(d, yesterday)) {
    return "Yesterday";
  }

  // For dates older than yesterday, show format: "Mon 14 Apr"
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString("en-US", { month: "short" });

  return `${dayName} ${dayNum} ${monthName}`;
};

/**
 * Format time like WhatsApp (HH:MM)
 */
export const formatWhatsAppTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

/**
 * Group messages by date for WhatsApp-style display
 */
export const groupMessagesByDate = (messages) => {
  const grouped = {};

  messages.forEach((message) => {
    const dateKey = formatWhatsAppDate(message.created_at);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  return grouped;
};
