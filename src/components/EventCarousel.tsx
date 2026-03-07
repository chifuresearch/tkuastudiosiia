import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

// 引入 Swiper 樣式
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface EventData {
  name: string;
  name_tw: string;
  img_path: string;
}

export default function EventCarousel() {
  const { i18n } = useTranslation();
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    // 1. 建立 AbortController 以避免組件卸載時的連線衝突
    const controller = new AbortController();
    const signal = controller.signal;

    fetch('/data.json', { signal })
      .then((res) => res.json())
      .then((payload) => {
        setEvents(payload.data.events);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted to prevent conflict');
        } else {
          console.error("抓取 Event 資料失敗:", err);
        }
      });

    // 清理函數：當組件重新渲染或卸載時中止請求
    return () => controller.abort();
  }, []);

  if (events.length === 0) return <div className="text-white text-center py-20 font-mono animate-pulse">LOADING_DATA...</div>;

  return (
    <div className="w-full py-10 select-none">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        // 2. 修正為奇數 (3)，確保中間最亮且不偏心
        slidesPerView={1.5} 
        loop={events.length > 3}
        // 3. 穩定化參數：關閉自動預載，減少請求衝突
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="event-swiper"
        breakpoints={{
          320: { slidesPerView: 1.2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 0 } 
        }}
      >
        {events.map((event, index) => (
          <SwiperSlide key={index} className="max-w-[450px]"> 
            {({ isActive }) => (
              <div className={`relative transition-all duration-700 rounded-2xl overflow-hidden border ${
                isActive 
                  ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-100' 
                  : 'border-white/5 opacity-80 scale-90'
              }`}>
                
                <div className="relative w-full aspect-[814/1439] bg-black/20">
                  <img 
                    src={event.img_path} 
                    alt={event.name} 
                    // 4. 效能優化：延遲載入與非同步解碼
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-contain transition-all duration-1000 ${
                      isActive ? 'grayscale-0' : 'grayscale-[40%] blur-[0.5px]'
                    }`} 
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                    {i18n.language === 'zh' ? event.name_tw : event.name}
                  </h3>
                  <div className={`h-1 bg-blue-500 mt-3 transition-all duration-1000 ${isActive ? 'w-full' : 'w-0'}`} />
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* 控制整體反差平滑度 */
        .event-swiper .swiper-slide {
            transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            transform: scale(0.95);
        }

        .event-swiper .swiper-slide-active {
            z-index: 10;
            transform: scale(1);
        }

        /* 調整兩側對稱性 */
        .event-swiper .swiper-slide-next,
        .event-swiper .swiper-slide-prev {
            opacity: 0.9;
            transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}