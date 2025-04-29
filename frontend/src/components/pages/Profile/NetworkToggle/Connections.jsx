import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import { BsPerson } from "react-icons/bs";


const Connections = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdownId, setShowDropdownId] = useState(null); // Track which dropdown is open
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/friends/friends-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data.friends || []);
      } catch (err) {
        toast.error("Failed to load connections.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleMessage = (friendId, friendUsername) => {
    navigate(`/chat/${friendId}`, { state: { friendUsername } });
  };

  const handleRemoveFriend = async (friendId) => {
    const confirm = window.confirm("Are you sure you want to remove this friend?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/friends/remove-friend`,
        { _id: friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFriends((prev) => prev.filter((f) => f._id !== friendId));
      toast.success("Friend removed successfully!");
    } catch (err) {
      toast.error("Failed to remove friend.");
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      {loading ? (
        <p className="text-gray-400">Loading connections...</p>
      ) : friends.length > 0 ? (
        <>
          <div className="flex flex-col gap-4 mt-5">
            {friends.map((friend) => (
              <motion.div
                key={friend._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-950 border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between relative"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white text-lg">
                  <BsPerson className="text-[#1e1e1e] font-extrabold text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">{friend.username}</h3>
                    <p className="text-sm text-gray-400">{friend.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative mr-4 justify-center">
                  <button
                    onClick={() => handleMessage(friend._id, friend.username)}
                    className="bg-gray-950 text-white border border-[#2a2a2a] text-sm font-medium px-4 py-1.5 mr-3 rounded-xl hover:bg-gray-900 transition"
                  >
                    Message
                  </button>

                  {/* Three Dots Menu */}
                  <div className="relative">
                    <button
                      className="text-gray-400 hover:text-white text-xl"
                      onClick={() =>
                        setShowDropdownId((prevId) => (prevId === friend._id ? null : friend._id))
                      }
                    >
                      <FaEllipsisH />
                    </button>

                    {showDropdownId === friend._id && (
                      <div className="absolute right-0 top-8 bg-[#1e1e1e] border border-[#333] rounded-md shadow-md z-10 w-40">
                        <button
                          onClick={() => {
                            setShowDropdownId(null);
                            handleRemoveFriend(friend._id);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#2a2a2a]"
                        >
                          Remove Friend
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button className="bg-gray-950 border border-[#444] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition">
              View All Connections
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No connections found.</p>
      )}
    </div>
  );
};

export default Connections;
