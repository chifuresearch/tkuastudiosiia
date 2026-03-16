import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Info, Target, Cpu } from 'lucide-react';

interface AboutData {
  title: string;
  subtitle: string;
  title_tw: string;
  subtitle_tw: string;
  content_a: string[];
  content_a_tw: string[];
  content_b: string[];
  content_b_tw: string[];
  content_c: string[];
  content_c_tw: string[];
  title_2: string;
  subtitle_2: string;
  title_2_tw: string;
  subtitle_2_tw: string;
  content_2: string[];
  content_2_tw: string[];
}

interface AboutDataProps {
  abouts: AboutData | null;
}

// ... 前面介面定義不變 ...

export default function AboutSection({ abouts }: AboutDataProps) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const isZh = i18n.language === 'zh';

  if (!abouts) return null;

  const tabs = [
    { label: isZh ? abouts.content_a_tw[0] : abouts.content_a[0], text: isZh ? abouts.content_a_tw[1] : abouts.content_a[1], icon: <Info size={16} /> },
    { label: isZh ? abouts.content_b_tw[0] : abouts.content_b[0], text: isZh ? abouts.content_b_tw[1] : abouts.content_b[1], icon: <Target size={16} /> },
    { label: isZh ? abouts.content_c_tw[0] : abouts.content_c[0], text: isZh ? abouts.content_c_tw[1] : abouts.content_c[1], icon: <Cpu size={16} /> }
  ];

  return (
    <div className="relative z-[5] py-24 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        
        {/* 第一部分：圖文雙欄 (保持您喜歡的架構) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-40 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-orange-300 font-mono text-[12px] tracking-[0.4em] uppercase opacity-80">/ {isZh ? abouts.subtitle_tw : abouts.subtitle}</h4>
              <h2 className="text-5xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] section-title__highlight"
                dangerouslySetInnerHTML={{ __html: isZh ? abouts.title_tw : abouts.title }} />
            </div>

            <div className="space-y-2 pt-6">
              {tabs.map((tab, idx) => (
                <div key={idx} onMouseEnter={() => setActiveTab(idx)}
                  /* 修正：Hover 變藍底黑字，提升層級 Z:20 */
                  className={`group transition-all duration-200 border relative ${
                    activeTab === idx 
                    ? 'lift-active translate-x-4 scale-[1.02] z-[20]' 
                    : 'bg-black/60 border-white/10 opacity-60'
                  }`}
                  style={{ borderRadius: '0px' }}>
                  
                  <div className={`flex items-center gap-4 p-4 ${activeTab === idx ? 'text-black' : 'text-gray-400'}`}>
                    <span className={activeTab === idx ? 'text-black' : 'text-blue-400'}>{tab.icon}</span>
                    <h3 className={`tracking-widest uppercase font-mono font-black transition-all ${activeTab === idx ? 'text-3xl' : 'text-[11px]'}`}>
                      {tab.label.replace(/<[^>]*>?/gm, '')}
                    </h3>
                  </div>
                  
                  {activeTab === idx && (
                    <div className="px-4 pb-6 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-black text-xl md:text-2xl font-black leading-tight text-justify font-mono border-t-2 border-black pt-4"
                        dangerouslySetInnerHTML={{ __html: tab.text }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative pt-12">
            <div className="relative aspect-[4/3] border border-white/20 overflow-hidden" style={{ borderRadius: '0px' }}>
              <img src="assets/img/about/ab_00_l.png" className="w-full h-full object-cover grayscale opacity-50" alt="" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-1/2 aspect-video border-2 border-orange-500 bg-black z-[30]">
              <img src="assets/img/about/ab_00_s.png" className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>

        {/* 第二部分：Informational Hub (上文下圖格線化) */}
        <div className="border-t border-white/20 pt-20">
          <div className="mb-10 text-right">
            <h3 className="text-orange-300 font-mono text-[12px] tracking-[0.4em] uppercase opacity-80">/ {isZh ? abouts.subtitle_2_tw : abouts.subtitle_2}</h3>
            <h2 className="text-5xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.0]"
              dangerouslySetInnerHTML={{ __html: isZh ? abouts.title_2_tw : abouts.title_2 }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-white/10">
            {(isZh ? abouts.content_2_tw : abouts.content_2).map((item, idx) => (
              <div key={idx} 
                className="group border-r border-b border-white/10 transition-all relative flex flex-col overflow-hidden">
                
                {/* 上欄：文字區塊 (Hover 變藍底黑字放大) */}
                <div className="p-8 h-[250px] flex flex-col justify-between transition-all duration-300 group-hover:bg-[#00d4ff] group-hover:z-[20] group-hover:relative">
                  <span className="text-orange-500 font-mono text-xs group-hover:text-black font-bold">DATA_ENTRY_0{idx+1}</span>
                  <p className="text-gray-400 text-sm font-bold font-mono group-hover:text-black group-hover:text-2xl transition-all leading-tight">
                    {item}
                  </p>
                  <ChevronRight size={16} className="text-orange-500 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
                </div>

                {/* 下欄：圖形區塊 (固定高度，保持雜訊感) */}
                <div className="h-[150px] border-t border-white/10 bg-black overflow-hidden">
                   <img 
                     src={`assets/img/about/ab_01_${idx === 0 ? 'l' : 's'}.png`} 
                     className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-100 transition-all duration-700" 
                     alt="" 
                   />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}