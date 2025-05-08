import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

const moods = [
  { id: "happy", name: "Happy", icon: "😄", color: "bg-yellow-100" },
  { id: "calm", name: "Calm", icon: "😌", color: "bg-blue-100" },
  { id: "romantic", name: "Romantic", icon: "💖", color: "bg-pink-100" },
  { id: "dark", name: "Dark", icon: "🌙", color: "bg-gray-800 text-white" },
  { id: "energetic", name: "Energetic", icon: "⚡", color: "bg-orange-100" },
  { id: "professional", name: "Professional", icon: "👔", color: "bg-indigo-100" },
];

const MoodPicker = ({ userId, onClose, onMoodChange }) => {
  const [currentMood, setCurrentMood] = useState("happy");
  const BASE = import.meta.env.VITE_BACKEND_URL;

  // Fetch the current mood of the user when the component is mounted
  useEffect(() => {
    axios
      .get(`${BASE}/chat/mood/${userId}`) // Get the user's current mood
      .then((res) => {
        setCurrentMood(res.data.mood);
      })
      .catch((err) => {
        console.error("Error fetching user mood", err);
      });
  }, [userId]);

  // Handle mood selection and update both user and message mood
  const handleSelect = async (moodId) => {
    setCurrentMood(moodId);
    try {
      // Update the mood in both User and Message schema
      await axios.post(`${BASE}/chat/mood`, { userId, mood: moodId });

      if (onMoodChange) onMoodChange(moodId); // Notify parent component of mood change
    } catch (err) {
      console.error("Error setting mood", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 absolute bottom-20 left-4 right-4 z-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Chat Mood</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleSelect(mood.id)}
            className={`p-3 rounded-lg flex flex-col items-center ${
              currentMood === mood.id
                ? "ring-2 ring-purple-500 ring-offset-2"
                : "hover:bg-gray-50"
            } ${mood.color}`}
          >
            <span className="text-2xl mb-1">{mood.icon}</span>
            <span className="text-xs font-medium">{mood.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodPicker;
