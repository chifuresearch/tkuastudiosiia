import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation } from 'swiper/modules'; // 加入 Navigation 模組
import { useTranslation } from 'react-i18next';

// 樣式匯入
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation'; // 確保載入樣式以便蓋掉它

interface GalleryData {
  name: string;
  name_tw: string;
  gallery_title: string;
  gallery_title_tw: string;
  img_path: string;
}

interface GalleryDataProps {
  gallery: GalleryData[];
}

// ... 前面 import 保持不變 ...

export default function GalleryCarousel({ gallery }: GalleryDataProps) {
  const { i18n } = useTranslation();
  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={20}
        slidesPerView={1.5}
        breakpoints={{
          640: { slidesPerView: 2.5 },
          1024: { slidesPerView: 3.5 },
        }}
        freeMode={true}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="w-full overflow-hidden" 
      >
        {gallery.map((item, index) => (
          <SwiperSlide key={index}>
            {/* Slide 容器：pt-20 預留給文字向上放大彈跳的空間 */}
            <div className="group relative pt-20 pb-4 transition-all duration-300">
              
              {/* 1. 圖片框：w-full 確保填滿橫向範圍，aspect-video 鎖定比例 */}
              <div className="relative w-full aspect-video border border-white/10 overflow-hidden bg-black z-10">
                <img 
                  src={`${item.img_path}00.png`} 
                  alt={item.name}
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400?grayscale'; }}
                />
                {/* 常態下的漸層底層 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
              </div>

              {/* 2. 獨立文字浮層：Hover 時變大且帶有「藍框黑底」 */}
              <div className="absolute inset-x-0 bottom-6 px-4 z-20 pointer-events-none transition-all duration-300">
                
                {/* 核心修正：文字放大區塊加入黑底與強烈對比 */}
                <div className="relative p-0 group-hover:p-4 group-hover:bg-black group-hover:border-2 group-hover:border-[#00d4ff] group-hover:translate-y-[-15px] group-hover:shadow-[10px_10px_0px_rgba(0,212,255,0.3)] transition-all duration-300">
                  
                  <p className="text-[9px] text-[#00d4ff] font-mono tracking-[0.3em] font-black mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    COLLECTION_0{index + 1}
                  </p>
                  
                  <h4 className="text-white font-black tracking-tighter uppercase leading-tight font-sans-zh text-sm group-hover:text-2xl group-hover:text-[#00d4ff] transition-all duration-300">
                    {i18n.language === 'zh' ? item.gallery_title_tw : item.gallery_title}
                  </h4>
                  
                  <div className="mt-2 w-0 h-1 bg-[#00d4ff] group-hover:w-full transition-all duration-500 delay-100" />
                </div>
              </div>

              {/* 3. 背景透明墊片：確保 Hover 範圍正確 */}
              <div className="absolute inset-0 z-0" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}