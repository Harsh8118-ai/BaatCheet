import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsPerson } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";
import { UserPlus } from "lucide-react";


const SentRequests = () => {
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

 

  const handleWithdraw = async (recipientId) => {

    if (!recipientId) {
      console.error("❌ No recipient ID provided!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/friends/withdraw-request`,
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSentRequests((prev) => prev.filter((request) => request._id !== recipientId));
      toast.success("🔄 Friend request withdrawn.");
    } catch (error) {
      toast.error("❌ Error withdrawing friend request.");
    }
};




  return (
   <>
  <ToastContainer position="top-right" autoClose={2000} />
  {loading ? (
    <p className="text-gray-400 text-center mt-6">Loading...</p>
  ) : sentRequests.length === 0 ? (
    <p className="text-gray-500 text-center mt-6">No sent friend requests.</p>
  ) : (
    <div className="space-y-4">
      {sentRequests.map((req) => {
        const initials = req.username?.slice(0, 2).toUpperCase() || "U";
        const sentTime =
          req?.createdAt && !isNaN(new Date(req.createdAt))
            ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })
            : "unknown time";

        return (
          <div
            key={req._id}
            className="flex items-center justify-between bg-gray-950 rounded-2xl px-4 py-3 shadow-sm border border-white/10"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden  flex items-center justify-center text-sm font-bold text-white">
                      {req.profileUrl ? (
                        <img
                          src={req.profileUrl}
                          alt={`${req.username}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                
              </div>
              <div>
                <p className="text-gray-300 font-semibold">{req.username || "Unknown"}</p>
                <p className="text-xs text-gray-500">{sentTime}</p>
              </div>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => handleWithdraw(req._id)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-green-50 transition"
            >
             <span className="text-lg">✕</span>
            </button>
          </div>
        );
      })}
    </div>
  )}
</>
  );
};

export default SentRequests;
