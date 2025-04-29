import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaGithub } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    otp: "", 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!form.email.trim()) {
      toast.error("Email is required to send OTP!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to send OTP. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otpSent) {
      toast.error("Please request and enter OTP before signing up!");
      setLoading(false);
      return;
    }

    const formData = { ...form, authProvider: "manual" };

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Signup successful! Redirecting...");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth Login
  const handleOAuthLogin = (provider) => {
    window.location.href = `${BASE_URL}/oauth/${provider}`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 brightness-105">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <motion.div
        className="bg-gray-950
 p-8 rounded-3xl shadow-md w-96 brightness-95 border border-gray-500"
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
        <motion.h6
          className="text-sm font-semibold mb-5 text-left text-gray-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}>Enter your information to create an account</motion.h6>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col">
              <label className="text-gray-200 text-sm mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="border p-2 rounded-xl border-gray-500 hover:bg-gray-900 hover:scale-105 bg-gray-950 text-gray-300 w-full"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-200 text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="abc@example.com"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded-xl border-gray-500 hover:bg-gray-900 hover:scale-105 bg-gray-950 text-gray-300 w-full"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-200 text-sm mb-1">Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                className="border p-2 rounded-xl border-gray-500 hover:bg-gray-900 hover:scale-105 bg-gray-950 text-gray-300 w-full"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-200 text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border p-2 rounded-xl border-gray-500 hover:bg-gray-900 hover:scale-105 bg-gray-950 text-gray-300 w-full"
                required
              />
            </div>

            {otpSent && (
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  className="border p-2 rounded-xl border-gray-500 hover:bg-gray-900 hover:scale-105 bg-gray-950 text-gray-300 w-full"
                  required
                />
              </div>
            )}
          </div>


          {!otpSent ? (
            <button type="button" className="gradient
 text-white p-2 rounded w-full hover:brightness-90 mt-4 hover:scale-105 transition-all
" onClick={sendOtp}>
              Send OTP
            </button>
          ) : (
            <button type="submit" className="gradient
 text-white p-2 rounded w-full hover:brightness-90
" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </button>
          )}
        </form>

      

        {/* 🔹 OAuth Login Buttons */}
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-gray-400 text-sm">OR CONTINUE WITH</span>
          <hr className="flex-grow border-gray-700" />
        </div>

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
        </div>


        <p className="text-center text-sm mt-4 text-gray-400">
          Already have an account? <Link to="/login" className="text-green-500 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
