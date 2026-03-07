import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { useEffect, useState } from 'react';

interface ProjectData {
  id: number;
  title: string;
  desc: string;
}

export default function Carousel() {
  const [data, setData] = useState<ProjectData[]>([]);

  // 讀取由 Python 生成的 JSON 資料
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => setData([
        { id: 1, title: "等待 Python 更新...", desc: "請執行 update_data.py" }
      ]));
  }, []);

  return (
    <div className="w-full py-10">
      <Swiper
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{ 768: { slidesPerView: 3.2 } }}
        className="cursor-grab active:cursor-grabbing"
      >
        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl h-64 flex flex-col justify-end hover:border-blue-500/50 transition-all group">
              <div className="text-blue-500 text-xs font-mono mb-2 uppercase">Node_{item.id}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
              <div className="mt-4 w-0 group-hover:w-full h-1 bg-blue-500 transition-all duration-500" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}