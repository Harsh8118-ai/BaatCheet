import { Link } from "react-router-dom";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiHome, FiBook, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import { RiQuestionAnswerLine, RiBookmarkLine, RiAddLine } from "react-icons/ri";
import { useAuth } from "../store/UseAuth"; 
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <>
      {/* ☰ Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 bg-gray-800 text-white rounded fixed top-4 left-4 z-50"
      >
        ☰
      </button>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-50 
        bg-gray-950 text-white w-64  h-screen p-3 flex flex-col shadow-lg border-r border-gray-400`}
      >
        {/* ✖ Close Button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-white text-xl absolute top-4 right-4"
        >
          ✖
        </button>

        {/* 🔥 Sidebar Heading */}
        <h2 className="text-xl font-bold mb-4 pb-3 border-b border-gray-400">Learning Go</h2>

        {/* Navigation Links */}
        <nav className="space-y-2 flex-1">
          {/* Main Section */}
          <p className="text-gray-400 text-sm px-2">Main</p>
          <Link to="/" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <FiHome /> Home
          </Link>
          <Link to="/questions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <RiQuestionAnswerLine /> Questions
          </Link>
          <Link to="/discussions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <FiBook /> Discussions
          </Link>
          <Link to="/friends" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <FiUsers /> Friends
          </Link>

          {/* Divider */}
          <div className="border-b border-gray-400 my-3"></div>

          {/* Personal Section */}
          <p className="text-gray-400 text-sm px-2">Personal</p>
          <Link to="/my-questions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <RiAddLine /> My Questions
          </Link>
          <Link to="/bookmarked" className="flex items-center gap-3 p-2 rounded hover:bg-gray-800" onClick={() => setIsOpen(false)}>
            <RiBookmarkLine /> Bookmarks
          </Link>
        </nav>

        {/* Divider before Profile Section */}
        <div className="border-t border-gray-400 mt-4"></div>

        {/* Profile & Settings Dropdown */}
        <div className="mt-auto">
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="flex items-center gap-3 p-3 w-full rounded hover:bg-gray-800"
    >
      <FaUserCircle className="text-2xl bg-gray-950 rounded-xl transition-transform duration-300 ease-in-out" />
      {loading ? "Loading..." : user ? user.username : "Guest"}
    </button>

    {/* AnimatePresence ensures smooth exit animation */}
    <AnimatePresence>
      {dropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-14 left-0 w-full mx-4 max-w-sm bg-gray-950 rounded-xl shadow-lg border border-gray-500"
        >
          <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-gray-700" onClick={() => {setIsOpen(false); setDropdownOpen(!dropdownOpen)}}>
            <FaUserCircle /> Profile
          </Link>
          <Link to="/settings" className="flex items-center gap-3 p-2 hover:bg-gray-700" onClick={() => {setIsOpen(false); setDropdownOpen(!dropdownOpen)}}>
            <FiSettings /> Settings
          </Link>
          {user && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="flex items-center gap-3 p-2 hover:bg-gray-700 w-full text-left border-t-2"
            >
              <FiLogOut /> Log out
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
      </div>
    </>
  );
}
