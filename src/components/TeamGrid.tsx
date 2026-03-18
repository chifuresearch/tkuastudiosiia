import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, UserCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface AdvisorData {
  name: string;
  name_tw: string;
  studio_title: string;
  studio_title_tw: string;
  img_path: string;       
  img_paths?: string[];    
  descript: string;
  descript_tw: string;
}

interface TeamGridProps {
  advisors: AdvisorData[];
}

export default function TeamGrid({ advisors }: TeamGridProps) {
  const { i18n } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<AdvisorData | null>(null);
  const isZh = i18n.language === 'zh';

  if (!advisors) return null;

  // 單個老師卡片組件
  const MemberCard = ({ member }: { member: AdvisorData }) => (
    <div 
      onClick={() => setSelectedMember(member)}
      className="group relative flex flex-col border border-white/10 overflow-hidden transition-all duration-500 cursor-pointer aspect-[3/4] bg-black w-full"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={member.img_path} 
          className="w-full h-full object-cover grayscale-0 opacity-1000 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110" 
          alt={member.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
      </div>

      <div className="relative z-10 mt-auto p-6 flex flex-col justify-end transition-all duration-300 bg-black/40 group-hover:bg-[#00d4ff] border-t border-white/5">
        <p className="text-orange-500 font-mono text-[10px] tracking-[0.2em] font-black mb-1 group-hover:text-black transition-colors uppercase">
          {isZh ? member.studio_title_tw : member.studio_title}
        </p>
        <h3 className="text-white text-3xl font-black tracking-tighter uppercase transition-all duration-300 group-hover:text-black group-hover:scale-105 origin-left">
          {isZh ? member.name_tw : member.name}
        </h3>
        <div className="h-0.5 w-0 bg-black group-hover:w-full transition-all duration-500 mt-2" />
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Mobile 視角：Carousel 置中表現 */}
      <div className="block sm:hidden px-4">
        <Swiper
          modules={[EffectCoverflow, Pagination]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1.2}
          spaceBetween={20}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          className="w-full pb-12"
        >
          {advisors.map((member, idx) => (
            <SwiperSlide key={`mob-teacher-${idx}`}>
              <MemberCard member={member} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop 視角：標準 Grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-5 border-l border-t border-white/10">
        {advisors.map((member, idx) => (
          <MemberCard key={`desk-teacher-${idx}`} member={member} />
        ))}
      </div>

      {/* 詳細資料彈窗 (Modal) */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl">
          <div className="relative flex flex-col md:flex-row bg-[#111] border border-white/10 w-full max-w-6xl h-[90vh] md:h-[80vh] overflow-hidden shadow-2xl">
            <button 
              onClick={() => setSelectedMember(null)} 
              className="absolute top-4 right-4 z-[110] text-white hover:text-[#00d4ff] bg-black/50 p-2 rounded-full transition-all"
            >
              <X size={32} />
            </button>
            
            {/* 左側照片輪播 */}
            <div className="flex-grow bg-black relative border-r border-white/10 min-h-[300px]">
              <Swiper 
                modules={[Autoplay, Navigation, Pagination]} 
                autoplay={{ delay: 4000 }} 
                loop={advisors.length > 1}
                navigation={true} 
                pagination={{ clickable: true }} 
                className="h-full w-full"
              >
                <SwiperSlide>
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={selectedMember.img_path} className="h-full w-full object-cover" alt="Primary" />
                  </div>
                </SwiperSlide>
                {selectedMember.img_paths?.map((path, i) => (
                  <SwiperSlide key={i}>
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={path} className="h-full w-auto object-contain" alt={`Work ${i}`} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 右側文字資訊 */}
            <div className="w-full md:w-[450px] p-8 md:p-12 bg-[#111] flex flex-col shrink-0">
              <div className="mb-8 border-b border-[#00d4ff]/30 pb-6 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle size={16} className="text-orange-500" />
                  <span className="text-gray-400 font-mono text-xs uppercase tracking-widest italic">
                    {isZh ? selectedMember.studio_title_tw : selectedMember.studio_title}
                  </span>
                </div>
                <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase font-sans-zh">
                  {isZh ? selectedMember.name_tw : selectedMember.name}
                </h2>
              </div>
              
              <div className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#00d4ff] scrollbar-track-transparent">
                <div className="flex gap-4">
                  <div className="mt-1 text-[#00d4ff] shrink-0"><FileText size={20} /></div>
                  <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-light text-justify font-sans-zh">
                    {isZh ? selectedMember.descript_tw : selectedMember.descript}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}