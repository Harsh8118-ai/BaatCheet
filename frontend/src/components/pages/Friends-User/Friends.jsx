import React from "react";
import { useNavigate } from "react-router-dom";
import InviteCode from "./InviteCode";
import FindUser from "./FindUser";
import FriendList from "./FriendList";
import ToggleBar from "./ToggleBar";
import { ArrowLeft } from "lucide-react";

export default function Friends() {
  const navigate = useNavigate();

  return (
    <div className="px-2 py-6 bg-gray-950 min-h-screen">
      {/* Header Row: Back button + Title */}
      <div className="flex items-center gap-4 mb-3 px-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white bg-gray-800 hover:bg-purple-600 transition px-3 py-2 rounded-full shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />

        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">Friends</h1>

        </div>
      </div>
         
         <hr className="text-white/10 mb-2"/>

      <div className="px-2">
        <p className="text-gray-400 text-sm">
          Connect with others and expand your knowledge network
        </p></div>

      <div className="px-2 w-3/4 flex items-center justify-center mx-auto">
      
        <InviteCode />
        
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full bg-gray-950 shadow-lg rounded-lg px-6 py-2 space-y-4">
          <ToggleBar />
        </div>
      </div>
    </div>
  );
}
