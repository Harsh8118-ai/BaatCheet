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
    <div className="p-4">
  <ToastContainer position="top-right" autoClose={2000} />
  {loading ? (
    <p className="text-gray-400 text-center mt-6">Loading...</p>
  ) : sentRequests.length === 0 ? (
    <p className="text-gray-500 text-center mt-6">No sent friend requests.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sentRequests.map((req) => (
        <div
          key={req._id}
          className="bg-[#141414] border border-[#2a2a2a] p-5 rounded-2xl shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
              <BsPerson className="text-[#1e1e1e] text-xl" />
            </div>
            <div>
              <p className="text-white font-semibold text-base">{req.username || "Unknown User"}</p>
              <p className="text-sm text-gray-400">{req.email || "No email provided"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Sent{" "}
                {req?.createdAt && !isNaN(new Date(req.createdAt))
                  ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })
                  : "at unknown time"}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleWithdraw(req._id)}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-full flex items-center justify-center gap-2 transition"
          >
            <UserPlus size={16} /> Withdraw
          </button>
        </div>
      ))}
    </div>
  )}
</div>

  );
};

export default SentRequests;
