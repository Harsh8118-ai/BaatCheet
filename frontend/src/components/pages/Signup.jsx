import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const navigate = useNavigate();

  // Handle OAuth Login
  const handleOAuthLogin = (provider) => {
    window.location.href = `${BASE_URL}/oauth/${provider}`;
  };

  return (
    <>
      <motion.div
        className="bg-gray-950
 p-8 rounded-3xl shadow-md w-full brightness-95 border border-gray-500  max-w-md "
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h2
          className="text-2xl font-bold mb-2 text-left text-gray-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Create an Account
        </motion.h2>

        {/* 🔹 OAuth Login Buttons */}
        <div className="flex justify-center space-x-3">
          <motion.button
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0f0f0f] border border-gray-700 text-white rounded-md hover:bg-gray-800 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <FaGithub className="w-5 h-5" />
            <span>GitHub</span>
          </motion.button>

          <motion.button
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0f0f0f] border border-gray-700 text-white rounded-md hover:bg-gray-800 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <FaGoogle className="w-5 h-5" />
            <span>Google</span>
          </motion.button>

          <motion.button
            onClick={() => handleOAuthLogin("facebook")}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#145db2] transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <FaFacebook className="w-5 h-5" />
            <span>Facebook</span>
          </motion.button>
        </div>



      </motion.div>
    </>
  );
}
