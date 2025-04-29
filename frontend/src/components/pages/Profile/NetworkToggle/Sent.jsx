import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BsPerson } from "react-icons/bs";


const Sent = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchSentRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User is not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/friends/requests/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSentRequests(response.data || []);
      } catch (error) {
        toast.error("Failed to load sent requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchSentRequests();
  }, []);

  const handleWithdraw = async (recipientId) => {
    if (!recipientId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/friends/withdraw-request`,
        { recipientId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSentRequests((prev) => prev.filter((r) => r._id !== recipientId));
      toast.success("🔄 Friend request withdrawn.");
    } catch (error) {
      toast.error("❌ Failed to withdraw request.");
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
        <div className="space-y-3">
          {sentRequests.map((req) => (
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
        <p className="text-sm text-gray-500"> 
        Sent {req?.createdAt && !isNaN(new Date(req.createdAt)) 
  ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) 
  : 'at unknown time'}

</p>

      </div>
    </div>
    <button
      onClick={() => handleWithdraw(req._id)}
      className="flex items-center gap-1 px-4 py-1 bg-[#8e4fff] hover:bg-[#7d3efb] text-white rounded-full text-sm transition"
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

export default Sent;
