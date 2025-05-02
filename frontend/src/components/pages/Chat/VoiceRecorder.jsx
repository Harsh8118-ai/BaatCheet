import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

const VoiceRecorder = ({ isRecording, onToggleRecording, onRecordingComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      stopRecording();
      clearInterval(timerRef.current);
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      onToggleRecording(); // Turn off recording if there's an error
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="flex items-center">
      {isRecording && (
        <div className="mr-2 text-sm flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
          <span>{formatTime(elapsedTime)}</span>
        </div>
      )}
      <button
        onClick={onToggleRecording}
        className={`w-10 h-10 ${
          isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-500'
        } rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors`}
      >
        <Mic size={18} />
      </button>
    </div>
  );
};

export default VoiceRecorder;