import { useTranslation } from 'react-i18next';

interface FooterData {
  footerlog: string[];
  footerlog_tw: string[];
  footerMessage: string[];
  footerMessage_tw: string[];
  menu: string[]; 
}

interface FooterDataProps {
  footer: FooterData | null;
  // 新增：接收與 Navbar 相同的導航函式
  onNavigate: (sectionId: string, camIndex: string) => void;
}

export default function Footer({ footer, onNavigate }: FooterDataProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  if (!footer) return null;

  const message = isZh ? footer.footerMessage_tw : footer.footerMessage;
  const links = isZh ? footer.footerlog_tw : footer.footerlog;
  
  // 建立與 Navbar 一致的目標 ID 與攝影機索引映射
  const sectionIds = ["about", "project", "studio", "gallery"];

  return (
    <footer className="relative z-20 bg-black/90 backdrop-blur-3xl border-t border-white/5 pt-20 pb-10 font-sans-zh">
      <div className="container mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* A. 研究室簡介 */}
          <div className="lg:col-span-6">
            <h2 className="text-[#00d4ff] font-black tracking-tighter text-2xl mb-8 uppercase">
              TKU_ARCH <span className="text-white opacity-80">IIA_STUDIO</span>
            </h2>
            <p className="text-gray-400 text-sm leading-[1.8] text-justify font-light max-w-2xl uppercase">
              {message[0]}
            </p>
          </div>

          {/* B. 快速導航：同步攝影機與捲動效果 */}
          <div className="lg:col-span-3 lg:ml-auto">
            <h4 className="text-white font-bold text-[10px] tracking-[0.4em] mb-10 uppercase opacity-50 text-center lg:text-left">
              {isZh ? "快速導覽" : "NAVIGATION"}
            </h4>
            
            {/* Mobile: 橫向排列 (flex-row + flex-wrap) | Desktop: 縱向排列 (flex-col) */}
            <ul className="flex flex-row flex-wrap justify-center lg:flex-col lg:justify-start gap-4 lg:gap-5">
              {links.map((link: string, idx: number) => (
                <li key={idx} className="group overflow-hidden">
                  <button
                    onClick={() => onNavigate(sectionIds[idx], idx.toString())}
                    className="text-gray-500 hover:text-[#00d4ff] text-[11px] lg:text-xs tracking-[0.2em] transition-all duration-300 uppercase flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 font-black"
                  >
                    <span className="hidden lg:block w-0 group-hover:w-4 h-[1px] bg-[#00d4ff] transition-all duration-300" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* C. 聯絡資訊 */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-[10px] tracking-[0.4em] mb-10 uppercase opacity-50">
              {isZh ? "聯絡資訊" : "CONTACT"}
            </h4>
            <div className="text-gray-400 text-[10px] lg:text-xs font-mono leading-loose uppercase">
              <p className="mb-6">{message[2]}</p>
            </div>
          </div>
        </div>

        {/* 底部版權 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <p className="text-[9px] text-gray-500 tracking-[0.3em] uppercase">{message[1]}</p>
          <span className="text-[9px] text-gray-600 font-mono italic uppercase">Computational Design Framework _ 2026</span>
        </div>
      </div>
    </footer>
  );
}