import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

const MOCK_DATA = Array.from({ length: 12 }, (_, i) => ({ id: i, title: `NODE_${i}` }));

export default function ProjectSection() {
  return (
    <>
      {/* Desktop View: 6-Column Grid */}
      <div className="hidden lg:grid grid-cols-6 gap-4">
        {MOCK_DATA.map(item => (
          <div key={item.id} className="aspect-square border border-white/10 hover:border-blue-500 transition-all p-4 bg-white/5 flex flex-col justify-end">
            <span className="text-[10px] text-blue-400">#00{item.id}</span>
            <div className="font-bold">{item.title}</div>
          </div>
        ))}
      </div>

      {/* Mobile View: Full-Screen Carousel */}
      <div className="lg:hidden h-[60vh]">
        <Swiper spaceBetween={10} slidesPerView={1}>
          {MOCK_DATA.map(item => (
            <SwiperSlide key={item.id}>
              <div className="w-full h-full bg-gradient-to-t from-blue-900/40 to-transparent border border-white/20 rounded-3xl p-8 flex flex-col justify-end">
                <h3 className="text-4xl font-bold">{item.title}</h3>
                <p className="text-gray-400 mt-4">Research Data Stream...</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}