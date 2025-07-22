import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const seatColors = {
  available: "bg-green-100 text-green-800 border-green-400",
  booked: "bg-yellow-100 text-yellow-800 border-yellow-400",
  confirmed: "bg-red-100 text-red-800 border-red-400",
  selected: "bg-blue-100 text-blue-800 border-blue-400",
  flagged: "bg-red-50 text-red-700 border-red-300 ",
};

const statusLabels = {
  available: "Available",
  booked: "Booked",
  confirmed: "Occupied",
  selected: "Your Seat",
  flagged: "Reported",
};

const mapStatus = (seat, userId) => {
  if (seat.is_under_review) return "flagged";
  if (seat.status === "free") return "available";
  // Logic to determine if the seat is 'selected' (booked/confirmed by current user)
  if (seat.user_id === userId) {
    if (seat.status === "booked") return "selected"; // User has booked this seat
    if (seat.status === "confirmed") return "selected"; // User is confirmed in this seat
  }
  if (seat.status === "booked") return "booked"; // Booked by someone else
  if (seat.status === "confirmed") return "confirmed"; // Confirmed/occupied by someone else
  return "available"; // Default fallback
};

const FloorPlan = () => {
  const { floorId } = useParams();
  const floor = parseInt(floorId, 10);
  const [seats, setSeats] = useState([]); // This stores ALL seats from API
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false); // For reporting modal
  const [reportSeatId, setReportSeatId] = useState(null);

  // --- NEW STATE FOR BOOKING OPTIONS MODAL ---
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [selectedSeatForBooking, setSelectedSeatForBooking] = useState(null);
  // --- NEW STATE FOR FRIEND'S EMAIL MODAL ---
  const [showFriendEmailModal, setShowFriendEmailModal] = useState(false); // Controls visibility of email input modal
  const [friendEmail, setFriendEmail] = useState(""); // Stores the entered email
  // --- END NEW STATE ---

  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id || payload.sub);
    } catch {
      setUserId(null);
    }
  }, []);

  const openBookingOptions = (seat) => {
    setSelectedSeatForBooking(seat);
    setShowBookingOptions(true);
  };

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await axios.get(`${API_URL}/api/seats`);
      setSeats(res.data);
    } catch (err) {
      console.error("Failed to fetch seats:", err);
      setApiError("Failed to load seats. Please check your connection.");
      setSeats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats, floor, retryCount]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.05,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, [loading, seats, floor]);

  const openConfirmDialog = (seatId) => {
    setReportSeatId(seatId);
    setShowConfirm(true);
  };

  const confirmReport = async () => {
    if (!userId) {
      alert("Please log in to report.");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/reports`, { seatId: reportSeatId });
      alert("Seat reported successfully!"); // Provide user feedback
      fetchSeats(); // Refresh seats to show the 'flagged' status
    } catch (err) {
      console.error("Report failed:", err);
      alert("Failed to report. Please try again.");
    } finally {
      setShowConfirm(false);
      setReportSeatId(null);
    }
  };

  const handleBookForMe = () => {
    if (!userId) {
      alert("Please log in to book a seat.");
      return;
    }
    navigate(`/confirm/${selectedSeatForBooking.id}`);
    setShowBookingOptions(false);
    setSelectedSeatForBooking(null);
  };

  // --- MODIFIED handleBookForFriend ---
  const handleBookForFriend = () => {
    if (!userId) {
      alert("Please log in to book a seat for a friend.");
      return;
    }
    setShowBookingOptions(false); // Close the first modal
    setShowFriendEmailModal(true); // Open the new email input modal
    // selectedSeatForBooking remains set from openBookingOptions
  };

  // --- NEW FUNCTION: Confirm booking for a friend ---
  const handleConfirmFriendBooking = async () => {
    if (!friendEmail || !selectedSeatForBooking) {
      alert("Please enter a valid email and select a seat.");
      return;
    }
    if (!userId) { // Should already be logged in but double-check
      alert("Authentication required to book for a friend.");
      return;
    }

    try {
      // Placeholder API call for booking for a friend
      // You NEED to implement this endpoint on your backend
      // const response = await axios.post(`${API_URL}/api/seats/book-for-friend`, {
      //   seatId: selectedSeatForBooking.id,
      //   friendEmail: friendEmail,
      //   bookedByUserId: userId // Include current user's ID
      // });
     const token = localStorage.getItem("token");

      const response = await axios.post(
  `${API_URL}/api/seats/book-for-friend`,
  {
    seatId: selectedSeatForBooking.id,
    friendEmail: friendEmail,
    bookedByUserId: userId
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      alert(`Seat ${selectedSeatForBooking.seat_number} booked for ${friendEmail} successfully!`);
      console.log("Friend booking successful:", response.data);

      setShowFriendEmailModal(false); // Close modal
      setSelectedSeatForBooking(null); // Clear selected seat
      setFriendEmail(""); // Clear email input
      fetchSeats(); // Refresh seats to reflect new status
    } catch (err) {
      console.error("Failed to book for friend:", err.response ? err.response.data : err.message);
      alert(`Failed to book for friend: ${err.response?.data?.message || err.message}`);
    }
  };
  // --- END NEW FUNCTIONS ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-80">
          <span className="text-gray-600 text-lg font-medium animate-pulse">
            Loading seats…
          </span>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-80">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{apiError}</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredSeats = seats.filter((seat) => seat.floor === floor);

  if (filteredSeats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-80">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            No seats found on this floor.
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-center">
          Floor {floor} Plan
        </h1>
        <p className="text-gray-600 text-base sm:text-lg text-center mb-10">
          Select an available seat to reserve your spot.
        </p>

        <div
          ref={gridRef}
          className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 justify-items-center"
        >
          {filteredSeats.map((seat) => {
            const status = mapStatus(seat, userId);
            const isSelectable = status === "available" || status === "selected";

            return (
              <div key={seat.id} className="flex flex-col items-center">
                <button
                  onClick={() => isSelectable && openBookingOptions(seat)}
                  disabled={!isSelectable}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl font-semibold text-lg border flex items-center justify-center transition transform ${seatColors[status]} ${
                    isSelectable
                      ? "hover:scale-105 hover:shadow-md cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-blue-300 group`}
                  aria-label={`Seat ${seat.seat_number} is ${statusLabels[status]}`}
                >
                  <span className="text-2xl">{seat.seat_number}</span>
                  <span
                    className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-0.5 text-xs font-medium rounded-full border ${
                      status === "available"
                        ? "bg-white text-green-700 border-green-300"
                        : status === "selected"
                        ? "bg-white text-blue-700 border-blue-300"
                        : status === "booked"
                        ? "bg-white text-yellow-700 border-yellow-300"
                        : "bg-white text-red-700 border-red-300"
                    } group-hover:scale-105 transition transform`}
                  >
                    {statusLabels[status]}
                  </span>
                  {status === "selected" && (
                    <span className="absolute inset-0 rounded-xl animate-pulse bg-blue-300/20 pointer-events-none" />
                  )}
                </button>

                {status === "confirmed" && (
                  <button
                    onClick={() => openConfirmDialog(seat.id)}
                    className="mt-7 px-3 py-1 text-sm cursor-pointer font-medium text-red-600 bg-white border border-red-300 rounded-full shadow-sm hover:scale-105 hover:border-red-400 hover:text-red-700 transition"
                  >
                    ⚠️ Report seat
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CONFIRMATION MODAL FOR REPORTING (EXISTING) --- */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">Report this seat?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to report this seat as incorrectly occupied?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setReportSeatId(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReport}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING OPTIONS MODAL --- */}
      {showBookingOptions && selectedSeatForBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Book Seat {selectedSeatForBooking.seat_number}?
            </h3>
            <p className="text-gray-700 mb-6">
              Choose how you want to book this seat.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleBookForMe}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
              >
                Book for Me
              </button>
              <button
                onClick={handleBookForFriend} // This now closes this modal and opens the friend email modal
                className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
              >
                Book for a Friend
              </button>
              <button
                onClick={() => {
                  setShowBookingOptions(false);
                  setSelectedSeatForBooking(null);
                }}
                className="w-full px-6 py-3 rounded-lg bg-gray-300 text-gray-800 text-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW FRIEND'S EMAIL INPUT MODAL --- */}
      {showFriendEmailModal && selectedSeatForBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Book Seat {selectedSeatForBooking.seat_number} for a Friend
            </h3>
            <p className="text-gray-700 mb-6">
              Enter your friend's email address:
            </p>
            <input
              type="email"
              placeholder="friend@example.com"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => {
                  setShowFriendEmailModal(false);
                  setFriendEmail(""); // Clear email on cancel
                  // Optionally, reopen the previous modal if desired: setShowBookingOptions(true);
                  // For simplicity, we just close both here.
                }}
                className="w-1/2 px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFriendBooking}
                className="w-1/2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlan;