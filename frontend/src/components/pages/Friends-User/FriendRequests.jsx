import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FriendRequests = () => {
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
    <div className="w-full mx-auto p-4 sm:p-6 gradient
 shadow-md rounded-lg">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
      <h2 className="text-xl font-bold mb-4 text-center">Friend Requests</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : (
        <>
          {/* 🔹 Sent Requests */}
          <div data-aos="fade-up" className="mb-6">
            <h3 className="font-semibold text-lg">Sent Requests</h3>
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 border rounded-md bg-gray-100 mt-2 flex flex-col sm:flex-row sm:justify-between items-center text-sm"
                >
                  <div className="text-center sm:text-left">
                    <p><strong>Username:</strong> {request.username || "N/A"}</p>
                    <p><strong>Email:</strong> {request.email || "N/A"}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="mt-2 sm:mt-0 gradient
 text-white px-3 py-1 rounded-md w-full sm:w-auto"
                    onClick={() => handleWithdraw(request._id)}
                  >
                    Withdraw
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No sent requests.</p>
            )}
          </div>

          {/* 🔹 Received Requests */}
          <div data-aos="fade-up">
            <h3 className="font-semibold text-lg">Received Requests</h3>
            {receivedRequests.length > 0 ? (
              receivedRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 border rounded-md bg-gray-100 mt-2 flex flex-col sm:flex-row sm:justify-between items-center text-sm"
                >
                  <div className="text-center sm:text-left">
                    <p><strong>Username:</strong> {request.username || "N/A"}</p>
                    <p><strong>Email:</strong> {request.email || "N/A"}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="gradient
 text-white px-3 py-1 rounded-md w-full sm:w-auto"
                      onClick={() => handleConfirm(request._id, "accept")}
                    >
                      Confirm
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="gradient
 text-white px-3 py-1 rounded-md w-full sm:w-auto"
                      onClick={() => handleDelete(request._id)}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No received requests.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FriendRequests;
