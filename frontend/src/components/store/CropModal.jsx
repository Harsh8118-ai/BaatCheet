import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@radix-ui/react-slider"; // or your own slider component
import getCroppedImg from "./cropImage";

const CropModal = ({ image, onClose, onCropDone }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropDone(croppedImageBlob);
    } catch (error) {
      console.error("Crop failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-4 space-y-4">
        <div className="relative w-full h-72 bg-gray-100 rounded-md overflow-hidden">
          <Cropper
            image={image}
            crop={{ x: 0, y: 0 }}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rotation</label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Crop & Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
