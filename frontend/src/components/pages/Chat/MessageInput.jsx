import { Smile, Paperclip, Send, X } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { useEffect, useRef } from 'react';

const MessageInput = ({
  inputValue,
  setInputValue,
  handleKeyPress,
  handleTyping,
  showEmojiPicker,
  setShowEmojiPicker,
  file,
  setFile,
  handleSendMessage,
  isRecording,
  toggleRecording,
  currentMood,
  currentText,
}) => {
  const filePreviewRef = useRef(null);

  useEffect(() => {
    if (file && filePreviewRef.current) {
      filePreviewRef.current.classList.add('animate-fade-in');
    }
  }, [file]);

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-3 sm:p-4 backdrop-blur-md shadow-[0_-2px_20px_rgba(0,0,0,0.1)] z-50 ${currentMood} ${currentText}`}>
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onInput={handleTyping}
            className="w-full h-10 px-4 rounded-full bg-gray-100 focus:bg-white border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            placeholder="Type your message..."
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 h-10">
          {/* Emoji Toggle */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 flex items-center justify-center text-gray-800 hover:text-purple-600 transition"
            title="Emoji"
          >
            <Smile size={22} />
          </button>

          {/* File Upload */}
          <label
            className="w-10 h-10 flex items-center justify-center text-gray-800 hover:text-purple-600 transition cursor-pointer"
            title="Attach file"
          >
            <Paperclip size={22} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>

        {/* File Preview */}
        {file && (
          <div
            ref={filePreviewRef}
            className="flex items-center bg-purple-50 text-purple-800 rounded-full px-3 py-1 text-xs shadow-sm max-w-[150px] truncate animate-fade-in"
          >
            <span className="truncate mr-2">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="hover:text-red-500 transition-colors duration-200"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Send or Voice Recorder */}
        {inputValue || file ? (
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            title="Send message"
          >
            <Send size={18} />
          </button>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center">
            <VoiceRecorder
              isRecording={isRecording}
              onToggleRecording={toggleRecording}
              onRecordingComplete={(audioBlob) => {
                const audioFile = new File([audioBlob], 'voice-message.mp3', {
                  type: 'audio/mp3',
                });
                setFile(audioFile);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
