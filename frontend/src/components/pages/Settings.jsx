import { useEffect, useState } from "react";
import axios from "axios";
import ThemeSwitcher from "./ThemeSwitch";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const Settings = () => {
  const [user, setUser] = useState({ username: "", email: "", mobileNumber: "" });
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [isModalOpen, setIsModalOpen] = useState(null); 
  const [newValue, setNewValue] = useState(""); 

  const [newPassword, setNewPassword] = useState(""); 
  const [otp, setOtp] = useState(""); 
  const [isOtpSent, setIsOtpSent] = useState(false); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (field) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/auth/update-profile`,
        { [field]: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${field} updated successfully!`);
      setUser((prev) => ({ ...prev, [field]: newValue }));
      setIsModalOpen(null); 
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update ${field}.`);
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post(`${BASE_URL}/otp/send-otp`, { email: user.email });
      alert("OTP sent to your email.");
      setIsOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    console.log("🔹 Attempting to update password...");
    console.log("📧 Email:", user.email);
    console.log("🔢 OTP:", otp);
    console.log("🔒 New Password:", newPassword);

    try {
      const response = await axios.put(`${BASE_URL}/auth/reset-password`, {
        email: user.email,
        otp,
        newPassword,
      });

      console.log("✅ Password update response:", response.data);
      alert("Password updated successfully!");
      setIsModalOpen(null);
      setOtp(""); 
      setIsOtpSent(false); 
    } catch (error) {
      console.error("🚨 Error updating password:", error);
      console.log("🔴 Error Response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to update password.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center p-5 bg-gray-950  text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-5">Settings</h2>

      {/* Profile Section */}
      <div className="w-full max-w-md bg-gray-950
 dark:bg-gray-800 p-5 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Profile Information</h3>

        {/* Username */}
        <div className="flex justify-between items-center">
          <p className="text-[var(--text-color)] text-lg"><strong className="text-lg text-white">Username:   </strong> {user.username}</p>
          <button
            onClick={() => { setIsModalOpen("username"); setNewValue(user.username); }}
            className="gradient
 hover:brightness-90
 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        </div>

        {/* Email */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-[var(--text-color)] text-lg"><strong className="text-lg text-white">Email:   </strong>  {user.email}</p>
          <button
            onClick={() => { setIsModalOpen("email"); setNewValue(user.email); }}
            className="gradient
 hover:brightness-90
 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        </div>

        {/* Mobile Number */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-[var(--text-color)] text-lg"><strong className="text-lg text-white">Mobile Number:   </strong>  {user.mobileNumber}</p>
          <button
            onClick={() => { setIsModalOpen("mobileNumber"); setNewValue(user.mobileNumber); }}
            className="gradient
 hover:brightness-90
 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        </div>

        {/* Password */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-[var(--text-color)] text-lg"><strong className="text-lg text-white">Password:   </strong>  ********</p>
          <button
            onClick={() => setIsModalOpen("password")}
            className="gradient hover:brightness-90 text-white px-3 py-1 rounded"
          >
            Change
          </button>
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-5 mt-5 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Theme Preferences</h3>
        
        {/* Theme Switcher Component */}
        <ThemeSwitcher /> 
        
      </div>

      {/* Edit Modals */}
      {isModalOpen && isModalOpen !== "password" && (
        <div className="fixed my-auto h-screen
 bg-opacity-60 -inset-y-full bg-gray-950  w-full flex justify-center items-center ">
          <div className="gradient
 dark:bg-gray-800 p-5 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Edit {isModalOpen}</h3>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Enter ${isModalOpen}`}
              className="w-full p-2 mb-3 border gradient brightness-90  dark:border-gray-700 rounded text-gray-900"
            />
            <div className="flex justify-between">
              <button onClick={() => handleUpdateProfile(isModalOpen)} className="gradient
 hover:brightness-90
 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setIsModalOpen(null)} className="gradient
 hover:brightness-90
 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isModalOpen === "password" && (
        <div className="fixed inset-0 gradient
 bg-opacity-50 flex justify-center items-center">
          <div className="gradient
 dark:bg-gray-800 p-5 rounded-lg w-96 shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(null)}
              className="absolute top-2 right-2 gradient
 hover:brightness-90
 text-white p-1 rounded-full"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-3">Change Password</h3>
            {!isOtpSent ? (
              <button onClick={sendOtp} className="w-full gradient
 hover:brightness-90
 text-white py-2 rounded">
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 mb-2 border rounded text-gray-900"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 mb-2 border rounded text-gray-900"
                />
                <div className="flex justify-between mt-3">
                  <button
                    onClick={handleUpdatePassword}
                    className="gradient
 hover:brightness-90
 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsModalOpen(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
