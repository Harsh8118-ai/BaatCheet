import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InviteCode from "./Friends-User/InviteCode"; 
import { useAuth } from "../store/UseAuth";
import ProfileTabs from "./Profile/ProfileTabs";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { questionsCount } = useAuth();

<p>Total Questions: {questionsCount}</p>


  useEffect(() => {
    const fetchUserData = async () => {
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found. Redirecting...");
          setLoading(false);
          navigate("/login");
          return;
        }

        
        const response = await fetch(`${BASE_URL}/auth/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ API Error:", errorData);

          if (response.status === 401) {
            console.warn("⚠️ Unauthorized! Logging out...");
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          throw new Error(errorData.message || "Failed to fetch user");
        }

        const data = await response.json();
        

        
        if (!data?.user) {
          throw new Error("Invalid user data received");
        }

        setUser(data.user); 
      } catch (error) {
        
        navigate("/login");
      } finally {

        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p className="text-center text-red-500">User data not found. Please log in.</p>;

  return (
    <>
       <div className="flex flex-col md:flex-row gap-6 px-4 py-8 text-white">
      {/* Left Panel */}
      <motion.div
        className="w-full md:w-1/3 bg-gray-950 rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 h-24 w-full"></div>
        <div className="px-6 -mt-12 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-gray-950 bg-gray-800 flex items-center justify-center text-4xl">
            👤
          </div>
          <h2 className="mt-4 text-2xl font-bold">{user.username}</h2>
          <p className="text-gray-400 text-sm">@{user.username.toLowerCase()}</p>

          <div className="flex gap-4 mt-4">
            <button className="bg-gray-800 px-4 py-1 rounded-full text-sm hover:bg-gray-700 transition">Edit Profile</button>
            <button className="bg-gray-800 px-4 py-1 rounded-full text-sm hover:bg-gray-700 transition">Settings</button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-300">
            Full Stack Developer passionate about building innovative web applications. I love sharing knowledge and helping others solve technical challenges.
          </p>

          <div className="mt-4 w-full border-t border-gray-700 pt-4 text-sm space-y-2 text-gray-400">
            <div className="flex items-center gap-2">📍 <span>San Francisco, CA</span></div>
            <div className="flex items-center gap-2">📧 <span>{user.email}</span></div>
            <div className="flex items-center gap-2">🔗 <a href="https://alexjohnson.dev" target="_blank" className="text-blue-400 hover:underline">alexjohnson.dev</a></div>
            <div className="flex items-center gap-2">🗓️ <span>Member since January 2022</span></div>
          </div>

          {/* Stats */}
          <div className="mt-6 w-full border-t border-gray-700 pt-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-bold text-lg">{questionsCount}</p>
              <p className="text-gray-400">Questions</p>
            </div>
            <div>
              <p className="font-bold text-lg">156</p>
              <p className="text-gray-400">Answers</p>
            </div>
            <div>
              <p className="font-bold text-lg">37</p>
              <p className="text-gray-400">Discussions</p>
            </div>
          </div>

          {/* Reputation */}
          <div className="mt-4 text-center">
            <p className="font-bold text-xl">3256</p>
            <p className="text-green-500 text-sm">+124 this month</p>
          </div>

          {/* Badges */}
          <div className="mt-4 flex gap-3 text-sm text-gray-300">
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full">🥇 3 Gold</span>
            <span className="bg-gray-400 text-black px-2 py-0.5 rounded-full">🥈 12 Silver</span>
            <span className="bg-amber-700 text-white px-2 py-0.5 rounded-full">🥉 28 Bronze</span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="w-full mt-6 mb-6 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition"
          >
            🚪 Logout
          </button>
        </div>
      </motion.div>

      {/* Right Panel (Tabs) */}
      <div className="w-full md:w-2/3">
        <ProfileTabs />
      </div>
    </div>
  
  </>
  );
};

export default Profile;
