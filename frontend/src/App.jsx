import React, { useEffect } from "react";
import "aos/dist/aos.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/pages/Sidebar";
import Bookmarked from "./components/pages/Bookmarked";
import Settings from "./components/pages/Settings";
import Signup from "./components/pages/Signup";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import HomePage from "./HomePage";
import AuthSuccess from "./components/store/AuthSuccess";
import Friends from "./components/pages/Friends-User/Friends";
import FriendRequests from "./components/pages/Friends-User/FriendRequests";
import ChatPage from "./components/pages/Friends-User/ChatPage";
import ToggleQues from "./components/pages/Questions/ToggleQues";
import MyQues from "./components/pages/Questions/MyQues";
import { useAuth } from "./components/store/UseAuth";

export default function App() {
  const { user } = useAuth();
  const storedUserId = localStorage.getItem("userId");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "default";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);
  return (

    <div className="bg-gray-950">
      <div className="flex h-screen min-h-screen">
        {/* ✅ Sidebar with scroll support */}
        <Sidebar />

        {/* ✅ Main Content Wrapper */}
        <div className="flex-1 overflow-y-auto bg-gray-950 mx-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/questions" element={<ToggleQues />} />
            <Route path="/bookmarked" element={<Bookmarked />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friend-requests" element={<FriendRequests />} />
            <Route path="/chat/:friendId" element={<ChatPage />} />
            <Route
              path="/my-questions"
              element={
                <>
                  <h1 className="text-white text-2xl font-bold">My Questions</h1>
                  <MyQues userId={user ? user._id : storedUserId} />
                </>
              }
            />

          </Routes>
        </div>
      </div></div>

  );
}
