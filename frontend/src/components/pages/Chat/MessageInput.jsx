import { Smile, Paperclip, Send, X } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

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
}) => (
  <div className="fixed p-4 bg-transparent bottom-0">
    <div className="flex items-center space-x-2">
      

      <div className="flex-1 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={handleTyping}
          className="w-full py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
          placeholder="Type a message..."
        />
      </div>

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-500 hover:text-gray-700"
      >
        <Smile size={20} />
      </button>

      <label className="text-gray-500 hover:text-gray-700 cursor-pointer">
        <Paperclip size={20} />
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
      </label>

      {file && (
        <div className="bg-gray-200 px-2 py-1 rounded-full flex items-center">
          <span className="text-xs mr-1 truncate max-w-[100px]">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-700">
            <X size={14} />
          </button>
        </div>
      )}

      {inputValue || file ? ( 
        <button
          onClick={handleSendMessage}
          className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
        >
          <Send size={18} />
        </button>
      ) : (
        <VoiceRecorder
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          onRecordingComplete={(audioBlob) => {
            const audioFile = new File([audioBlob], 'voice-message.mp3', { type: 'audio/mp3' });
            setFile(audioFile);
          }}
        />
      )} 
    </div>
  </div>
);

export default MessageInput;
