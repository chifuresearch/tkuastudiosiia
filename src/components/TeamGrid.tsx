import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, UserCircle, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface AdvisorData {
  id: number;
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
  advisors: Omit<AdvisorData, 'id'>[]; 
}

export default function TeamGrid({ advisors: rawAdvisors }: TeamGridProps) {
  const { i18n } = useTranslation();
  const advisors = rawAdvisors.map((adj, index) => ({ ...adj, id: index }));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // 修正點：使用一個專門鎖定 Carousel 實體的 Ref
  const carouselRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    if (selectedId !== null) {
      // 增加延遲確保展開動畫完成，高度計算才會精確
      const timer = setTimeout(() => {
        const element = carouselRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewHeight = window.innerHeight;
          
          // 計算 Carousel 中心點與視窗中心點的差值
          const targetScrollPos = window.pageYOffset + rect.top + (rect.height / 2) - (viewHeight / 2);
          
          window.scrollTo({
            top: targetScrollPos,
            behavior: 'smooth'
          });
        }
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  if (!advisors.length) return null;
  const selectedMember = advisors.find(m => m.id === selectedId);

  const chunkArray = (arr: AdvisorData[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const InlineDetailView = ({ member }: { member: AdvisorData }) => (
    <div className="col-span-full w-full bg-[#0a0a0a] border-y border-[#00d4ff]/30 my-6 overflow-hidden animate-expand-vertical">
      <div className="relative flex flex-col md:flex-row min-h-[500px] md:h-[65vh]">
        <button 
          onClick={() => setSelectedId(null)} 
          className="absolute top-4 right-4 z-[50] text-white/50 hover:text-[#00d4ff] p-2 bg-black/40 rounded-full"
        >
          <X size={28} />
        </button>
        
        {/* 修正點：將 Ref 綁定在 Swiper 容器上，確保計算的是圖片的中線 */}
        <div ref={carouselRef} className="w-full md:w-3/5 bg-black border-r border-white/5 h-[350px] md:h-full">
          <Swiper 
            modules={[Autoplay, Navigation, Pagination]} 
            autoplay={{ delay: 4000 }} 
            loop={(member.img_paths?.length ?? 0) > 0}
            navigation pagination={{ clickable: true }}
            className="h-full w-full"
          >
            <SwiperSlide>
              <img src={member.img_path} className="h-full w-full object-cover" alt="Main" />
            </SwiperSlide>
            {member.img_paths?.map((path, i) => (
              <SwiperSlide key={i}>
                <img src={path} className="h-full w-full object-contain bg-black" alt={`Work ${i}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-[#080808]">
          <div className="mb-6 border-b border-[#00d4ff]/20 pb-6">
            <div className="flex items-center gap-2 mb-2 text-orange-500 font-mono text-xs uppercase">
              <UserCircle size={14} />
              {isZh ? member.studio_title_tw : member.studio_title}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
              {isZh ? member.name_tw : member.name}
            </h2>
          </div>
          <div className="flex gap-4 border-t border-white/10 pt-6">
            <FileText size={20} className="text-[#00d4ff] shrink-0 mt-1" />
            <div className="text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light text-justify">
              {isZh ? member.descript_tw : member.descript}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MemberCard = ({ member }: { member: AdvisorData }) => {
    const isActive = selectedId === member.id;
    return (
      <div 
        onClick={() => setSelectedId(isActive ? null : member.id)}
        className={`group relative aspect-[3/4] cursor-pointer overflow-hidden border transition-all duration-500 
          ${isActive ? 'border-[#00d4ff] scale-[0.98]' : 'border-white/10 hover:border-white/40'}`}
      >
        <img 
          src={member.img_path} 
          className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'scale-105' : 'grayscale group-hover:grayscale-0'}`} 
          alt={member.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className={`absolute inset-x-0 bottom-0 p-6 transition-all ${isActive ? 'bg-[#00d4ff] text-black' : 'bg-black/20 text-white group-hover:bg-[#00d4ff] group-hover:text-black'}`}>
          <p className="text-[10px] font-mono tracking-widest mb-1 opacity-80 uppercase">
            {isZh ? member.studio_title_tw : member.studio_title}
          </p>
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            {isZh ? member.name_tw : member.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="py-10 bg-black overflow-hidden">
      {/* Mobile */}
      <div className="block sm:hidden px-4 space-y-4">
        {advisors.map((member) => (
          <div key={`mob-${member.id}`}>
            <MemberCard member={member} />
            {selectedId === member.id && <InlineDetailView member={member} />}
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-5 gap-4 px-4">
        {chunkArray(advisors, 5).map((row, rowIndex) => {
          const hasSelectedInRow = row.some(m => m.id === selectedId);
          return (
            <div key={`row-${rowIndex}`} className="contents">
              {row.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {hasSelectedInRow && selectedMember && (
                <InlineDetailView member={selectedMember} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}