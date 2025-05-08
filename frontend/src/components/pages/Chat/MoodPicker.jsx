import React, { useEffect, useState } from "react";
import {
  Smile, Cloud, Heart, Moon, Zap,
  Briefcase, X,
} from "lucide-react";
import axios from "axios";
import { moodThemes } from "../../store/theme"; 

const moods = [
  { id: "happy", name: "Happy", icon: <Smile size={22} /> },
  { id: "calm", name: "Calm", icon: <Cloud size={22} /> },
  { id: "romantic", name: "Romantic", icon: <Heart size={22} /> },
  { id: "dark", name: "Dark", icon: <Moon size={22} /> },
  { id: "energetic", name: "Energetic", icon: <Zap size={22} /> },
  { id: "professional", name: "Professional", icon: <Briefcase size={22} /> },

];


const MoodPicker = ({ userId, onClose, onMoodChange }) => {
  const [currentMood, setCurrentMood] = useState("happy");
  const BASE = import.meta.env.VITE_BACKEND_URL;

  // Fetch the current mood of the user when the component is mounted
  useEffect(() => {
    axios
      .get(`${BASE}/chat/mood/${userId}`) 
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

      if (onMoodChange) onMoodChange(moodId); 
      if (onClose) onClose(); 
    } catch (err) {
      console.error("Error setting mood", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 absolute bottom-20 left-4 right-4 z-10">
      <div className="flex justify-between items-center mb-3">
        <span></span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleSelect(mood.id)}
            className={`p-3 rounded-xl flex flex-col items-center justify-center text-sm font-semibold text-slate-800
              ${moodThemes[mood.id]?.bg || "bg-gray-100"}
              ${currentMood === mood.id ? "ring-2 ring-purple-500 ring-offset-2" : ""}
              shadow-md active:translate-y-1 transition-transform duration-150 ease-in-out hover:shadow-lg`}
          >
            <span className="mb-1">{mood.icon}</span>
            <span>{mood.name}</span>

          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodPicker;
