import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer'; // 引入 Hook

import 'swiper/css';
import 'swiper/css/pagination';

interface EventData {
  name: string;
  name_tw: string;
  img_path: string;
}

// 建立一個簡單的 Skeleton 組件
const EventSkeleton = () => (
  <div className="w-full py-12">
    <div className="flex justify-center gap-4 overflow-hidden">
      {/* 模擬 Swiper 的多個卡片佈局 */}
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="aspect-[750/1334] w-[20%] bg-white/5 animate-pulse border border-white/10 shrink-0"
        />
      ))}
    </div>
  </div>
);

export default function EventCarousel({ events }: { events: EventData[] }) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // 使用 Intersection Observer
  const { ref, inView } = useInView({
    triggerOnce: true,   // 載入後就保持，避免重複渲染
    rootMargin: '100px', // 提前一點開始載入
  });

  if (!events || events.length === 0) return null;

  return (
    <div ref={ref} className="min-h-[400px]"> 
      {/* 如果還沒進入視線，顯示 Skeleton */}
      {!inView ? (
        <EventSkeleton />
      ) : (
        <div className="w-full py-12 select-none relative z-10 font-sans-zh animate-in fade-in duration-700">
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
                    
                    <img 
                      src={event.img_path} 
                      alt={event.name} 
                      loading="lazy" // 雙重保險
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isActive ? 'opacity-100 grayscale-0 scale-105' : 'opacity-70 grayscale-[20%]'
                      }`} 
                    />

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start gap-1">
                      <span className={`font-mono text-[9px] px-2 py-0.5 tracking-widest transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#00d4ff] text-black font-black' 
                          : 'bg-transparent text-white/60 font-bold'
                      }`}>
                        ID_0{index + 1}
                      </span>

                      <h3 className={`text-xl md:text-2xl font-black px-2 py-1 tracking-tighter uppercase leading-tight transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#00d4ff] text-black translate-x-0' 
                          : 'bg-transparent text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -translate-x-1'
                      }`}>
                        {isZh ? event.name_tw : event.name}
                      </h3>

                      <div className={`h-[3px] bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.8)] transition-all duration-700 ${
                        isActive ? 'w-full max-w-[120px] opacity-100' : 'w-0 opacity-0'
                      }`} />
                    </div>

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
      )}
    </div>
  );
}