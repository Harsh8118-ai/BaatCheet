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
      messageType: 'emoji',
      emoji,
      emojiSoundUrl: soundUrl,
    });
  };

  const handleUploadSuccess = (messageType, emoji, emojiSoundUrl) => {
    updateVoice(messageType, emoji, emojiSoundUrl);
  };

  return (
    <div className="absolute bottom-24 left-4 right-4 sm:left-1/2 sm:translate-x-[-50%] max-w-xl mx-auto p-4 rounded-2xl backdrop-blur-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 dark:bg-gray-900/80 shadow-2xl border border-purple-100 z-50 transition-all">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-gray-700 dark:text-white tracking-wide">Emoji Reactions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="text-gray-600 dark:text-gray-300 hover:text-purple-500 transition"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-4 overflow-y-auto max-h-64 px-1">
        {voiceEmojis.map((item) => {
          const isCustom = Boolean(voiceMap[item.emoji]);
          const soundUrl = isCustom ? voiceMap[item.emoji] : item.defaultSound;

          return (
            <div key={item.emoji} className="flex flex-col items-center text-center">
              <button
                onClick={() =>
                  editMode
                    ? new Audio(soundUrl).play()
                    : handleSelectEmoji(item)
                }
                className="text-2xl sm:text-3xl bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] rounded-full p-2 transition-transform duration-150 hover:scale-110 hover:shadow-[0_6px_14px_rgba(0,0,0,0.2)]"
                style={{
                  boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.6), inset 2px 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15)',
                }}
              >
                {item.emoji}
              </button>
              {editMode && (
                <button
                  onClick={() => setSelectedEmoji(item.emoji)}
                  className="text-xs mt-1 text-purple-600 hover:underline transition hover:scale-105"
                >
                  {isCustom ? 'Change 🎙️' : 'Set 🎙️'}
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
