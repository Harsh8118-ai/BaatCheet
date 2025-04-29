import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsPerson } from "react-icons/bs";


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
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-gray-950 text-white">
    <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    {error && <p className="text-red-500 text-center">{error}</p>}
    {loading ? (
      <p className="text-gray-400 text-center">Loading...</p>
    ) : (
      <>
        <div data-aos="fade-up">
          {receivedRequests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {receivedRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-950 p-4 rounded-xl shadow-md flex flex-col justify-between border border-white/10"
                >
                  <div className="flex items-start gap-4">
                  <div className="mt-2 w-10 h-8 bg-white rounded-full flex items-center justify-center text-white text-lg">
                  <BsPerson className="text-[#1e1e1e] font-extrabold text-xl" />
                  </div>
                    <div>
                      <p className="font-semibold text-white text-base">
                        {request.username || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-400 mb-2">
                        {request.mutualFriends || Math.floor(Math.random() * 6) + 1} mutual friends
                      </p>
                      <p className="text-sm text-gray-300">
                        {request.message || "Hey! I'd love to connect and discuss tech!"}
                      </p>
                    </div>
                  </div>
  
                  <div className="flex mt-4 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfirm(request._id, "accept")}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded-full transition"
                    >
                      ✓ Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(request._id)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1 rounded-full transition"
                    >
                      ✕ Decline
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No received requests.</p>
          )}
        </div>
      </>
    )}
  </div>
  );
};

export default RecievedRequests;
