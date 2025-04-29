import { useState } from "react";

export function Switch({ checked, onCheckedChange }) {
  const [isOn, setIsOn] = useState(checked);

  const toggleSwitch = () => {
    setIsOn(!isOn);
    onCheckedChange(!isOn);
  };

  return (
    <div
      className={`w-12 h-6 flex items-center bg-gray-600 rounded-full p-1 cursor-pointer transition-all duration-300 ${
        isOn ? "bg-green-500" : "bg-gray-400"
      }`}
      onClick={toggleSwitch}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
          isOn ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
