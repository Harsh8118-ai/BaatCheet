import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {  FaGithub, FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";


const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const navigate = useNavigate();

  // Handle OAuth Login
  const handleOAuthLogin = (provider) => {
    window.location.href = `${BASE_URL}/oauth/${provider}`;
  };

  return (
    <motion.div
      className="bg-gray-950 p-8 rounded-3xl shadow-lg w-full max-w-md border border-gray-800"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Heading */}
      {/* <motion.h2
        className="text-3xl font-bold mb-6 text-center text-gray-200"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        Create an Account
      </motion.h2> */}

      {/* OAuth Buttons */}
      <div className="flex flex-col space-y-4">


        {/* Google */}
        <motion.button
          onClick={() => handleOAuthLogin("google")}
          className="flex items-center justify-center space-x-3 px-4 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-all shadow-md"
          whileTap={{ scale: 0.95 }}
        >
          <FcGoogle className="w-5 h-5 text-[#DB4437]" />
          <span>Continue with Google</span>
        </motion.button>

        {/* Facebook */}
        <motion.button
          onClick={() => handleOAuthLogin("facebook")}
          className="flex items-center justify-center space-x-3 px-4 py-3 bg-[#1877F2] text-white font-medium rounded-lg hover:bg-[#145db2] transition-all shadow-md"
          whileTap={{ scale: 0.95 }}
        >
          <FaFacebook className="w-5 h-5" />
          <span>Continue with Facebook</span>
        </motion.button>

        {/* GitHub */}
        <motion.button
          onClick={() => handleOAuthLogin("github")}
          className="flex items-center justify-center space-x-3 px-4 py-3 bg-[#24292F] text-white font-medium rounded-lg hover:bg-[#1b1f23] transition-all shadow-md"
          whileTap={{ scale: 0.95 }}
        >
          <FaGithub className="w-5 h-5" />
          <span>Continue with GitHub</span>
        </motion.button>
                
      </div>
    </motion.div>
  );
}
