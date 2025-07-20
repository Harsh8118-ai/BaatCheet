import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaPhoneAlt, FaSmile,
  FaEdit, FaSave, FaTimes, FaArrowLeft, FaPencilAlt, FaImage
} from "react-icons/fa";
import ProfileModal from "../store/ProfileModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    username: "", email: "", mobileNumber: "", profileUrl: ""
  });


  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token"); 
      if (!token) return navigate("/");

      const response = await fetch(`${BASE_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return navigate("/");
        }
      }

      const data = await response.json();
      setUser(data.user);
      setForm({
        username: data.user.username || "",
        email: data.user.email || "",
        mobileNumber: data.user.mobileNumber || "",
        profileUrl: data.user.profileUrl || "",
      });
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      setUser(data.user);
      setEditMode(false);
      setStatus("✅ Profile updated!");
    } catch (error) {
      setStatus(`❌ ${error.message}`);
    }
  };

  if (loading) return <p className="text-white p-4">Loading...</p>;
  if (!user) return <p className="text-red-500 text-center">User not found.</p>;

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-center flex flex-col items-center justify-center">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="absolute top-4 right-4 hover:bg-blue-500 text-white p-2 text-lg rounded-full shadow-md transition"
              title="Edit Profile"
            >
              <FaPencilAlt />
            </button>
          )}

          {/* Profile Image */}
          <div className="mb-4">
            <img
              src={form.profileUrl || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-white"
            />
          </div>

          {editMode ? (
            <>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 mb-2"
              >
                <FaImage /> Edit Profile Photo
              </button>
              <input
                className="w-full px-3 py-2 mb-2 bg-gray-700 text-white rounded"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 mb-2 bg-gray-700 text-white rounded"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 mb-2 bg-gray-700 text-white rounded"
                placeholder="Mobile Number"
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              />


              <div className="flex justify-center gap-4 mt-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-green-500"
                >
                  <FaSave /> Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      username: user.username,
                      email: user.email,
                      mobileNumber: user.mobileNumber,
                      profileUrl: user.profileUrl,
                    });
                  }}
                  className="bg-gray-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-500"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">{user.username}</h2>
              <div className="mt-6 space-y-3 text-left text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FaEnvelope /> <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhoneAlt /> <span>{user.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaSmile /> <span>Current Mood: {user.currentMood || "Neutral"}</span>
                </div>
              </div>
            </>
          )}

          {status && <p className="text-sm mt-3 text-yellow-400">{status}</p>}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </motion.div>

      <div className="absolute top-4 left-4">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-md transition"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowLeft className="text-sm" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <ProfileModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          userId={user?.id}
          onProfileUploaded={(url) => {
            setForm((prev) => ({ ...prev, profileUrl: url }));
            setUser((prev) => ({ ...prev, profileUrl: url }));
            setShowPhotoModal(false);
            setStatus("✅ Profile photo updated!");
          }}
        />
      </div>


    </>
  );
};

export default Profile;
