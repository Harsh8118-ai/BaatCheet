import React from 'react';

const TypingIndicator = ({ isTyping }) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center px-4 py-2">
      <div className="flex space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
      <span className="text-xs text-gray-500 ml-2">typing...</span>
    </div>
  );
};

export default TypingIndicator;
