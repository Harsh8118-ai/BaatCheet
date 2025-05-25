import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from "date-fns";



const RecievedRequests = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    AOS.init({ duration: 800 });

    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const [sentResponse, receivedResponse] = await Promise.all([
          axios.get(`${BASE_URL}/friends/requests/sent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/friends/requests/received`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSentRequests(sentResponse.data || []);
        setReceivedRequests(receivedResponse.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load friend requests."
        );
        toast.error(
          error.response?.data?.message || "Failed to load friend requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleConfirm = async (_id, action) => {
    const receiverId = localStorage.getItem("userId");

    if (!_id || !action || !receiverId) {
      toast.error("❌ Missing _id, receiverId, or action.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/friends/respond-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            _id,
            receiverId,
            action,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setReceivedRequests((prev) =>
        prev.filter((request) => request._id !== _id)
      );

      toast.success("✅ Friend request accepted!");

      setTimeout(() => {
        navigate("/friends");
      }, 1500);
    } catch (error) {
      toast.error("❌ Error accepting request: " + error.message);
    }
  };

  const handleDelete = async (_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/friends/respond-request`,
        { _id, action: "reject" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReceivedRequests((prev) =>
        prev.filter((request) => request._id !== _id)
      );
      toast.info("🚫 Friend request rejected.");
    } catch (error) {
      toast.error("❌ Error rejecting friend request.");
    }
  };

  return (
    <div className=" w-full bg-gray-950 min-h-screen">
      {receivedRequests.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">
          No incoming friend requests.
        </div>
      ) : (
        <div className="space-y-4">
          {receivedRequests.map((request) => {
            const initials = request.username?.slice(0, 2).toUpperCase() || "U";
            const rawDate = request?.createdAt;
            const receivedTime = rawDate
              ? formatDistanceToNow(new Date(rawDate), { addSuffix: true })
              : "unknown time";


            return (
              <div
                key={request._id}
                className="bg-gray-950 rounded-xl shadow-sm border border-white/10 flex items-center justify-between px-2 py-3"
              >
                {/* Left section: avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {initials}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-300 font-bold">
                      {request.username || "Unknown"}
                    </div>
                    <div className="text-gray-300 font-bold">
                      <p className="text-xs text-gray-500">{receivedTime}</p>
                    </div>
                  </div>
                </div>

                {/* Right section: buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDelete(request._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                  <button
                    onClick={() => handleConfirm(request._id, "accept")}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-green-500 text-green-500 hover:bg-green-50 transition"
                  >
                    <span className="text-lg">✓</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecievedRequests;
