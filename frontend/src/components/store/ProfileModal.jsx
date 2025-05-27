import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, ImagePlus, Trash2 } from "lucide-react";

const diceBearAvatars = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Valentina",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Nolan",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=George",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Brian",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Kimberly",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Katherine",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Liliana",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Jocelyn",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sara",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Amaya",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Alexander",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Aiden",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Riley",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Robert",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Jameson",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Eden",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Avery",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Easton"
]; // example predefined avatars

const ProfileModal = ({ isOpen, onClose, onProfileUploaded }) => {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const inputRef = useRef();

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESET = import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET_NAME;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setError("");
      setSelectedAvatar(null); // Clear selected avatar if uploading image
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setError("");
      setSelectedAvatar(null);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const clearImage = () => {
    setImage(null);
    setPreviewURL(null);
    setSelectedAvatar(null);
    inputRef.current.value = null;
  };

  const selectAvatar = (url) => {
    setSelectedAvatar(url);
    setImage(null);
    setPreviewURL(url);
    setError("");
  };

  const uploadProfilePhoto = async () => {
    if (!image && !selectedAvatar) {
      setError("Please select an image or an avatar.");
      return;
    }

    setUploading(true);

    try {
      let profileUrl;

      if (selectedAvatar) {
        
        profileUrl = selectedAvatar;
      } else {
        
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", PRESET);
        formData.append("folder", "profile_photos");

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await cloudinaryRes.json();
        profileUrl = data.secure_url;
      }

      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileUrl }),
      });

      onProfileUploaded(profileUrl);
      alert("Profile photo updated!");
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Try again.");
    }

    setUploading(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    onDrop={handleDrop}
    onDragOver={handleDragOver}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        <X size={22} />
      </button>

      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Upload or Select Your Profile Photo
      </h2>

      {/* Preview Circle */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className="relative w-32 h-32 rounded-full border-4 border-dashed hover:border-blue-400 cursor-pointer overflow-hidden shadow-md"
          onClick={() => inputRef.current.click()}
        >
          {previewURL ? (
            <img
              src={previewURL}
              alt="Preview"
              className="w-full h-full object-cover hover:opacity-90 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <ImagePlus size={32} />
            </div>
          )}
        </div>

        {previewURL && (
          <button
            onClick={clearImage}
            className="text-sm text-red-500 hover:underline flex items-center gap-1"
          >
            <Trash2 size={16} /> Remove Image
          </button>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={inputRef}
          className="hidden"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={uploadProfilePhoto}
          disabled={uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full disabled:opacity-50 transition"
        >
          <UploadCloud size={18} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200" />

      {/* Avatar Grid */}
      <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">
        Or Choose a Predefined Avatar
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 justify-items-center">
        {diceBearAvatars.map((avatar) => (
          <img
            key={avatar}
            src={avatar}
            alt="DiceBear avatar"
            className={`w-16 h-16 rounded-full cursor-pointer transition-all duration-200 border-4 ${
              selectedAvatar === avatar
                ? "border-blue-600 shadow-lg scale-110"
                : "border-transparent hover:scale-105 hover:border-blue-300"
            }`}
            onClick={() => selectAvatar(avatar)}
          />
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 mt-6">
        Drag & drop an image, click the circle to upload, or select an avatar.
      </p>
    </div>
  </div>
);

};

export default ProfileModal;
