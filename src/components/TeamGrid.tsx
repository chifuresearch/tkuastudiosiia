import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

// ... 前面 import 與 AdvisorData 定義保持不變 ...

// ... 前面 import 與 AdvisorData 定義保持不變 ...

export default function TeamGrid({ advisors }: TeamGridProps) {
  const { i18n } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<AdvisorData | null>(null);
  const isZh = i18n.language === 'zh';

  if (!advisors) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-white/10 relative z-10 font-sans-zh">
      {/* 1. 外層格位列表 (保持原本的暴力美學與進度條邏輯) */}
      {advisors.map((member, idx) => (
        <div key={idx} onClick={() => setSelectedMember(member)} className="group relative flex flex-col border-r border-b border-white/10 overflow-hidden transition-all duration-300 hover:z-30 cursor-pointer h-full bg-black">
          {/* ... 格位內部代碼保持不變 ... */}
          <div className="relative flex-grow overflow-hidden min-h-[350px]">
            <img src={member.img_path} className="w-full h-full object-cover grayscale opacity-30 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110" alt="" />
          </div>
          <div className="p-5 flex flex-col gap-3 transition-all duration-300 bg-black/60 group-hover:bg-[#00d4ff] min-h-[150px] border-t border-white/10">
             {/* 這裡保留您滿意的名字與橘色進度條代碼 */}
             <div className="flex justify-between items-end">
               <h3 className={`text-white transition-all duration-300 group-hover:text-black font-black ${isZh ? 'text-3xl group-hover:text-5xl' : 'text-xl group-hover:text-3xl font-mono'}`}>{isZh ? member.name_tw : member.name}</h3>
             </div>
             <div className="flex flex-col gap-2 mt-2">
                <div className="h-[2px] w-full bg-white/10 group-hover:bg-black/10 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-0 bg-orange-600 group-hover:w-full transition-all duration-700 delay-150" />
                </div>
                <p className="text-gray-600 text-[10px] group-hover:text-orange-600 group-hover:text-[13px] font-mono font-black italic self-end transition-all delay-500 group-hover:bg-black group-hover:px-2 py-0.5">{isZh ? member.studio_title_tw : member.studio_title}</p>
             </div>
          </div>
        </div>
      ))}

      {/* --- MODAL 彈出視窗：等比例縮放修正 --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md">
          {/* 容器改為 max-content 確保不會強迫拉寬 */}
          <div className="relative flex flex-col md:flex-row bg-[#111] border border-white/10 max-w-[75vw] max-h-[90vh] overflow-hidden shadow-2xl">
            
            <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 z-[110] text-white hover:text-[#00d4ff] bg-black/50 p-2 rounded-full"><X size={32} /></button>

            {/* 左側輪播區：關鍵修正 */}
            {/* 1. 使用 flex-1 並配合 min-w-0 讓它根據圖片寬度彈性調整 
                2. h-[400px] md:h-auto 確保高度固定於 Modal 內 */}
            <div className="flex-1 bg-black relative border-r border-white/10 min-w-0">
              <Swiper modules={[Autoplay, Navigation, Pagination]} autoplay={{ delay: 3500 }} loop={true} navigation={true} pagination={{ clickable: true }} className="h-full w-full">
                <SwiperSlide>
                  <div className="w-full h-full flex items-center justify-center">
                    {/* object-contain 確保不裁切，h-full 確保高度填滿 */}
                    <img src={selectedMember.img_path} className="h-full w-auto object-contain mx-auto" alt="Main" />
                  </div>
                </SwiperSlide>

                {selectedMember.img_paths && selectedMember.img_paths.map((fullPath, i) => (
                  <SwiperSlide key={i}>
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={fullPath} className="h-full w-auto object-contain mx-auto" alt="Work" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 右側文字區：寬度固定 (w-[450px])，確保位置不動 */}
            <div className="w-full md:w-[450px] p-8 md:p-12 overflow-y-auto bg-[#111] shrink-0">
              <div className="mb-8 border-b border-[#00d4ff]/30 pb-6">
                <h2 className="text-5xl font-black text-white mb-1 tracking-tighter uppercase">{isZh ? selectedMember.name_tw : selectedMember.name}</h2>
                <p className="text-orange-600 font-bold tracking-widest uppercase text-sm italic">{isZh ? selectedMember.studio_title_tw : selectedMember.studio_title}</p>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-[#00d4ff]"><FileText size={20} /></div>
                <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-light text-justify font-sans-zh">
                  {isZh ? selectedMember.descript_tw : selectedMember.descript}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}