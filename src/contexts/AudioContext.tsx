import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Romantic instrumental tracks (self-hosted for reliability)
const MUSIC_TRACKS = [
  '/audio/romantic-piano.mp3',
  '/audio/soft-melody.mp3',
  '/audio/lofi-love.mp3',
];

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default, plays on first interaction
  const [volume, setVolumeState] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex] = useState(0);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(MUSIC_TRACKS[currentTrackIndex]);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = useCallback(async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay prevented, waiting for user interaction');
      }
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : volume;
        if (!newMuted && !isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
      return newMuted;
    });
  }, [volume, isPlaying]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  }, [isMuted]);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        toggleMute,
        play,
        pause,
        volume,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
