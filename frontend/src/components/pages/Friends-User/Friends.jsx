import React from "react";
import { Link } from "react-router-dom";
import InviteCode from "./InviteCode";
import FindUser from "./FindUser";
import FriendList from "./FriendList";
import ToggleBar from "./ToggleBar";

export default function Friends() {
  return (
    <>
    <div className="px-4 py-6  bg-gray-950">
    <div className="p-6">
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <p className="text-gray-400">Connect with others and expand your knowledge network</p>
      </div>
    <div className="flex flex-col items-center  justify-center">


      {/* ✅ Card Container */}
      <div className="w-full bg-gray-950 shadow-lg rounded-lg p-6 space-y-4">
        {/* ✅ Invite Code Section */}
        <InviteCode />

        <FindUser />

        {/* Toggle Bar  */}
        <ToggleBar />

       
      </div>
    </div>
    </div>
    </>
  );
}
