import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Info, Target, Cpu } from 'lucide-react';

// --- 子組件 A：上半部 (保持 Desktop，修正 Mobile 對齊與比例) ---
export function AboutHero({ abouts }: { abouts: any }) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0); 
  const isZh = i18n.language === 'zh';

  if (!abouts) return null;

  const titleText = {
    zh: { main: "建築設計", highlight: "教學研究室", end: "計畫" },
    en: { main: "ARCH", highlight: "STUDIO", end: "PROJECT" }
  };

  const tabs = [
    { label: isZh ? abouts.content_a_tw[0] : abouts.content_a[0], text: isZh ? abouts.content_a_tw[1] : abouts.content_a[1], icon: <Info size={16} /> },
    { label: isZh ? abouts.content_b_tw[0] : abouts.content_b[0], text: isZh ? abouts.content_b_tw[1] : abouts.content_b[1], icon: <Target size={16} /> },
    { label: isZh ? abouts.content_c_tw[0] : abouts.content_c[0], text: isZh ? abouts.content_c_tw[1] : abouts.content_c[1], icon: <Cpu size={16} /> }
  ];

  return (
    // Mobile 使用 px-6 對齊 EventCarousel，Desktop 恢復 px-28
    // h-[100dvh] 確保手機端一屏顯示一個段落
    <div className="font-sans-zh relative z-[5] w-full px-6 md:px-28 h-auto md:h-auto min-h-[90dvh] md:min-h-0 flex flex-col justify-center py-10 md:py-0">
      
      {/* 1. 標題區 */}
      <section className="pt-0 pb-6 md:pb-12 w-full"> 
        <div className="w-full">
          <h4 className="text-white font-mono text-[10px] md:text-[12px] tracking-[0.5em] uppercase mb-1 opacity-80 pl-1">
            / {isZh ? "淡江大學建築學系" : "TAMKANG UNIVERSITY"}
          </h4>
          {/* Mobile 使用較小字級確保不換行太嚴重 */}
          <h2 className="flex flex-wrap items-baseline gap-x-2 md:gap-x-4 text-white uppercase font-black tracking-tighter leading-none w-full">
            <span className="text-4xl md:text-7xl">{isZh ? titleText.zh.main : titleText.en.main}</span>
            <span className="text-4xl md:text-7xl text-orange-600">{isZh ? titleText.zh.highlight : titleText.en.highlight}</span>
            <span className="text-4xl md:text-7xl">{isZh ? titleText.zh.end : titleText.en.end}</span>
          </h2>
        </div>
      </section>

      {/* 2. 內容區 */}
      <section className="pt-2 md:pt-4 w-full"> 
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
          
          <div className="md:col-span-5 space-y-3 md:space-y-4">
            {tabs.map((tab, idx) => (
              <div key={idx} 
                onClick={() => setActiveTab(idx)} // Mobile 支援點擊切換
                onMouseEnter={() => setActiveTab(idx)}
                className={`transition-all duration-300 border cursor-pointer backdrop-blur-md ${
                  activeTab === idx 
                  ? 'bg-[#00d4ff] border-[#00d4ff] text-black z-20 relative' 
                  : 'bg-black/20 border-white/10 text-gray-400 opacity-60'
                }`}
                style={{ borderRadius: '0px' }}>
                
                <div className={`flex items-center gap-3 md:gap-4 p-3 md:p-5 ${activeTab === idx ? 'text-black' : 'text-gray-400'}`}>
                  <div className="flex items-center gap-4">
                    <span className={activeTab === idx ? 'text-black' : 'text-orange-500'}>{tab.icon}</span>
                    <h3 className={`tracking-widest uppercase font-black transition-all text-lg md:text-2xl`}>
                      {tab.label.replace(/<[^>]*>?/gm, '')}
                    </h3>
                  </div>
                </div>
                
                {activeTab === idx && (
                  <div className="px-4 md:px-5 pb-5 md:pb-8 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-black text-sm md:text-2xl font-black leading-tight border-t border-black/20 pt-3 md:pt-4"
                      dangerouslySetInnerHTML={{ __html: tab.text }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="md:col-span-7 relative">
            {/* Mobile 調整 aspect-ratio 節省空間，確保能在一屏顯示 */}
            <div className="relative aspect-video md:aspect-[4/3] border border-white/20 overflow-hidden" style={{ borderRadius: '0px' }}>
              <img src={`${import.meta.env.BASE_URL}assets/img/about/ab_00.png`} className="w-full h-full object-cover grayscale opacity-40 hover:opacity-100 transition-all duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- 子組件 B：下半部 (保持 Desktop，修正 Mobile 對齊與比例) ---
export function AboutHub({ abouts }: { abouts: any }) {
  const { i18n } = useTranslation();
  const [activeCard, setActiveCard] = useState(0); 
  const isZh = i18n.language === 'zh';

  if (!abouts) return null;

  const hubTitle = {
    zh: { main: "資訊化", highlight: "整合集線平台" },
    en: { main: "DATA", highlight: "HUB_PLATFORM" }
  };

  return (
    // Mobile 使用 px-6 對齊，h-[100dvh] 確保單屏完整顯示
    <section className="py-12 md:py-4 w-full font-sans-zh relative z-5 px-6 md:px-28 min-h-[90dvh] md:min-h-0 flex flex-col justify-center">
      <div className="pt-0 pb-6 md:pb-12 mb-4 md:mb-8 text-center w-full">
        <h4 className="text-orange-500 font-mono text-[10px] md:text-[12px] tracking-[0.5em] mb-1 opacity-80">
          / {isZh ? "智慧資訊建築教學研究室" : "INTELLIGENCE INFO ARCH"}
        </h4>
        <h2 className="flex flex-wrap justify-center items-baseline gap-x-2 md:gap-x-3 text-white uppercase font-black tracking-tighter leading-none w-full">
          <span className="text-4xl md:text-7xl text-orange-600">{isZh ? hubTitle.zh.main : hubTitle.en.main}</span>
          <span className="text-4xl md:text-7xl">{isZh ? hubTitle.zh.highlight : hubTitle.en.highlight}</span>
        </h2>
      </div>

      {/* Mobile 下將 gap 縮小至 3，確保卡片不會太長超出屏外 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 border-l border-t border-white/10 relative z-10 w-full">
        {(isZh ? abouts.content_2_tw : abouts.content_2).map((item, idx) => (
          <div key={idx} 
            onMouseEnter={() => setActiveCard(idx)}
            onClick={() => setActiveCard(idx)} // Mobile 點擊觸發
            className={`group border-r border-b border-white/10 transition-all duration-300 relative overflow-hidden h-[110px] md:h-[350px] cursor-pointer ${
              activeCard === idx ? 'bg-[#00d4ff]' : 'bg-black/20 backdrop-blur-sm'
            }`}>
            
            <div className="p-4 md:p-10 flex flex-col justify-between h-full relative z-20">
              <span className={`font-mono text-[9px] md:text-[10px] font-black transition-all ${activeCard === idx ? 'text-black' : 'text-orange-500'}`}>
                HUB_DATA_0{idx+1}
              </span>
              <p className={`font-black tracking-tighter leading-tight transition-all duration-300 ${
                activeCard === idx ? 'text-black text-sm md:text-3xl' : 'text-white text-[11px] md:text-xl'
              } line-clamp-2 md:line-clamp-none`}>
                {item}
              </p>
              <ChevronRight size={16} className={`transition-all hidden md:block ${activeCard === idx ? 'text-black translate-x-0 opacity-100' : 'text-white opacity-0'}`} />
            </div>

            <div className="absolute inset-0 z-0">
               <img 
                  src={`${import.meta.env.BASE_URL}assets/img/about/ab_0${idx + 1}.png`} 
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    activeCard === idx ? 'opacity-40 grayscale-0 scale-110' : 'opacity-10 grayscale'
                  }`} 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}