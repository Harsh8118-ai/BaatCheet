import React, { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import getCroppedImg from "./cropImage"; // your helper to get cropped Blob

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
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Easton",
];

const ProfileModal = ({ isOpen, onClose, onProfileUploaded }) => {
  const [image, setImage] = useState(null); // the File or cropped File to upload
  const [previewURL, setPreviewURL] = useState(null); // URL for preview and cropping
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const inputRef = useRef();

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Environment variables for Cloudinary and backend
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewURL(url);
      setSelectedAvatar(null);
      setShowCrop(true);
      setError("");
    }
  };

  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewURL(url);
      setSelectedAvatar(null);
      setShowCrop(true);
      setError("");
    } else {
      setError("Please drop a valid image file.");
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  // Clear current image selection
  const clearImage = () => {
    setImage(null);
    setPreviewURL(null);
    setSelectedAvatar(null);
    inputRef.current.value = null;
    setError("");
  };

  // Select from predefined avatars
  const selectAvatar = (url) => {
    setSelectedAvatar(url);
    setImage(null);
    setPreviewURL(url);
    setError("");
  };

  // Cropper callbacks
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Perform cropping and update preview and file
  const cropAndSetImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(previewURL, croppedAreaPixels);
      const croppedURL = URL.createObjectURL(croppedBlob);
      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });
      setImage(croppedFile);
      setPreviewURL(croppedURL);
      setShowCrop(false);
      setSelectedAvatar(null);
      setError("");
    } catch (err) {
      console.error("Cropping failed:", err);
      setError("Cropping failed. Please try again.");
    }
  };

  // Upload image or avatar to Cloudinary and update backend
  const uploadProfilePhoto = async () => {
    if (!image && !selectedAvatar) {
      setError("Please select an image or avatar before saving.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      let profileUrl;

      if (selectedAvatar) {
        // If user chose a predefined avatar, no upload needed
        profileUrl = selectedAvatar;
      } else {
        // Upload cropped or original image file to Cloudinary
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
        if (!cloudinaryRes.ok) {
          throw new Error(data.error?.message || "Upload failed");
        }
        profileUrl = data.secure_url;
      }

      // Update user profile on your backend
      const token = localStorage.getItem("token");
      const updateRes = await fetch(`${BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileUrl }),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || "Profile update failed");
      }

      onProfileUploaded(profileUrl);
      alert("Profile photo updated!");
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Try again.");
    }
    setUploading(false);
  };

  // Close on Escape key
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
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full space-y-4 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-lg font-bold text-center text-gray-800">
          Update Profile Photo
        </h2>

        {/* Predefined Avatars */}
        <div className="flex flex-wrap gap-4 justify-center max-h-36 overflow-y-auto mb-4">
          {diceBearAvatars.map((avatar) => (
            <img
              key={avatar}
              src={avatar}
              alt="avatar"
              onClick={() => selectAvatar(avatar)}
              className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                selectedAvatar === avatar ? "border-blue-500" : "border-transparent"
              } hover:border-blue-300`}
            />
          ))}
        </div>

        {/* Drag & Drop + File Input */}
        <label
          htmlFor="fileInput"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition"
          aria-label="Upload new profile photo"
        >
          <UploadCloud size={36} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Drag & drop an image or click to select</span>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Show preview and cropping */}
        {previewURL && (
          <div className="relative mt-4 w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {showCrop ? (
              <>
                <Cropper
                  image={previewURL}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
                <div className="absolute bottom-4 left-0 right-0 px-8 flex items-center gap-4">
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(_, val) => setZoom(val)}
                    aria-label="Zoom"
                  />
                  <button
                    onClick={cropAndSetImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Crop
                  </button>
                  <button
                    onClick={() => {
                      setShowCrop(false);
                      setPreviewURL(null);
                      setImage(null);
                      inputRef.current.value = null;
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={previewURL}
                  alt="Profile Preview"
                  className="object-cover w-full h-full rounded-full"
                />
                <button
                  onClick={() => setShowCrop(true)}
                  className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
                  aria-label="Edit crop"
                >
                  <ImagePlus size={20} />
                </button>
                <button
                  onClick={clearImage}
                  className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
                  aria-label="Remove image"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center font-semibold">{error}</p>
        )}

        <button
          onClick={uploadProfilePhoto}
          disabled={uploading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-label="Save profile photo"
        >
          {uploading ? "Uploading..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
