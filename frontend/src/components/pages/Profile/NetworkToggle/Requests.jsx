import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Check, X } from "lucide-react";
import { BsPerson } from "react-icons/bs";


import "react-toastify/dist/ReactToastify.css";

const Requests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User is not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/friends/requests/received`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceivedRequests(response.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load friend requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (_id, action) => {
    const receiverId = localStorage.getItem("userId");

    try {
      await axios.post(
        `${BASE_URL}/friends/respond-request`,
        { _id, receiverId, action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReceivedRequests((prev) => prev.filter((r) => r._id !== _id));

      toast.success(
        action === "accept"
          ? "✅ Friend request accepted!"
          : "🚫 Friend request rejected."
      );
    } catch (error) {
      toast.error("❌ Error processing request.");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      {loading ? (
        <p className="text-gray-400 text-center mt-6">Loading...</p>
      ) : receivedRequests.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No friend requests received.</p>
      ) : (
        <div className="space-y-3">
          {receivedRequests.map((req) => (
            <div
              key={req._id}
              className="bg-gray-950 border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-white text-sm font-bold">
                  <BsPerson className="text-[#1e1e1e] font-extrabold text-xl" />
                </div>
                <div>
                  <p className="text-white font-semibold">{req.username || "Unknown"}</p>
                  <p className="text-sm text-gray-400">
                    { req.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req._id, "accept")}
                  className="flex items-center gap-1 px-4 py-1 bg-[#8e4fff] hover:bg-[#7d3efb] text-white rounded-full text-sm transition"
                >
                  <Check size={16} /> Accept
                </button>
                <button
                  onClick={() => handleAction(req._id, "reject")}
                  className="flex items-center gap-1 px-4 py-1 border border-gray-600 text-white rounded-full text-sm hover:bg-[#1e1e1e]"
                >
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
