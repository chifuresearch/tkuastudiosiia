import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Briefcase, FileText } from 'lucide-react'; // 推薦安裝 lucide-react

interface Advisor {
  type: number;
  name: string;
  name_tw: string;
  studio_title: string;
  studio_title_tw: string;
  img_path: string;
  descript: string;
  descript_tw: string;
}

export default function TeamGrid() {
  const { i18n } = useTranslation();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedMember, setSelectedMember] = useState<Advisor | null>(null);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(payload => setAdvisors(payload.data.advisors))
      .catch(err => console.error("載入導師資料失敗:", err));
  }, []);

  return (
    <div className="w-full py-12 px-8 lg:px-16">
        {/* 1. 增加網格間距：從 gap-px 改為 gap-8 或 gap-12 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6">
        {advisors.map((member, idx) => (
            <div 
            key={idx}
            onClick={() => setSelectedMember(member)}
            className="group relative cursor-pointer"
            >
            {/* 2. 增加裝飾性外框與內距，創造模型展示感 */}
            <div className="relative aspect-[3/4] bg-white/2 border border-white/10 p-0.5 group-hover:border-blue-500/50 transition-all duration-500">
                
                {/* 3. 圖片容器限制，確保圖片不直接貼邊 */}
                <div className="w-full h-full overflow-hidden bg-black">
                <img 
                    src={member.img_path} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                    loading="lazy"
                    decoding="async"
                />
                </div>

                {/* 4. 懸停時的細線裝飾 */}
                <div className="absolute inset-[-4px] border border-blue-500/0 group-hover:border-blue-500/20 transition-all duration-700 pointer-events-none" />
            </div>

            {/* 5. 文字改到圖片下方，增加排版層次感 */}
            <div className="mt-4 space-y-1">
                <p className="text-[10px] text-blue-500 font-mono tracking-[0.2em] uppercase truncate">
                {isZh ? member.studio_title_tw : member.studio_title}
                </p>
                <h4 className="text-white font-bold text-xs tracking-widest uppercase">
                {isZh ? member.name_tw : member.name}
                </h4>
            </div>
            </div>
        ))}
        </div>

      {/* 詳細資訊彈窗 (Modal) */}
      {selectedMember && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          {/* 背景模糊遮罩 */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={() => setSelectedMember(null)}
          />
          
          <div className="relative w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* 關閉按鈕 */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* 左側：大圖 */}
            <div className="w-full md:w-2/5 aspect-[3/4] bg-black">
              <img src={selectedMember.img_path} className="w-full h-full object-cover" alt="" />
            </div>

            {/* 右側：詳細文字 */}
            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[70vh] md:max-h-full">
              <div className="mb-8">
                <span className="text-blue-500 font-mono text-xs tracking-[0.3em]">/ STUDIO_ADVISOR</span>
                <h3 className="text-4xl font-black text-white mt-2 mb-1 tracking-tighter uppercase">
                  {isZh ? selectedMember.name_tw : selectedMember.name}
                </h3>
                <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">
                  {isZh ? selectedMember.studio_title_tw : selectedMember.studio_title}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><FileText size={18} /></div>
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-light text-justify">
                    {isZh ? selectedMember.descript_tw : selectedMember.descript}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-[10px] font-bold tracking-widest transition-all">
                   VIEW PORTFOLIO
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}