import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { weddingAudioPlayer } from '../utils/audioSynth';

interface AudioDiscButtonProps {
  className?: string;
}

export const AudioDiscButton: React.FC<AudioDiscButtonProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => weddingAudioPlayer.getIsPlaying());

  useEffect(() => {
    const unsubscribe = weddingAudioPlayer.registerStateListener((playing) => {
      setIsPlaying(playing);
    });
    weddingAudioPlayer.startAutoPlay();
    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggle = () => {
    const nextState = weddingAudioPlayer.toggle();
    setIsPlaying(nextState);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleToggle}
      aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc thiệp cưới'}
      title={isPlaying ? 'Đang phát nhạc cưới (Bấm để dừng)' : 'Bấm để bật nhạc cưới'}
      className={`relative w-10 h-10 rounded-full bg-white shadow-md border flex items-center justify-center cursor-pointer transition-all hover:shadow-lg ${
        isPlaying
          ? 'border-[#721319]/35 ring-2 ring-[#721319]/15'
          : 'border-stone-200/80'
      } ${className}`}
    >
      {/* Music note icon */}
      <motion.span
        animate={
          isPlaying
            ? { rotate: [-6, 6, -6], scale: [1, 1.08, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={
          isPlaying
            ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        className="flex items-center justify-center"
      >
        <Music
          className={`w-[18px] h-[18px] transition-colors ${
            isPlaying ? 'text-[#721319]' : 'text-[#721319]/80'
          }`}
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </motion.span>

      {/* Diagonal mute slash when paused */}
      {!isPlaying && (
        <span className="absolute w-6 h-[2px] bg-[#721319] rotate-[-40deg] rounded-full shadow-xs pointer-events-none" />
      )}
    </motion.button>
  );
};
