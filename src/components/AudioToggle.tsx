import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

export function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      className="audio-toggle"
      aria-label={isMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-white/70" />
      ) : (
        <Volume2 className="w-5 h-5 text-romantic-pink" />
      )}
    </button>
  );
}
