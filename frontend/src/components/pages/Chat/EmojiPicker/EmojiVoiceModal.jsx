import React, { useState, useRef } from 'react';
import { X, Mic, StopCircle, UploadCloud } from 'lucide-react';
import axios from 'axios';

const EmojiVoiceModal = ({ emojiObj, onClose, onUploadSuccess }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [blob, setBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESET = import.meta.env.VITE_CLOUDINARY_EMOJI_PRESET_NAME;
  const BASE = import.meta.env.VITE_BACKEND_URL;

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setBlob(audioBlob);
      setAudioURL(url);
      chunks.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadToCloudinary = async () => {
  if (!blob) return;
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', PRESET);

  try {
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await cloudinaryRes.json();
    const cloudinaryUrl = data.secure_url;

    const token = localStorage.getItem("token");
    if (!emojiObj.emoji || !cloudinaryUrl) {
      console.error('Missing emoji or sound URL');
      return;
    }

    await axios.post(
      `${BASE}/emoji/post`,
      {
        emoji: emojiObj.emoji,
        emojiSoundUrl: cloudinaryUrl,
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    onUploadSuccess(emojiObj.emoji, cloudinaryUrl);
    onClose();
  } catch (err) {
    console.error('Upload or save failed:', err);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md w-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-semibold">Set Voice for {emojiObj.emoji}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full"
            >
              <Mic size={18} /> Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1 text-white bg-gray-700 hover:bg-gray-800 px-4 py-1 rounded-full"
            >
              <StopCircle size={18} /> Stop
            </button>
          )}

          {audioURL && (
            <>
              <audio controls src={audioURL} className="w-full" />
              <button
                onClick={uploadToCloudinary}
                className="flex items-center gap-1 text-white bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full"
              >
                <UploadCloud size={18} /> Upload
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiVoiceModal;
