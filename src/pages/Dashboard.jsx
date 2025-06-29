import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RoomCard from "../components/RoomCard";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    title: "",
    attendees: "",
    start: "",
    end: "",
    equipment: [],
  });
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFilter = async () => {
    if (!filterStart || !filterEnd) return alert("Please select both times.");
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?start=${encodeURIComponent(
          filterStart
        )}&end=${encodeURIComponent(filterEnd)}`
      );
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Filter error:", err);
      alert("Failed to fetch available rooms.");
    }
  };

  const handleBookSubmit = async () => {
    const { title, attendees, start, end, equipment } = form;
    if (!title || !attendees || !start || !end || !selectedRoom) {
      alert("Please fill in all fields.");
      return;
    }

    if (parseInt(attendees) > selectedRoom.capacity) {
      alert("Attendees exceed room capacity.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: selectedRoom.id,
          user_id: user.id,
          title,
          start_time: start,
          end_time: end,
          attendees_count: attendees,
          equipment: equipment.join(", "),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Booking successful!");
        setSelectedRoom(null);
        fetchRooms();
      } else {
        alert(data.error || "Booking failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Network error.");
    }
  };

  const duration = () => {
    if (!form.start || !form.end) return "";
    const start = new Date(form.start);
    const end = new Date(form.end);
    const diffMs = end - start;
    if (diffMs <= 0) return "";
    const mins = Math.floor((diffMs / 1000 / 60) % 60);
    const hrs = Math.floor(diffMs / 1000 / 60 / 60);
    return `${hrs > 0 ? hrs + " hr " : ""}${mins} mins`;
  };

  const handleEquipmentChange = (item) => {
    setForm((prev) => {
      const updated = [...prev.equipment];
      if (updated.includes(item)) {
        return { ...prev, equipment: updated.filter((e) => e !== item) };
      } else {
        return { ...prev, equipment: [...updated, item] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-100 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-blue-800">
          Welcome, {user?.name || "Guest"} 👋
        </h1>
        <div className="flex items-center gap-4">
          <Link
            to="/mybookings"
            className="text-blue-700 font-medium underline hover:text-blue-900"
          >
            View My Bookings
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.reload();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Time Filter Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">
          Filter by Time Range
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="datetime-local"
            className="border px-3 py-2 rounded"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border px-3 py-2 rounded"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
          />
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Filter Available Rooms
          </button>
          <button
            onClick={() => {
              setFilterStart("");
              setFilterEnd("");
              fetchRooms();
            }}
            className="text-sm text-blue-600 underline"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <h2 className="text-lg text-gray-600 mb-4">Available Meeting Rooms:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onBook={() => setSelectedRoom(room)}
          />
        ))}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-blue-700">
              Book {selectedRoom.name}
            </h2>

            <input
              type="text"
              placeholder="Meeting Title"
              className="w-full border px-3 py-2 rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              type="number"
              placeholder="Number of Attendees"
              className="w-full border px-3 py-2 rounded"
              value={form.attendees}
              onChange={(e) => setForm({ ...form, attendees: e.target.value })}
            />

            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />

            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />

            {form.start && form.end && (
              <p className="text-sm text-gray-500">Duration: {duration()}</p>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Optional Equipment:
              </p>
              {selectedRoom.equipment?.split(",").map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.equipment.includes(item.trim())}
                    onChange={() => handleEquipmentChange(item.trim())}
                  />
                  <span>{item.trim()}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setSelectedRoom(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleBookSubmit}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
