import { createContext, useState, useContext } from "react";

const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
  const [mood, setMood] = useState("default"); // "sunny", "romantic", "dark", etc.

  return (
    <MoodContext.Provider value={{ mood, setMood }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext);
