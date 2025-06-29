import { useState, useEffect } from "react";

const RoomCard = ({ room, onBook }) => {
  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setCurrentTime(formatted);
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(
        `https://meeting-room-booking-backend-nto9.onrender.com/api/bookings/room/${room.id}/today`
      );
      const data = await res.json();
      setSchedule(data);
      setShowSchedule(true);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{room.name}</h3>
      <p className="text-sm text-gray-600">Capacity: {room.capacity} people</p>
      <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
        {room.equipment?.split(",").map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onBook(room)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Book
        </button>
        <button
          onClick={() => {
            if (!showSchedule) fetchSchedule();
            else setShowSchedule(false);
          }}
          className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 py-2 px-4 rounded-lg"
        >
          {showSchedule ? "Hide Availability" : "View Availability"}
        </button>
      </div>

      {showSchedule && (
        <div className="mt-4 text-sm text-gray-700">
          <strong>Booked Slots Today:</strong>
          <p className="text-xs italic text-gray-500 mt-1">
            Current time: {currentTime}
          </p>
          {schedule.length === 0 ? (
            <p className="text-gray-500 mt-1">No bookings yet for today.</p>
          ) : (
            <ul className="list-disc list-inside mt-1 space-y-1">
              {schedule.map((slot, idx) => (
                <li key={idx}>
                  {new Date(slot.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(slot.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({slot.title})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomCard;
