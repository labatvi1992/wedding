import React from 'react';
import { motion } from 'framer-motion';

export const LoveStorySection: React.FC = () => {
  const spiralCount = 9;

  return (
    <section
      id="section-lovestory"
      className="w-full bg-white px-4 sm:px-8 pt-6 pb-14 overflow-hidden select-none"
    >
      <div className="relative max-w-md mx-auto pt-4 pb-8">
        {/* Bottom-most Tilted Notebook Sheet 3: "Đời đẩy hai đứa về chung một lối" */}
        <motion.div
          initial={{ opacity: 0, y: 35, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4.5 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, delay: 0.25, ease: 'easeOut' }}
          className="relative z-10 notebook-paper-alt rounded-sm shadow-[0_10px_28px_rgba(0,0,0,0.15)] border border-stone-300/80 px-6 py-6 mt-44 sm:mt-48 ml-8 sm:ml-12 mr-1"
        >
          {/* Left spiral holes */}
          <div className="absolute left-2.5 top-4 bottom-4 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-3 h-[3px] bg-stone-400/70 -ml-2.5 mr-1 rounded-xs" />
                <span className="w-2.5 h-2.5 rounded-xs bg-white shadow-inner border border-stone-300" />
              </div>
            ))}
          </div>

          <div className="pl-5 pt-16 sm:pt-20 text-left">
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 tracking-wide">
              &quot;Đời đẩy hai đứa về chung một lối&quot;
            </p>
          </div>
        </motion.div>

        {/* Middle Tilted Notebook Sheet 2: "và rồi chúng mình" */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: 2.5 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, delay: 0.12, ease: 'easeOut' }}
          className="absolute inset-x-3 sm:inset-x-5 top-28 sm:top-32 z-20 notebook-paper rounded-sm shadow-[0_10px_26px_rgba(0,0,0,0.14)] border border-stone-300/80 px-6 py-6 h-56 sm:h-60 flex flex-col justify-end"
        >
          {/* Left spiral holes */}
          <div className="absolute left-2.5 top-4 bottom-4 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-3 h-[3px] bg-stone-400/70 -ml-2.5 mr-1 rounded-xs" />
                <span className="w-2.5 h-2.5 rounded-xs bg-white shadow-inner border border-stone-300" />
              </div>
            ))}
          </div>

          <div className="pl-5 pb-1 text-left">
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-700 italic">
              và rồi chúng mình
            </p>
          </div>
        </motion.div>

        {/* Top Tilted Notebook Sheet 1: "OUR LOVE STORY" */}
        <motion.div
          initial={{ opacity: 0, y: 25, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: 8.5 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="absolute inset-x-4 sm:inset-x-6 top-2 z-30 notebook-paper rounded-sm shadow-[0_14px_34px_rgba(0,0,0,0.18)] border border-stone-300/90 px-6 sm:px-7 py-6"
        >
          {/* Left spiral holes */}
          <div className="absolute left-2.5 top-4 bottom-4 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: spiralCount }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-3.5 h-[3px] bg-stone-400/80 -ml-3 mr-1 rounded-xs" />
                <span className="w-2.5 h-2.5 rounded-xs bg-white shadow-inner border border-stone-300/90" />
              </div>
            ))}
          </div>

          <div className="pl-5 sm:pl-6 text-left space-y-2.5">
            <h2 className="font-serif-editorial text-2xl sm:text-[28px] text-stone-800 tracking-wide uppercase font-normal">
              OUR LOVE STORY
            </h2>
            <p className="font-serif-editorial text-[15px] sm:text-[16.5px] text-stone-700 leading-[1.6] font-normal">
              Bọn mình bắt đầu từ những tin nhắn nửa đêm và mấy quán ăn vỉa hè. Rồi tự lúc nào không hay, hai người xa lạ đã thuộc thói quen của nhau, biết ai thích cà phê đắng, ai sợ mưa. Đến hôm nay thì thấy rõ: chuyện lớn nhất đời người hóa ra chỉ là chọn được người ngồi cùng bàn ăn mỗi tối.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
