import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserMinus } from "lucide-react";

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
    <div className="max-w-7xl mx-auto ">

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
              className="flex justify-between items-center w-full overflow-hidden rounded-lg shadow-lg bg-gray-950 border border-white/10 text-white p-4"
            >
              {/* Gradient Header */}
               <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleMessage(friend._id, friend.username)}>
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 uppercase">
      {friend.username?.slice(0, 2)}
    </div>
    <div className="truncate max-w-[180px]">
      <div className="font-semibold text-white truncate">{friend.username}</div>
      <div className="text-sm text-gray-400 capitalize truncate">{friend.status || "Unknown"}</div>
    </div>
  </div>

  {/* Remove Button Section */}
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="bg-red-100 hover:bg-red-200 p-2 rounded-lg"
    onClick={() => handleRemoveFriend(friend._id)}
  >
    <UserMinus className="text-red-600 w-5 h-5" />
  </motion.button>
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
