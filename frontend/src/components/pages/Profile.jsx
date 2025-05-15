import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaSmile } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const response = await fetch(`${BASE_URL}/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p className="text-white p-4">Loading...</p>;
  if (!user) return <p className="text-red-500 text-center">User data not found.</p>;

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
        <div className="text-5xl mb-4">
          <FaUser />
        </div>
        <h2 className="text-2xl font-semibold">{user.username}</h2>
        <p className="text-gray-400">@{user.username.toLowerCase()}</p>

        <div className="mt-6 space-y-3 text-left text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <FaEnvelope /> <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaSmile /> <span>Current Mood: {user.currentMood || "Neutral"}</span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
          className="w-full mt-8 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition"
        >
          🚪 Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;
