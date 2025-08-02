import React, { useState, useRef } from 'react';
import { X, Mic, StopCircle, UploadCloud } from 'lucide-react';
import axios from 'axios';

const EmojiVoiceModal = ({ emojiObj, onClose, onUploadSuccess }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [blob, setBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESET = import.meta.env.VITE_CLOUDINARY_EMOJI_PRESET_NAME;
  const BASE = import.meta.env.VITE_BACKEND_URL;

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    chunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setBlob(audioBlob);
      setAudioURL(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Auto stop after 2 seconds
    timerRef.current = setTimeout(() => {
      stopRecording();
    }, 2000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearTimeout(timerRef.current);
  };

  const uploadToCloudinary = async () => {
    if (!blob) return;
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', PRESET);
    formData.append('folder', `voice_emoji_uploads`);

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm rounded-xl shadow-xl bg-white text-gray-800 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold tracking-wide">
            🎙️ Set Voice for <span className="text-purple-600 text-xl">{emojiObj.emoji}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center space-y-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-md transition transform hover:scale-105"
            >
              <Mic size={18} /> Start 2-sec Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-md transition"
            >
              <StopCircle size={18} /> Stop
            </button>
          )}

          {audioURL && (
            <>
              <audio controls src={audioURL} className="w-full rounded-md border border-gray-300" />
              <button
                onClick={uploadToCloudinary}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-md transition transform hover:scale-105"
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
