import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, User, Settings, Search, Menu, X, MessageCircle, Users, LogOut, Moon, Sun } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// Import your existing components
import ChatPage from "./components/pages/Chat/ChatPage";
import FriendList from "./components/pages/Friends-User/FriendList";
import FriendRequest from "./components/pages/Friends-User/FriendRequests";
import ReceivedRequest from "./components/pages/Friends-User/RecievedRequest";
import FindUser from "./components/pages/Friends-User/FindUser";
import Profile from "./components/pages/Profile";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";

const HomePage = () => {
  // State management
  const [stats, setStats] = useState({ users: 0, messages: 0, voiceMessages: 0, reactions: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("welcome");
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
    fetchStats();
    
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setActiveSection("chat"); // If logged in, show chat by default
    }
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/stats`);
      setStats(data);
    } catch (error) {
      console.error("Error fetching chat stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setActiveSection("welcome");
    setShowProfileMenu(false);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Render the appropriate content based on activeSection
  const renderContent = () => {
    if (!isLoggedIn) {
      if (activeSection === "login") return <Login onLoginSuccess={() => { setIsLoggedIn(true); setActiveSection("chat"); }} />;
      if (activeSection === "signup") return <Signup onSignupSuccess={() => setActiveSection("login")} />;
      
      // Welcome section for non-logged in users
      return (
        <div className="space-y-8 py-6">
          {/* Hero Section */}
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
                  <button 
                    onClick={() => setActiveSection("signup")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 rounded-lg text-white font-medium w-fit" 
                    data-aos="fade-right"
                  >
                    Start Chatting
                  </button>
                  <button 
                    className="bg-gray-800 px-6 py-2 rounded-lg text-white flex items-center gap-2 w-fit" 
                    data-aos="fade-left"
                  >
                    Learn More <span className="inline-block">→</span>
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

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center mb-4">
                <MessageCircle className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expressive Messaging</h3>
              <p className="text-gray-400">Share text, voice messages, and reactions that convey your true mood.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center mb-4">
                <Users className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Friend System</h3>
              <p className="text-gray-400">Connect with friends, send requests, and build your network securely.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-violet-900/50 flex items-center justify-center mb-4">
                <User className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customizable Profile</h3>
              <p className="text-gray-400">Express yourself with a profile that reflects your personality.</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-aos="fade-up">
            <div className="p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700 text-center">
              <p className="text-3xl font-bold text-purple-400">{stats.users.toLocaleString()}</p>
              <p className="text-gray-400">Users</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700 text-center">
              <p className="text-3xl font-bold text-indigo-400">{stats.messages.toLocaleString()}</p>
              <p className="text-gray-400">Messages</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700 text-center">
              <p className="text-3xl font-bold text-violet-400">{stats.voiceMessages.toLocaleString()}</p>
              <p className="text-gray-400">Voice Messages</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700 text-center">
              <p className="text-3xl font-bold text-pink-400">{stats.reactions.toLocaleString()}</p>
              <p className="text-gray-400">Reactions</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-8 text-center bg-gradient-to-r from-purple-900/80 to-indigo-900/80 rounded-lg shadow-lg" data-aos="zoom-in">
            <h2 className="text-2xl font-bold mb-2">Join the chat revolution</h2>
            <p className="mb-6 text-gray-300">Create an account and step into a smarter, more emotional way to connect.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setActiveSection("signup")}
                className="bg-white text-indigo-900 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Sign Up
              </button>
              <button 
                onClick={() => setActiveSection("login")}
                className="bg-gray-800 px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // For logged-in users
    switch (activeSection) {
      case "chat": return <ChatPage />;
      case "friends": return <FriendList />;
      case "friendRequests": return <FriendRequest />;
      case "receivedRequests": return <ReceivedRequest />;
      case "findUsers": return <FindUser />;
      case "profile": return <Profile />;
      default: return <ChatPage />;
    }
  };

  // App Container Class based on theme
  const appContainerClass = darkMode 
    ? "min-h-screen bg-gray-900 text-white" 
    : "min-h-screen bg-gray-100 text-gray-900";

  return (
    <div className={appContainerClass}>
      {/* Header for both logged in and non-logged in states */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2">
                {showSidebar ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-2" onClick={() => setActiveSection("welcome")}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">PulseChat</span>
              </div>
            </div>

            {/* Center navigation for desktop - only shown when logged in */}
            {isLoggedIn && (
              <nav className="hidden md:flex space-x-1">
                <button 
                  onClick={() => setActiveSection("chat")} 
                  className={`px-4 py-2 rounded-lg ${activeSection === "chat" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
                >
                  Chat
                </button>
                <button 
                  onClick={() => setActiveSection("friends")} 
                  className={`px-4 py-2 rounded-lg ${activeSection === "friends" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
                >
                  Friends
                </button>
                <button 
                  onClick={() => setActiveSection("findUsers")} 
                  className={`px-4 py-2 rounded-lg ${activeSection === "findUsers" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
                >
                  Find Users
                </button>
              </nav>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-800">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-800 relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">2</span>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)} 
                      className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center"
                    >
                      <User size={16} />
                    </button>
                    
                    {/* Profile dropdown menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl z-50">
                        <button 
                          onClick={() => {setActiveSection("profile"); setShowProfileMenu(false);}}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </button>
                        <button 
                          onClick={() => {setActiveSection("friendRequests"); setShowProfileMenu(false);}}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Users size={16} />
                          <span>Friend Requests</span>
                        </button>
                        <button 
                          onClick={() => {setActiveSection("receivedRequests"); setShowProfileMenu(false);}}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Users size={16} />
                          <span>Received Requests</span>
                        </button>
                        <button 
                          onClick={() => {}} 
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                        <hr className="my-1 border-gray-700" />
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveSection("login")}
                    className="text-gray-300 hover:text-white px-4 py-2"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setActiveSection("signup")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - only visible when logged in */}
      {isLoggedIn && showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}></div>
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-gray-900 shadow-lg z-50 p-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">PulseChat</span>
              </div>
              <button onClick={() => setShowSidebar(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => {setActiveSection("chat"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "chat" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <MessageCircle size={18} />
                <span>Chat</span>
              </button>
              <button 
                onClick={() => {setActiveSection("friends"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "friends" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <Users size={18} />
                <span>Friends</span>
              </button>
              <button 
                onClick={() => {setActiveSection("findUsers"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "findUsers" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <Search size={18} />
                <span>Find Users</span>
              </button>
              <button 
                onClick={() => {setActiveSection("friendRequests"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "friendRequests" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <Users size={18} />
                <span>Friend Requests</span>
              </button>
              <button 
                onClick={() => {setActiveSection("receivedRequests"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "receivedRequests" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <Users size={18} />
                <span>Received Requests</span>
              </button>
              <button 
                onClick={() => {setActiveSection("profile"); setShowSidebar(false);}} 
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeSection === "profile" ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
              <hr className="my-4 border-gray-800" />
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg text-red-400 flex items-center gap-3 hover:bg-gray-800/50"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {renderContent()}
      </main>

      {/* Footer - only show on welcome screen */}
      {!isLoggedIn && activeSection === "welcome" && (
        <footer className="bg-gray-900 border-t border-gray-800 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-lg">PulseChat</span>
                </div>
                <p className="text-gray-400">Express yourself like never before with our revolutionary chat platform.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button className="hover:text-white">About</button></li>
                  <li><button className="hover:text-white">Features</button></li>
                  <li><button className="hover:text-white">Privacy</button></li>
                  <li><button className="hover:text-white">Terms</button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>support@pulsechat.com</li>
                  <li>@pulsechat_app</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500">
              <p>© {new Date().getFullYear()} PulseChat. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default HomePage;