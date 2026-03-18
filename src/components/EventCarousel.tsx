import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

import 'swiper/css';
import 'swiper/css/pagination';

interface EventData {
  name: string;
  name_tw: string;
  img_path: string;
}

export default function EventCarousel({ events }: { events: EventData[] }) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  if (!events || events.length === 0) return null;

  return (
    <div className="w-full py-12 select-none relative z-10 font-sans-zh">
      <Swiper
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1.5}
        spaceBetween={15}
        loop={events.length > 5}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ 
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !bg-orange-600 !w-6 !h-0.5 !rounded-none"></span>`;
          }
        }}
        modules={[Pagination, Autoplay]}
        className="event-swiper !pb-16"
        breakpoints={{
          1024: { slidesPerView: 5 }
        }}
      >
        {events.map((event, index) => (
          <SwiperSlide key={index}> 
            {({ isActive }) => (
              <div className={`relative transition-all duration-500 border aspect-[750/1334] overflow-hidden ${
                isActive 
                  ? 'border-[#00d4ff] z-20 shadow-[0_0_25px_rgba(0,212,255,0.4)]' 
                  : 'border-white/5 z-10'
              }`}>
                
                {/* 1. 圖片層：Active 完全清楚，非 Active 保持 0.7 透明度 */}
                <img 
                  src={event.img_path} 
                  alt={event.name} 
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isActive ? 'opacity-100 grayscale-0 scale-105' : 'opacity-70 grayscale-[20%]'
                  }`} 
                />

                {/* 2. 文字資訊區 */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start gap-1">
                  
                  {/* 編號：Active 時有藍底黑字，非 Active 僅白字 */}
                  <span className={`font-mono text-[9px] px-2 py-0.5 tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#00d4ff] text-black font-black' 
                      : 'bg-transparent text-white/60 font-bold'
                  }`}>
                    ID_0{index + 1}
                  </span>

                  {/* 標題：Active 時有藍底黑字，非 Active 僅白字並帶陰影 */}
                  <h3 className={`text-xl md:text-2xl font-black px-2 py-1 tracking-tighter uppercase leading-tight transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#00d4ff] text-black translate-x-0' 
                      : 'bg-transparent text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -translate-x-1'
                  }`}>
                    {isZh ? event.name_tw : event.name}
                  </h3>

                  {/* 橘色飾線：只有 Active 時完整展開 */}
                  <div className={`h-[3px] bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.8)] transition-all duration-700 ${
                    isActive ? 'w-full max-w-[120px] opacity-100' : 'w-0 opacity-0'
                  }`} />
                </div>

                {/* 裝飾性掃描線：僅非 Active Slide 覆蓋 */}
                {!isActive && (
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
                )}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .event-swiper .swiper-pagination-bullet-active {
            width: 2.5rem !important;
            transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}