import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import EmojiVoiceModal from './EmojiVoiceModal';
import { useEmojiVoices } from './EmojiVoiceContext';

const voiceEmojis = [
  { emoji: '👋', label: 'Hello', defaultSound: '/sounds/hello.mp3' },
  { emoji: '🤚', label: 'Stop', defaultSound: '/sounds/stop.mp3' },
  { emoji: '✋', label: 'Wait', defaultSound: '/sounds/wait.mp3' },
  { emoji: '👍', label: 'Thumbs Up', defaultSound: '/sounds/thumbs_up.mp3' },
  { emoji: '👎', label: 'Thumbs Down', defaultSound: '/sounds/thumbs_down.mp3' },
  { emoji: '✌️', label: 'Peace', defaultSound: '/sounds/peace.mp3' },
  { emoji: '🤟', label: 'I Love You', defaultSound: '/sounds/i_love_you.mp3' },
  { emoji: '👏', label: 'Clap', defaultSound: '/sounds/clap.mp3' },
  { emoji: '🙌', label: 'Celebrate', defaultSound: '/sounds/celebrate.mp3' },
  { emoji: '🤙', label: 'Call Me', defaultSound: '/sounds/call_me.mp3' },
  { emoji: '😘', label: 'Kiss', defaultSound: '/sounds/kiss.mp3' },
  { emoji: '😍', label: 'Love It', defaultSound: '/sounds/love_it.mp3' },
  { emoji: '😂', label: 'Laugh', defaultSound: '/sounds/laugh.mp3' },
  { emoji: '🤣', label: 'ROFL', defaultSound: '/sounds/rofl.mp3' },
  { emoji: '😢', label: 'Sad', defaultSound: '/sounds/sad.mp3' },
  { emoji: '😡', label: 'Angry', defaultSound: '/sounds/angry.mp3' },
  { emoji: '😱', label: 'Shock', defaultSound: '/sounds/shock.mp3' },
  { emoji: '😎', label: 'Cool', defaultSound: '/sounds/cool.mp3' },
  { emoji: '🤔', label: 'Thinking', defaultSound: '/sounds/thinking.mp3' },
];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { voiceMap, updateVoice } = useEmojiVoices();

  const handleSelectEmoji = (emojiObj) => {
  const emoji = emojiObj.emoji;
  const soundUrl = voiceMap[emoji] || emojiObj.defaultSound;

  const audio = new Audio(soundUrl);
  audio.play();

  onSelect({
    messageType: "emoji",
    emoji,
    emojiSoundUrl: soundUrl,
  });
};


  const handleUploadSuccess = (messageType, emoji, emojiSoundUrl) => {
    updateVoice(messageType, emoji, emojiSoundUrl);
  };

  return (
    <div className="bg-gray-300 rounded-lg shadow-lg p-2 absolute bottom-20 left-4 right-4 max-h-96 z-10">
      <div className="flex justify-between items-center mb-2">
        <span></span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="text-gray-600 hover:text-gray-700"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={onClose}
            className="text-red-600 hover:text-gray-700 shadow-sm shadow-gray-700 rounded-xl"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-64">
        {voiceEmojis.map((item) => {
          const isCustom = Boolean(voiceMap[item.emoji]);
          const soundUrl = isCustom ? voiceMap[item.emoji] : item.defaultSound;

          return (
            <div key={item.emoji} className="flex flex-col items-center text-xl">
              {/* Emoji Select/Preview */}
              <button
                onClick={() =>
                  editMode
                    ? new Audio(soundUrl).play()
                    : handleSelectEmoji(item)
                }
                className="p-1 hover:bg-gray-100 rounded text-center"
              >
                {item.emoji}
              </button>

              {/* Edit Button */}
              {editMode && (
                <button
                  onClick={() => setSelectedEmoji(item.emoji)}
                  className="text-xs text-gray-800 hover:underline mt-1 hover:scale-105"
                >
                  {isCustom ? 'Change 🎙️' : 'Set🎙️'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Voice Upload Modal */}
      {selectedEmoji && (
        <EmojiVoiceModal
          emojiObj={voiceEmojis.find((item) => item.emoji === selectedEmoji)}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setSelectedEmoji(null)}
        />
      )}
    </div>
  );
};

export default EmojiPicker;
