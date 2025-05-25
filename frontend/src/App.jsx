import React, { useEffect } from "react";
import "aos/dist/aos.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./components/pages/Profile";
import Friends from "./components/pages/Friends-User/Friends";
import ChatPage from "./components/pages/Chat/ChatPage";
import { useAuth } from "./components/store/UseAuth";
import { MoodProvider } from "./components/pages/Chat/MoodContext";
import AuthSuccess from "./components/store/AuthSuccess";
import Home from "./home";
import Temp from "./Temp";

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
      
        {/* Main Content Wrapper */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
        <MoodProvider >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Temp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/chat/:friendId" element={<ChatPage />} />
          </Routes>
          </MoodProvider>
        </div>
      </div></div>

  );
}
