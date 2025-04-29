import React, { useState } from "react";
import TrendingQues from "./TrendingQues";
import PublicQues from "./PublicQues";
import MyQues from "./MyQues";
import { useAuth } from "../../store/UseAuth";

const ToggleQues = () => {
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState("trending");

  const storedUserId = localStorage.getItem("userId"); 

  const renderContent = () => {
    switch (activeTab) {
      case "trending":
        return <TrendingQues />;
      case "public":
        return <PublicQues />;
      case "my":
        return user || storedUserId ? (
          <MyQues userId={user ? user._id : storedUserId} />
        ) : (
          <p className="text-gray-400">Please log in to view your questions.</p>
        );
      default:
        return <PublicQues />;
    }
  };

  return (
    <div className="w-full bg-gray-950 py-4 px-4 sm:px-8  mx-auto">
      <div className="max-w-screen-xl mx-auto">
      <div className="w-full text-white py py-4">
      <h1 className="text-3xl font-bold">Questions</h1>
      <p className="text-gray-400">Browse questions, find answers, or ask something new</p>
    </div>
        <div className="flex justify-between items-center bg-gray-500 rounded-full px-0.5">
          <button
            className={`px-6 py-1 my-0.5 rounded-full text-center w-1/3 text-sm font-medium transition-colors ${
              activeTab === "trending"
                ? "bg-gray-950 text-white border border-gray-700"
                : "text-gray-200 hover:text-gray-400"
            }`}
            onClick={() => setActiveTab("trending")}
          >
            Trending Questions
          </button>

          <button
            className={`px-6 py-1 my-0.5 rounded-full text-center w-1/3 text-sm font-medium transition-colors ${
              activeTab === "public"
                ? "bg-gray-950 text-white border border-gray-700"
                : "text-gray-200 hover:text-gray-400"
            }`}
            onClick={() => setActiveTab("public")}
          >
            Public Discussions
          </button>

          <button
            className={`px-6 py-1 my-0.5 rounded-full text-center w-1/3 text-sm font-medium transition-colors ${
              activeTab === "my"
                ? "bg-gray-950 text-white border border-gray-700"
                : "text-gray-200 hover:text-gray-400"
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Questions
          </button>
        </div>

        {/* Content area */}
        <div className="mt-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ToggleQues;
