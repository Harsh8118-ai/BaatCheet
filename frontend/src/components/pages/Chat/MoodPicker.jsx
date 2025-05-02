import React from 'react';
import { X } from 'lucide-react';

const MoodPicker = ({ currentMood, onSelect, onClose }) => {
  const moods = [
    { id: 'happy', name: 'Happy', icon: '😄', color: 'bg-yellow-100' },
    { id: 'calm', name: 'Calm', icon: '😌', color: 'bg-blue-100' },
    { id: 'romantic', name: 'Romantic', icon: '💖', color: 'bg-pink-100' },
    { id: 'dark', name: 'Dark', icon: '🌙', color: 'bg-gray-800' },
    { id: 'energetic', name: 'Energetic', icon: '⚡', color: 'bg-orange-100' },
    { id: 'professional', name: 'Professional', icon: '👔', color: 'bg-indigo-100' },
  ];

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
            onClick={() => onSelect(mood.id)}
            className={`p-3 rounded-lg flex flex-col items-center ${
              currentMood === mood.id
                ? 'ring-2 ring-purple-500 ring-offset-2'
                : 'hover:bg-gray-50'
            } ${mood.color} ${mood.id === 'dark' ? 'text-white' : ''}`}
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