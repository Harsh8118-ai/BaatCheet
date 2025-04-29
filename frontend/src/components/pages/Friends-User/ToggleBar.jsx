import { useState } from "react";
import FriendList from "./FriendList";
import RecievedRequest from "./RecievedRequest";
import SentRequest from "./SentRequest";

const ToggleBar = () => {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between bg-gray-800 rounded-full p-2">
        {[
          { id: "friends", label: "Friends" },
          { id: "requests", label: "Friend Requests" },
          { id: "sent", label: "Sent Requests" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
              activeTab === tab.id
                ? "bg-gray-950 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render the Selected Component */}
      <div className="mt-6">
        {activeTab === "friends" && <FriendList />}
        {activeTab === "requests" && <RecievedRequest />}
        {activeTab === "sent" && <SentRequest />}
      </div>
    </div>
  );
};

export default ToggleBar;
