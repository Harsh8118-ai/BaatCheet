import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

const VoiceRecorder = ({ isRecording, onToggleRecording, onRecordingComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      // Only allow on secure origin or localhost
      const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
      if (!isSecure) {
        alert('Voice recording only works on HTTPS or localhost.');
        onToggleRecording();
        return;
      }

      // Check for MediaRecorder support
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        alert('Voice recording is not supported on this device or browser.');
        onToggleRecording();
        return;
      }

      startRecording();

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      stopRecording();
      clearInterval(timerRef.current);
      setElapsedTime(0);
    }

    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const permissionStatus = await navigator.permissions?.query({ name: 'microphone' });
      if (permissionStatus && permissionStatus.state === 'denied') {
        alert('Microphone access denied. Please enable it in your browser settings.');
        onToggleRecording();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Recording error:', err);
      alert('Failed to start voice recording. Please check microphone permission.');
      onToggleRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
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
