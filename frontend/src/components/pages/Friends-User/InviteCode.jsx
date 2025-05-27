import { useState, useEffect } from "react";
import { FaClipboard, FaCheck } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { BsPersonPlus } from "react-icons/bs";

const InviteCode = () => {
  const [inviteCode, setInviteCode] = useState(localStorage.getItem("inviteCode") || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/friends/invite-code`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setInviteCode(data.inviteCode || "");
          localStorage.setItem("inviteCode", data.inviteCode);
        } else {
          setError(data.message);
          setInviteCode("");
        }
      } catch (error) {
        console.error("Error fetching invite code:", error);
        setError("Failed to fetch invite code!");
      }
    };

    fetchInviteCode();
  }, [inviteCode]);

  const generateInviteCode = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/friends/generate-invite-code`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setInviteCode(data.inviteCode);
        localStorage.setItem("inviteCode", data.inviteCode);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
      setError("Failed to generate invite code!");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mb-3">
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}

      {inviteCode ? (

        <div className="block bg-gray-950 border border-[#2a2a2a] rounded-xl px-4 py-3 mt-4">
          <div className="flex justify-between items-center">
            {inviteCode && (
              <div className="flex items-center gap-2 justify-center">
                <span className="text-sm text-white font-semibold">Your Invite Code: {inviteCode}</span>
                <button
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-white transition"
                >
                  <FaClipboard />
                </button>
              </div>
            )}
          </div></div>)
        :
        <button
          onClick={generateInviteCode}
          className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition font-semibold"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Invite Code"}
        </button>
      }

    </div>
    
  );
};

export default InviteCode;
