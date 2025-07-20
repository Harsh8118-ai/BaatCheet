  import { useState } from "react";
  import { motion } from "framer-motion";
  import { Link, useNavigate } from "react-router-dom";
  import { FaGoogle, FaGithub } from "react-icons/fa";
  import { toast } from "react-toastify";

  const Login = () => {
    const [formData, setFormData] = useState({
      mobileNumber: "",
      password: "",
    });

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
 
    
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    
    const handleSubmit = async (e) => { 
      e.preventDefault();
      setError("");
      setLoading(true);
      

      
      if (!formData.mobileNumber.trim() || !formData.password.trim()) {
        setError("⚠️ Please enter both mobile number and password.");
        setLoading(false);
        return;
      }

      
      const requestBody = {
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        authProvider: "manual", 
      };

      try {

        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();


        
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        navigate("/home");

      } catch (err) {

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };



    // Handle OAuth Login
    const handleOAuthLogin = (provider) => {
      window.location.href = `${BASE_URL}/oauth/${provider}`;
    };

    return (
    <>
    <motion.div 
          className="w-full max-w-md p-8 bg-gray-950 rounded-lg shadow-lg border border-gray-500"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        > 

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* 🔹 Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-gray-200">Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="w-full p-3 border border-gray-300 text-gray-200 hover:bg-gray-900 hover:scale-105 rounded-xl bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-200">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 text-gray-200 hover:bg-gray-900 hover:scale-105 rounded-xl bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full gradient text-white py-3 rounded-md hover:brightness-90 transition-all"
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
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

        
        </motion.div>
    </>
    );
  };

  export default Login;
