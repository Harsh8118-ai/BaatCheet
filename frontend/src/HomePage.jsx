import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import FriendList from "./components/pages/Friends-User/FriendList";

const HomePage = () => {
  const [stats, setStats] = useState({ users: 0, messages: 0, voiceMessages: 0, reactions: 0 });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/stats`);
      setStats(data);
    } catch (error) {
      console.error("Error fetching chat stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container py-6 space-y-8">
        {/* 🔥 Hero / Welcome */}
        <div className="flex flex-col space-y-2" data-aos="fade-down">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to PulseChat 💬</h1>
          <p className="text-muted-foreground">Chat with friends. Set moods. Send reactions. Be yourself.</p>
        </div>

        {/* 🎉 Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#09090B] via-[#0F0B1D] to-[#09090B] p-8 md:p-10 shadow-lg" data-aos="zoom-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,63,216,0.3),_rgba(9,9,11,0.8))] opacity-30"></div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-8 relative">
            {/* Left Side */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Say more with mood 🎭</h2>
              <p className="text-gray-300">
                Set your vibe, share your thoughts, and express yourself — with chats that feel like *you*.
              </p>
              <div className="flex gap-4 items-center">
                <Link to="/signup">
                  <button className="gradient px-6 py-1 rounded-lg text-white w-fit" data-aos="fade-right">
                    Start Chatting
                  </button>
                </Link>
                <button className="bg-gray-800 px-6 py-1 rounded-lg text-white flex items-center gap-2 w-fit" data-aos="fade-left">
                  Learn More <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Visual effects */}
            <div className="hidden md:block relative">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-400 opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-purple-600 opacity-10 blur-2xl"></div>
            </div>
          </div>
        </div>

      

        
        {/* 🧑‍🤝‍🧑 Recent Friends/Chats */}
        <div>
          <h2 className="text-2xl font-bold">Recent Friend Activity</h2>
          <div>
            <FriendList />
          </div>
        </div>

        {/* 🌐 Community CTA */}
        <div className="p-6 text-center bg-gradient-to-r from-purple-800 to-indigo-900 rounded-lg">
          <h2 className="text-2xl font-bold">Join the chat revolution</h2>
          <p>Create an account and step into a smarter, more emotional way to connect.</p>
          <div className="mt-4 flex gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-purple-500 px-4 py-2 rounded-lg">Sign Up</button>
            </Link>
            <Link to="/login">
              <button className="bg-gray-800 px-4 py-2 rounded-lg">Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
