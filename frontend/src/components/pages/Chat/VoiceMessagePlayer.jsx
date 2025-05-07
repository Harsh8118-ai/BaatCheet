import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const VoiceMessagePlayer = ({ src, isSender }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const waveform = [4, 8, 6, 10, 7, 5, 9, 3, 6, 8, 4, 7, 5, 6, 9, 4];

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-300 rounded-xl shadow-sm max-w-md`}
    >
      <button
        onClick={togglePlay}
        className="bg-gray-500 p-2 rounded-full shadow hover:bg-gray-700 transition"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex-1">
        <div className="flex items-end gap-[2px] h-16 w-full overflow-hidden">
          {waveform.map((height, index) => {
            const percentage = progress / (audioRef.current?.duration || 1);
            const smoothProgress = Math.min(Math.max(percentage, 0), 1); 
            const isActive = index < waveform.length * smoothProgress;

            return (
              <div
                key={index}
                className={`w-[2px] rounded-sm ${isActive ? 'bg-blue-500' : 'bg-gray-600'}`}
                style={{ height: `${height * 4}px` }}
              />
            );
          })}
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default VoiceMessagePlayer;
