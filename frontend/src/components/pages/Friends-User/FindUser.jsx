import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import InviteCode from "./InviteCode";
import { UserPlus } from "lucide-react";
import { X } from 'lucide-react';


const FindUser = () => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputsRef = useRef([]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // 🔎 Automatically search user when all 6 digits are filled
  useEffect(() => {
    const code = digits.join("");

    if (code.length === 6 && !code.includes("")) {
      searchUser(code);
    } else {
      setUser(null); // Clear user if the code is incomplete
    }
  }, [digits]);


  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only single digit or empty

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);

    // Focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check if full code is entered and trigger search
    const fullCode = updated.join("");
    if (fullCode.length === 6 && !updated.includes("")) {
      searchUser(fullCode);
    }
  };


  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const updated = [...digits];
      updated[index - 1] = "";
      setDigits(updated);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const searchUser = async (code) => {
    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await axios.get(`${BASE_URL}/friends/search-by-invite?code=${code}`);
      if (response.data && response.data.username) {
        setUser(response.data);
      } else {
        setError("User not found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error searching user.");
    }

    setLoading(false);
  };

  const sendFriendRequest = async () => {
    const inviteCode = digits.join("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first.");
        return;
      }

      await axios.post(
        `${BASE_URL}/friends/send-request`,
        { inviteCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Friend request sent!");
      setIsModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send request.");
      toast.error("Failed to send request.");
    }
  };

  const reset = () => {
    setDigits(["", "", "", "", "", ""]);
    setUser(null);
    setError("");
  };
 
  return (
    <div>
      <button 
        onClick={() => {
          setIsModalOpen(true);
          reset();
        }}
        className="flex flex-col items-center text-sm text-gray-700 dark:text-white">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-sm shadow-black/5 brightness-90">
          <UserPlus className="w-6 h-6 text-white" />

        </div>
        <span className="text-gray-900 text-sm font-semibold">Add Friend</span>
      </button>

     <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
  {/* Overlay */}
  <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

  {/* Modal Container */}
  <div className="flex items-center justify-center min-h-screen px-4 relative z-50">
    <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 backdrop-blur-lg">

      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2 bg-white/10 text-white hover:bg-white/20 rounded-full p-1.5 transition"
      >
        <X size={20} />  
      </button>

      {/* Title */}
      <Dialog.Title className="text-2xl font-extrabold text-center mb-1 tracking-wide">
        Add Friend by Code
      </Dialog.Title>
      <p className="text-sm text-white/80 text-center mb-4">
        Enter your friend's 6-digit code to connect.
      </p>

      {/* Input Digits */}
      <div className="flex justify-center gap-2 mb-4">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-14 text-center text-xl font-bold text-white bg-white/10 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          />
        ))}
      </div>

      {/* Invite Section */}
      <InviteCode />

      {/* Loading / Error Feedback */}
      {loading && <p className="text-sm text-white/80 text-center mb-2">Searching...</p>}
      {error && <p className="text-red-200 text-sm text-center">{error}</p>}

      {/* Found User */}
      {user && (
        <div className="mt-4 bg-white/10 backdrop-blur-md p-4 rounded-xl text-center shadow-inner border border-white/20">
          <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto mb-2 text-xl font-semibold uppercase">
            {user.username
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)}
          </div>

          <p className="text-sm text-white/80">@{user.username}</p>
          <p className="text-xs text-white/60">Invite Code: {user.inviteCode}</p>

          <button
            onClick={sendFriendRequest}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition font-semibold"
          >
            Add Friend
          </button>

          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-2 w-full border border-white/30 hover:bg-white/10 text-white py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  </div>
</Dialog>

    </div>
  );
};

export default FindUser;
