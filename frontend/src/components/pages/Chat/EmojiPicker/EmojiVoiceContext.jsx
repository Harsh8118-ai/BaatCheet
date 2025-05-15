import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EmojiVoiceContext = createContext();

export const useEmojiVoices = () => useContext(EmojiVoiceContext);

export const EmojiVoiceProvider = ({ children }) => {
  const [voiceMap, setVoiceMap] = useState({});

  const BASE = import.meta.env.VITE_BACKEND_URL;

  // Load user voices once (e.g., after login)
  useEffect(() => {
    const cached = localStorage.getItem("emojiVoiceMap");
    if (cached) {
      setVoiceMap(JSON.parse(cached));
    }

    fetchUserVoices();
  }, []);

  const fetchUserVoices = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${BASE}/emoji/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const voicesObj = res.data.voices;
      const map = {};

      for (const emoji in voicesObj) {
        map[emoji] = voicesObj[emoji];
      }

      setVoiceMap(map);
      localStorage.setItem("emojiVoiceMap", JSON.stringify(map)); // 💾 Save for next load
    } catch (err) {
      console.error("Failed to fetch user emoji voices", err);
    }
  };


  const updateVoice = (emoji, soundUrl) => {
    setVoiceMap((prev) => ({
      ...prev,
      [emoji]: soundUrl,
    }));
  };

  return (
    <EmojiVoiceContext.Provider value={{ voiceMap, updateVoice }}>
      {children}
    </EmojiVoiceContext.Provider>
  );
};
