import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs, Controller } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import type { Swiper as SwiperType } from 'swiper';

// 樣式匯入
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

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

export default function GalleryCarousel({ gallery }: GalleryDataProps) {
  const { i18n } = useTranslation();
  
  // 儲存縮圖 Swiper 實例，用於同步
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* 1. Desktop 模式布局 (sm以上螢幕): 左側縮圖, 右側大圖 */}
      <div className="hidden sm:flex gap-6 h-[70vh] items-stretch">
        
        {/* 左側 18% 縮圖捲動列 */}
        <div className="w-[18%] shrink-0 h-full border-r border-white/10 pr-4">
          <Swiper
            onSwiper={setThumbsSwiper}
            direction="vertical"
            spaceBetween={10}
            slidesPerView={5}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="h-full thumbs-swiper"
          >
            {gallery.map((item, index) => (
              <SwiperSlide key={`thumb-${index}`} className="cursor-pointer group">
                {/* 縮圖容器：預設 grayscale，選取時還原 */}
                <div className="relative w-full aspect-[4/3] border-2 border-transparent overflow-hidden group-[.swiper-slide-thumb-active]:border-orange-500 group-[.swiper-slide-thumb-active]:shadow-[0_0_15px_rgba(234,88,12,0.6)] transition-all duration-300">
                  <img 
                    src={`${item.img_path}00.png`} 
                    alt={`Thumb ${index}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-[.swiper-slide-thumb-active]:grayscale-0 opacity-60 group-hover:opacity-100 group-[.swiper-slide-thumb-active]:opacity-100 transition-all duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale'; }}
                  />
                  {/* 選取時的橘色遮罩 */}
                  <div className="absolute inset-0 bg-orange-950/30 opacity-0 group-[.swiper-slide-thumb-active]:opacity-100 transition-opacity" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 右側大圖顯示區 */}
        <div className="flex-grow h-full border border-white/10 bg-black overflow-hidden relative">
          <Swiper
            style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' } as React.CSSProperties}
            spaceBetween={10}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="h-full main-swiper"
          >
            {gallery.map((item, index) => (
              <SwiperSlide key={`main-${index}`}>
                <div className="relative w-full h-full">
                  {/* 大圖：還原原色 */}
                  <img 
                    src={`${item.img_path}00.png`} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/900'; }}
                  />
                  {/* 文字浮層優化 */}
                  <div className="absolute inset-x-0 bottom-0 px-8 py-6 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-[11px] text-orange-500 font-mono tracking-[0.2em] font-black mb-1.5 uppercase">
                      Moments / 0{index + 1}
                    </p>
                    <h4 className="text-white font-black tracking-tighter uppercase leading-tight font-sans-zh text-4xl">
                      {i18n.language === 'zh' ? item.gallery_title_tw : item.gallery_title}
                    </h4>
                    <div className="mt-3 w-32 h-1 bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* 2. Mobile 模式 (sm以下螢幕): 單排 Carousel, 還原原色 */}
      <div className="block sm:hidden px-4">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={15}
          slidesPerView={1.2} // 露出一點下一張
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="w-full pb-8" 
        >
          {gallery.map((item, index) => (
            <SwiperSlide key={`mob-${index}`}>
              <div className="group relative transition-all duration-300">
                {/* 圖片框：移除 grayscale, 使用 aspect-[3/4] 強化手機視覺 */}
                <div className="relative w-full aspect-[3/4] border border-white/10 overflow-hidden bg-black z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <img 
                    src={`${item.img_path}00.png`} 
                    alt={item.name}
                    className="w-full h-full object-cover grayscale-0 opacity-100 scale-100 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/600/800'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90" />
                </div>

                {/* 文字浮層 */}
                <div className="absolute inset-x-0 bottom-6 px-5 z-20 pointer-events-none transition-all duration-300">
                  <div className="relative p-0 group-hover:p-5 group-hover:bg-black group-hover:border-2 group-hover:border-[#00d4ff] group-hover:translate-y-[-10px] transition-all duration-300">
                    <p className="text-[10px] text-orange-500 font-mono tracking-[0.2em] font-black mb-1.5 uppercase">
                      Moments / 0{index + 1}
                    </p>
                    <h4 className="text-white font-black tracking-tighter uppercase leading-tight font-sans-zh text-xl group-hover:text-2xl group-hover:text-[#00d4ff] transition-all duration-300">
                      {i18n.language === 'zh' ? item.gallery_title_tw : item.gallery_title}
                    </h4>
                    <div className="mt-2 w-0 h-1 bg-[#00d4ff] group-hover:w-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 自定義縮圖選取樣式 */}
      <style>{`
        .thumbs-swiper .swiper-slide-thumb-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}