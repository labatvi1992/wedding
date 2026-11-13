import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { weddingAudioPlayer } from '../utils/audioSynth';

interface AudioDiscButtonProps {
  className?: string;
}

export const AudioDiscButton: React.FC<AudioDiscButtonProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    weddingAudioPlayer.registerStateListener((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  const handleToggle = () => {
    const nextState = weddingAudioPlayer.toggle();
    setIsPlaying(nextState);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleToggle}
      aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc thiệp cưới'}
      title={isPlaying ? 'Đang phát nhạc cưới (Bấm để dừng)' : 'Bấm để bật nhạc cưới'}
      className={`relative w-10 h-10 rounded-full bg-white shadow-md border border-stone-200/80 flex items-center justify-center cursor-pointer transition-shadow hover:shadow-lg ${className}`}
    >
      {/* Sound equalizer bars */}
      <div className="flex items-center justify-center gap-[2.5px] h-4">
        <span
          className={`w-[2.5px] rounded-full bg-[#721319] transition-all ${
            isPlaying ? 'animate-eq-1' : 'h-2'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-[#721319] transition-all ${
            isPlaying ? 'animate-eq-2' : 'h-3.5'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-[#721319] transition-all ${
            isPlaying ? 'animate-eq-3' : 'h-2.5'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-[#721319] transition-all ${
            isPlaying ? 'animate-eq-1' : 'h-1.5'
          }`}
        />
      </div>

      {/* Diagonal mute slash when paused */}
      {!isPlaying && (
        <span className="absolute w-6 h-[2px] bg-[#c92a2a] rotate-[-40deg] rounded-full shadow-xs pointer-events-none" />
      )}
    </motion.button>
  );
};
