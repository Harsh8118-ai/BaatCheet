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
    <div className="w-full">
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}

      {/* Desktop / Profile Tab Layout */}
      <div className="hidden md:block bg-gray-950 border border-[#2a2a2a] rounded-xl p-1">
        
        {inviteCode ? (
          <div className="flex justify-between items-center bg-gray-950 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-400">Your Invite Code</p>
              <h1 className="text-2xl font-bold tracking-widest text-white">{inviteCode}</h1>
              <p className="text-xs text-gray-400 mt-1">Share this code with friends to connect</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-md bg-[#2b2b2d] text-sm text-white border border-gray-600 hover:bg-[#3b3b3d]"
              >
                {copied ? <FaCheck /> : <FaClipboard />}
              </button>
              <button className="px-4 py-2 rounded-md bg-[#845ef7] hover:bg-[#724cf3] text-white text-sm flex items-center gap-2">
                <IoShareSocialOutline size={16} />
                Share
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={generateInviteCode}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition font-semibold"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Invite Code"}
          </button>
        )}
      </div>

      {/* Mobile / Friends Page Layout */}
      <div className="block md:hidden bg-gray-950 border border-[#2a2a2a] rounded-xl px-4 py-3 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-medium text-gray-300">Invite Friends to Join</h2>
            <p className="text-xs text-gray-400">Share your invite code to connect with friends</p>
          </div>
          {inviteCode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-semibold">Invite Code: {inviteCode}</span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition"
              >
                <FaClipboard />
              </button>
            </div>
          )}
        </div>

        {inviteCode && (
          <button className="mt-3 w-full flex items-center justify-center gap-2 bg-[#2a2a2a] text-sm text-white py-2 rounded-lg hover:bg-[#3b3b3d] transition">
            <BsPersonPlus />
            Enter Invite Code
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteCode;
