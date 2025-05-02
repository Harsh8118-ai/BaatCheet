import React, { useState } from 'react';
import { X } from 'lucide-react';

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  // Basic emoji categories and emojis
  const categories = [
    { id: 'smileys', name: 'Smileys', icon: '😊' },
    { id: 'people', name: 'People', icon: '👋' },
    { id: 'animals', name: 'Animals', icon: '🐶' },
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'activities', name: 'Activities', icon: '⚽' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'objects', name: 'Objects', icon: '💡' },
    { id: 'symbols', name: 'Symbols', icon: '❤️' },
  ];

  // Simplified emoji sets for each category
  const emojisByCategory = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
    people: ['👋', '🤚', '✋', '🖐️', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍔', '🍕'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🎮'],
    travel: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲'],
    objects: ['💡', '🔦', '🧯', '🚿', '🧴', '🧷', '🧹', '🧺', '🧻', '🚽', '🚪', '🛁', '🪑', '🚬', '⚰️', '🗿', '🏺', '🔭', '🔬', '📱'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'],
  };

  const handleSelectEmoji = (emoji) => {
    onSelect(emoji);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 absolute bottom-20 left-4 right-4 max-h-64 z-10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">Emojis</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      
      {/* Category tabs */}
      <div className="flex overflow-x-auto pb-2 mb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-shrink-0 p-2 mx-1 rounded-md ${
              activeCategory === category.id
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
          </button>
        ))}
      </div>
      
      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 overflow-y-auto max-h-32">
        {emojisByCategory[activeCategory].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSelectEmoji(emoji)}
            className="p-1 hover:bg-gray-100 rounded text-center text-xl"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;