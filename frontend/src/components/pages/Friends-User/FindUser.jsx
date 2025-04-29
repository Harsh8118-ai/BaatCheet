import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";

const FindUser = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;


  // 🔎 Find user by invite code
  const searchUser = async () => {
    if (!inviteCode.trim()) {
      setError("Invite code cannot be empty!");
      return;
    }

    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await axios.get(`${BASE_URL}/friends/search-by-invite?code=${inviteCode}`);
      console.log("API Response:", response.data);

      if (response.data && response.data.username) {
        setUser(response.data);
      } else {
        setError("User not found.");
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error searching user.");
    }

    setLoading(false);
  };

  // ✉️ Send Friend Request
  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("User is not authenticated. Please log in.");
        return;
      }
  
      const response = await axios.post(
        `${BASE_URL}/friends/send-request`,
        { inviteCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Friend request sent successfully!");

      window.location.reload(); 

    } catch (error) {
      console.error("❌ Error sending request:", error);
      setError(error.response?.data?.message || "Failed to send request.");
      toast.error("Failed to send request!");
    }
  };

  return (
    <div className="w-full p-2">
      {/* 🔍 Search Bar */}
      <div className="flex items-center bg-gray-950 p-2 rounded-full shadow-md">
      {/* <FaSearch className="text-gray-500" />; */}
        <input
          type="text"
          placeholder="Enter Invite Code..."
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-gray-400 p-2 bg-gray-900 outline-none border rounded-2xl mr-2"
        />
        <button
          onClick={searchUser}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Friends"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {user && (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-lg">
          <h3 className="text-lg font-semibold text-center">User Found</h3>
          <p className="break-words"><strong>Username:</strong> {user.username || "N/A"}</p>
          <p className="break-words"><strong>Email:</strong> {user.email || "N/A"}</p>
          <p className="break-words"><strong>Invite Code:</strong> {user.inviteCode || "N/A"}</p>
          <button
            onClick={sendFriendRequest}
            className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition"
          >
            Send Friend Request
          </button>
        </div>
      )}
    </div>
  );
};

export default FindUser;
