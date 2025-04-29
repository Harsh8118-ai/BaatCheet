import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";  
import { FaTrash, FaEnvelope } from "react-icons/fa";  

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();  
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;


    useEffect(() => {
        AOS.init({ duration: 800 });

        const fetchFriends = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("User is not authenticated. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${BASE_URL}/friends/friends-list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setFriends(response.data.friends || []);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load friends.");
                toast.error("Failed to load friends.");
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    // 🗑 Remove Friend Function
    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm("Are you sure you want to remove this friend?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${BASE_URL}/friends/remove-friend`,
                { _id: friendId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
            toast.success("Friend removed successfully!");
        } catch (error) {
            setError("Error removing friend.");
            toast.error("Error removing friend.");
        }
    };

    // ✉️ Navigate to Chat Function
    const handleMessage = (friendId, friendUsername) => {
        navigate(`/chat/${friendId}`, { state: { friendUsername } });
    };


    return (
      <div className="max-w-6xl mx-auto p-5">
      

      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <motion.div
              key={friend._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full sm:w-auto overflow-hidden rounded-lg shadow-lg bg-gray-950 border border-white/10 text-white text-center"
            >
              {/* Gradient Header */}
              <div className="h-24 bg-gradient-to-r from-[#693cc3] via-[#a946fb] to-[#693cc3]"></div>

              {/* Avatar & Info */}
              <div className="flex flex-col items-center -mt-12 mb-4 p-4">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-900">
                  <span className="text-4xl text-gray-300">👤</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">
                  {friend.username || "N/A"}
                </h3>
                <p className="text-sm text-gray-400">{friend.email || "N/A"}</p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleMessage(friend._id, friend.username)}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                >
                  <FaEnvelope />
                  Message
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                  onClick={() => handleRemoveFriend(friend._id)}
                >
                  <FaTrash />
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No friends added yet.</p>
      )}
    </div>
    );
};

export default FriendList;
