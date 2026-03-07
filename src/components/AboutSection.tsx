import { useState, useEffect } from 'react';
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
  abouts: AboutData | null; // 接收從 App.tsx 傳來的資料
}

export default function AboutSection({ abouts }: AboutDataProps) {
  const { i18n } = useTranslation();
  // const [data, setData] = useState<AboutData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const isZh = i18n.language === 'zh';

  // useEffect(() => {
  //   fetch('/data.json')
  //     .then(res => res.json())
  //     .then(payload => setData(payload.data.info.sections[1])) // 串接 sections[1]
  //     .catch(err => console.error("About 數據加載失敗:", err));
  // }, []);

  if (!abouts ) return null;

// 如果資料還沒載入，顯示一個簡單的 Loading 或回傳 null
  if (!abouts ) {
    return <div className="text-white text-center py-20 font-mono animate-pulse">LOADING_DATA...</div>;
  }
  

  // 定義內容索引
  const tabs = [
    { 
      label: isZh ? abouts.content_a_tw[0] : abouts.content_a[0], 
      text: isZh ? abouts.content_a_tw[1] : abouts.content_a[1],
      icon: <Info size={16} />
    },
    { 
      label: isZh ? abouts.content_b_tw[0] : abouts.content_b[0], 
      text: isZh ? abouts.content_b_tw[1] : abouts.content_b[1],
      icon: <Target size={16} />
    },
    { 
      label: isZh ? abouts.content_c_tw[0] : abouts.content_c[0], 
      text: isZh ? abouts.content_c_tw[1] : abouts.content_c[1],
      icon: <Cpu size={16} />
    }
  ];

  return (
    <section id="about" className="relative z-10 py-32 px-8 overflow-hidden bg-black/20 backdrop-blur-3xl border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* 第一部分：EA4 Studio Program */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-2">
              <h4 className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase opacity-70">
                / {isZh ? abouts.subtitle_tw : abouts.subtitle}
              </h4>
              <h2 
                className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]"
                dangerouslySetInnerHTML={{ __html: isZh ? abouts.title_tw : abouts.title }}
              />
            </div>

            {/* 高質感內容切換器 */}
            <div className="space-y-4 pt-8">
              {tabs.map((tab, idx) => (
                <div 
                  key={idx}
                  onMouseEnter={() => setActiveTab(idx)}
                  className={`group p-6 rounded-xl border transition-all duration-500 cursor-help ${
                    activeTab === idx 
                      ? 'bg-blue-600/10 border-blue-500/50' 
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-blue-400">{tab.icon}</span>
                    <h3 className="text-white font-bold text-xs tracking-widest uppercase">
                      {tab.label.replace(/<[^>]*>?/gm, '')} {/* 移除 JSON 中的 img 標籤 */}
                    </h3>
                  </div>
                  {activeTab === idx && (
                    <p 
                      className="text-gray-400 text-sm leading-relaxed text-justify animate-in fade-in slide-in-from-left-4 duration-500"
                      dangerouslySetInnerHTML={{ __html: tab.text }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右側視覺展示：疊加圖片 */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
              <img src="assets/img/about/ab_00_l.png" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-2/3 aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl z-20 hidden md:block">
              <img src="assets/img/about/ab_00_s.png" className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>

        {/* 第二部分：Informational Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* 左側視覺 */}
          <div className="lg:col-span-5 order-2 lg:order-1">
             <div className="relative group">
                <img src="assets/img/about/ab_01_l.png" className="rounded-2xl border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                <img src="assets/img/about/ab_01_s.png" className="absolute -top-6 -right-6 w-1/2 border border-blue-500/30 rounded-lg shadow-xl" alt="" />
             </div>
          </div>

          {/* 右側清單 */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-10">
            <div className="space-y-4">
              <h3 className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase">
                / {isZh ? abouts.subtitle_2_tw : abouts.subtitle_2}
              </h3>
              <h2 
                className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1]"
                dangerouslySetInnerHTML={{ __html: isZh ? abouts.title_2_tw : abouts.title_2 }}
              />
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(isZh ? abouts.content_2_tw : abouts.content_2).map((item, idx) => (
                <li key={idx} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-lg hover:border-blue-500/30 transition-all group">
                  <ChevronRight size={14} className="text-blue-500 mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
                  <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-200 transition-colors">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 建築座標背景背景線 */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-white/5 -z-10" />
    </section>
  );
}