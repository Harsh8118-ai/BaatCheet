import React from 'react';

const ReactionBar = ({ onReact }) => {
  const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  return (
    <div className="flex justify-center bg-white rounded-full shadow-md p-1 mt-2">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <span className="text-lg">{emoji}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;