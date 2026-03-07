import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

// 樣式匯入（請確保 env.d.ts 已宣告這些模組）
import 'swiper/css';
import 'swiper/css/free-mode';

interface GalleryItem {
  name: string;
  name_tw: string;
  gallery_title: string;
  gallery_title_tw: string;
  img_path: string; // 來自 JSON 的資料夾路徑
}

export default function GalleryCarousel() {
  const { i18n } = useTranslation();
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(payload => {
        // 取得 JSON 中的 gallery 資料
        setGalleryData(payload.data.gallery);
      });
  }, []);

  return (
    <div className="w-full py-20 bg-black/10 backdrop-blur-sm">
      <Swiper
        loop={true}
        freeMode={true}
        speed={6000} // 數值越大越平滑，達成連續長條感
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        slidesPerView={2}
        spaceBetween={15}
        modules={[Autoplay, FreeMode]}
        breakpoints={{
          // 電腦端顯示 5.5 張，讓邊緣露出半張增加連續感
          1024: { slidesPerView: 5.5, spaceBetween: 25 }
        }}
        className="gallery-continuous-swiper"
      >
        {galleryData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="group relative aspect-square overflow-hidden border border-white/10 hover:border-blue-500 transition-all duration-500">
              
              {/* 核心修正：自動在資料夾路徑後加上 00.png */}
              <img 
                src={`${item.img_path}00.png`} 
                alt={item.name}
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                // 容錯處理：如果 00.png 不存在，嘗試載入 1.jpg 或預設圖
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/600/600?grayscale'; }}
              />

              {/* 懸浮文字遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[10px] text-blue-400 font-mono tracking-widest mb-1">COLLECTION_LOG</p>
                <h4 className="text-white text-sm font-bold tracking-tighter uppercase leading-tight">
                  {i18n.language === 'zh' ? item.gallery_title_tw : item.gallery_title}
                </h4>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* 確保 Vite 8 處理下的連續滾動真正勻速 */
        .gallery-continuous-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </div>
  );
}