import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    attendees: "",
    start: "",
    end: "",
    equipment: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.id) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/user/${user.id}`
        );
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [user?.id]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}?user=${user.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        alert("Booking cancelled.");
      } else {
        alert(data.error || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Something went wrong.");
    }
  };

  const toDatetimeLocal = (str) => {
    const d = new Date(str);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      title: booking.title,
      attendees: booking.attendees_count,
      start: toDatetimeLocal(booking.start_time),
      end: toDatetimeLocal(booking.end_time),
      equipment: booking.equipment || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingBooking) return;

    const updated = {
      title: editForm.title,
      attendees_count: editForm.attendees,
      start_time: editForm.start,
      end_time: editForm.end,
      equipment: editForm.equipment,
      user_id: user.id,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${editingBooking.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Booking updated!");
        setEditingBooking(null);
        const fresh = await fetch(
          `http://localhost:5000/api/bookings/user/${user.id}`
        );
        setBookings(await fresh.json());
      } else {
        alert(data.error || "Update failed.");
      }
    } catch (err) {
      console.error("Error updating:", err);
      alert("Something went wrong.");
    }
  };

  const getDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    if (diff <= 0) return "";
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hrs > 0 ? hrs + " hr " : ""}${mins} mins`;
  };

  const isOngoing = (start, end) => {
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">My Bookings</h1>
        <Link
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Back to Dashboard
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-500">You haven’t booked any rooms yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white rounded-xl shadow p-6 border ${
                isOngoing(booking.start_time, booking.end_time)
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-blue-100"
              }`}
            >
              <h2 className="text-lg font-semibold text-blue-700">
                {booking.title}
              </h2>
              <p className="text-sm text-gray-600">
                Room: {booking.room_name || `#${booking.room_id}`} | Attendees:{" "}
                {booking.attendees_count}
              </p>
              <p className="text-sm text-gray-600">
                Start: {new Date(booking.start_time).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                End: {new Date(booking.end_time).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 italic">
                Duration: {getDuration(booking.start_time, booking.end_time)}
              </p>
              {booking.equipment && (
                <p className="text-sm text-gray-500 mt-1">
                  Equipment: {booking.equipment}
                </p>
              )}

              <div className="mt-3 flex gap-4 text-sm">
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="text-red-600 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditClick(booking)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingBooking && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-blue-700">
              Edit Booking - {editingBooking.title}
            </h2>

            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Meeting Title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              placeholder="Attendees"
              value={editForm.attendees}
              onChange={(e) =>
                setEditForm({ ...editForm, attendees: e.target.value })
              }
            />

            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={editForm.start}
              onChange={(e) =>
                setEditForm({ ...editForm, start: e.target.value })
              }
            />

            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={editForm.end}
              onChange={(e) =>
                setEditForm({ ...editForm, end: e.target.value })
              }
            />

            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Optional Equipment (comma-separated)"
              value={editForm.equipment}
              onChange={(e) =>
                setEditForm({ ...editForm, equipment: e.target.value })
              }
            />

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditingBooking(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
