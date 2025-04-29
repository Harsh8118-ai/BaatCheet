import React, { useEffect, useState } from "react";

const themes = [
  "default",
  "dark",
  "green",
  "blue",
  "red",
  "purple",
  "orange",
  "yellow",
  "gray",
];

// Define colors for each theme
const themeColors = {
  default: { primary: "#D1D5DB", secondary: "#D1D5DB" },
  dark: { primary: "#1E1E1E", secondary: "#333333" },
  green: { primary: "#2E7D32", secondary: "#1B5E20" },
  blue: { primary: "#1976D2", secondary: "#0D47A1" },
  red: { primary: "#D32F2F", secondary: "#B71C1C" },
  purple: { primary: "#7B1FA2", secondary: "#4A148C" },
  orange: { primary: "#F57C00", secondary: "#E65100" },
  yellow: { primary: "#FBC02D", secondary: "#F9A825" },
  gray: { primary: "#757575", secondary: "#424242" },
};

export default function ThemeSwitcher() {
  // ✅ Load initial theme from localStorage using a function in useState
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("theme") || "default");

  // ✅ Ensure the theme is applied when the component mounts
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--text-color)]">
        Change Theme
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme}
            className="p-3 rounded-xl text-white font-semibold transition-all duration-300 relative"
            style={{
              background: `linear-gradient(135deg, ${themeColors[theme].primary}, ${themeColors[theme].secondary})`,
              border: currentTheme === theme ? "3px solid white" : "none",
              boxShadow:
                currentTheme === theme
                  ? "0px 5px 0px rgba(0, 0, 0, 0.3)"
                  : "0px 7px 0px rgba(0, 0, 0, 0.5)",
              transform: currentTheme === theme ? "translateY(2px)" : "translateY(0px)",
            }}
            onClick={() => changeTheme(theme)}
            data-theme={theme}
            onMouseDown={(e) => (e.target.style.transform = "translateY(5px)")}
            onMouseUp={(e) => (e.target.style.transform = "translateY(0px)")}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
