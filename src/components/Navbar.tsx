import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onLanguageToggle: () => void;
  currentLang: string;
  onNavigate: (sectionId: string, camIndex: string) => void;
  siteData: any; 
}

export default function Navbar({ onLanguageToggle, currentLang, onNavigate, siteData }: NavbarProps) {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isZh = i18n.language === 'zh';

  const info = siteData?.info || siteData?.data?.info;
  const menuItems = isZh ? info?.menu_tw : info?.menu;

  // 定義前四個按鈕的 Section 跳轉 ID
  const sectionIds = ["about", "project", "studio", "gallery"];

  // ShareLinks 下拉選單資料
  const shareLinks = [
    { label: "P5js Lab", url: "#" },
    { label: "Grasshopper", url: "#" },
    { label: "Python Scripts", url: "#" },
    { label: "Github Repo", url: "#" }
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-8 py-6 pointer-events-none">
      {/* 左側 Logo */}
      <div className="text-2xl font-black tracking-tighter text-white pointer-events-auto cursor-pointer group font-sans-zh">
        TKU_ARCH <span className="text-[#00d4ff] text-xs ml-1 italic group-hover:not-italic transition-all">LAB</span>
      </div>

      {/* 中間主選單：整合 SHARELINKS 作為最後一項 */}
      <div className="hidden md:flex bg-black/80 backdrop-blur-md border-2 border-white/20 px-2 py-1 gap-1 pointer-events-auto items-center">
        {/* 1. 前四個固定按鈕 (About, Project, Studio, Gallery) */}
        {menuItems?.slice(0, 4).map((item: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onNavigate(sectionIds[idx], idx.toString())}
            className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-crosshair font-sans-zh text-gray-400 hover:bg-[#00d4ff] hover:text-black"
          >
            {typeof item === 'object' ? (item.name || item.label) : item}
          </button>
        ))}

        {/* 2. 第五個按鈕：SHARELINKS 帶下拉選單 */}
        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-crosshair font-sans-zh ${
              isDropdownOpen ? 'bg-[#00d4ff] text-black' : 'text-gray-400 hover:bg-[#00d4ff] hover:text-black'
            }`}
          >
            {isZh ? "設計方法" : "SHARELINKS"} 
            <ChevronDown size={10} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 下拉 Drop Box (從按鈕正下方彈出) */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-black border-2 border-[#00d4ff] p-1 shadow-[8px_8px_0px_rgba(0,212,255,0.3)] animate-in fade-in slide-in-from-top-2">
              {shareLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="flex items-center justify-between p-3 text-[11px] font-black text-white hover:bg-[#00d4ff] hover:text-black transition-colors border-b border-white/10 last:border-0 font-sans-zh"
                >
                  {link.label} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右側：僅保留語系切換 */}
      <div className="flex items-center gap-4 pointer-events-auto font-sans-zh">
        <button 
          onClick={onLanguageToggle}
          className="p-2 border border-white/20 bg-black text-white hover:bg-[#00d4ff] hover:text-black transition-all"
        >
          <Globe size={18} />
        </button>
      </div>
    </nav>
  );
}