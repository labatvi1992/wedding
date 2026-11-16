import React from 'react';
import { motion } from 'framer-motion';

export const LoveStorySection: React.FC = () => {
  return (
    <section
      id="section-lovestory"
      className="w-full bg-white px-5 sm:px-8 pt-6 pb-12 overflow-hidden select-none"
    >
      <div className="relative max-w-md mx-auto flex flex-col items-center">
        {/* Top Tilted Notebook Sheet 1: "CHUYỆN TÌNH CHÚNG MÌNH" */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: 2 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="relative z-30 w-[94%] sm:w-[92%] notebook-paper rounded-md shadow-[0_12px_30px_rgba(0,0,0,0.15)] border border-stone-300/90 pl-9 pr-5 sm:pl-10 sm:pr-6 py-6"
        >
          {/* Left spiral holes */}
          <div className="absolute left-2.5 top-4 bottom-4 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-3.5 h-[3px] bg-stone-400/80 -ml-3 mr-1 rounded-xs" />
                <span className="w-2.5 h-2.5 rounded-xs bg-white shadow-inner border border-stone-300/90" />
              </div>
            ))}
          </div>

          <div className="text-left space-y-2.5">
            <h2 className="font-serif-editorial text-xl sm:text-[24px] text-[#5e1418] tracking-wider uppercase font-semibold border-b border-stone-300/80 pb-2">
              CHUYỆN TÌNH CHÚNG MÌNH
            </h2>
            <p className="font-serif-editorial text-[15.5px] sm:text-[17px] text-stone-800 leading-[1.68] text-justify">
              Bọn mình bắt đầu từ những buổi tối đi dạo biển và mấy quán ăn vỉa hè. Rồi tự lúc nào không hay, hai người xa lạ đã đồng hành &amp; gắn bó cùng nhau. Đến hôm nay thì thấy rõ: chuyện lớn nhất đời người hóa ra chỉ là chọn được người ngồi cùng bàn ăn mỗi tối.
            </p>
          </div>
        </motion.div>

        {/* Middle Tilted Notebook Sheet 2: "và rồi chúng mình" */}
        <motion.div
          initial={{ opacity: 0, y: 22, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2.2 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, delay: 0.12, ease: 'easeOut' }}
          className="relative z-20 w-[92%] sm:w-[90%] -mt-4 notebook-paper rounded-md shadow-[0_10px_24px_rgba(0,0,0,0.13)] border border-stone-300/85 pl-9 pr-5 sm:pl-10 sm:pr-6 pt-7 pb-4"
        >
          {/* Left spiral holes */}
          <div className="absolute left-2.5 top-3.5 bottom-3.5 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-3 h-[3px] bg-stone-400/75 -ml-2.5 mr-1 rounded-xs" />
                <span className="w-2.5 h-2.5 rounded-xs bg-white shadow-inner border border-stone-300" />
              </div>
            ))}
          </div>

          <div className="text-center sm:text-left">
            <p className="font-serif-editorial text-[16.5px] sm:text-[18px] text-stone-700 italic tracking-wide">
              và rồi chúng mình...
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
