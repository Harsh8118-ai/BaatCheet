import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react'; // install via: npm install emoji-picker-react

const ReactionBar = ({ 
  onReact, 
  currentUserReaction, 
  showAllOptions = false, 
  isOwn = false,
  theme = {} 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  // Explicitly define each emoji with a unique key to ensure proper rendering
  const quickReactions = [
    { emoji: '❤️', key: 'heart' },
    { emoji: '👍', key: 'thumbsup' },
    { emoji: '😂', key: 'joy' },
    { emoji: '😮', key: 'wow' },
    { emoji: '😢', key: 'sad' },
    { emoji: '😡', key: 'angry' }
  ];
  
  const pickerRef = useRef(null);
  
  // Get theme-specific styles or default to light theme
  const getBgColor = () => {
    if (theme.reactionBarBg) return theme.reactionBarBg;
    return 'bg-white';
  };
  
  const getHighlightColor = () => {
    if (theme.reactionHighlight) return theme.reactionHighlight;
    return 'bg-blue-100';
  };
  
  const getHoverColor = () => {
    if (theme.reactionHover) return theme.reactionHover;
    return 'hover:bg-gray-100';
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  // Debug console log - remove in production
  useEffect(() => {
    console.log('ReactionBar rendering with quickReactions:', quickReactions);
  }, []);

  const handleReactionClick = (emoji) => {
    console.log('Reaction clicked:', emoji);
    // Toggle reaction: remove if already selected
    if (currentUserReaction === emoji) {
      onReact(null); // remove reaction
    } else {
      onReact(emoji); // add/update reaction
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    console.log('Emoji selected from picker:', emoji);
    handleReactionClick(emoji);
    setShowPicker(false);
  };

  // Don't show reaction bar for own messages if not explicitly enabled
  if (isOwn && !showAllOptions) {
    return null;
  }

  return (
    <div className={`relative w-full px-2 max-w-md mx-auto ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`flex items-center ${getBgColor()} border rounded-full shadow-lg p-1 gap-1 overflow-x-auto overflow-visible relative`}>
        {quickReactions.map((item) => (
          <button
            key={item.key}
            onClick={() => handleReactionClick(item.emoji)}
            className={`rounded-full p-2 transition duration-200 text-xl cursor-pointer ${
              currentUserReaction === item.emoji ? getHighlightColor() : getHoverColor()
            }`}            
            aria-label={`React with ${item.key}`}
          >
            <span className="emoji-display">{item.emoji}</span>
          </button>
        ))}

        {/* "+" icon to trigger full emoji picker */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`rounded-full p-2 ${getHoverColor()} transition`}
          aria-label="Open emoji picker"
        >
          <Plus size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Emoji Picker Modal */}
      {showPicker && (
  <div 
    ref={pickerRef}
    className="absolute z-50 top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-xl p-2 animate-fadeIn"
    style={{ width: '320px' }}
  >
    <EmojiPicker 
      onEmojiClick={handleEmojiClick} 
      theme={theme.emojiPickerTheme || "light"}
      lazyLoadEmojis={true}
      searchDisabled={false}
      skinTonesDisabled={false}
      width={300}
      height={400}
    />
  </div>
)}

      
      {/* Add global styles to ensure emojis render properly */}
      <style jsx>{`
        .emoji-display {
          display: inline-block;
          font-family: "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", "Android Emoji", EmojiSymbols, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default ReactionBar;