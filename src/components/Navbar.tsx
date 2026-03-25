import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, ExternalLink, Menu, X } from 'lucide-react';

interface NavbarProps {
  onLanguageToggle: () => void;
  currentLang: string;
  onNavigate: (sectionId: string, camIndex: string) => void;
  siteData: any; 
}

export default function Navbar({ onLanguageToggle, currentLang, onNavigate, siteData }: NavbarProps) {
  const { i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isZh = i18n.language === 'zh';

  const info = siteData?.info || siteData?.data?.info;
  const menuItems = isZh ? info?.menu_tw : info?.menu;
  const sectionIds = ["about", "project", "studio", "gallery"];

  const shareLinks = [
    { label: "P5js Lab", url: "#" },
    { label: "Grasshopper", url: "#" },
    { label: "Python Scripts", url: "#" },
    { label: "Github Repo", url: "#" }
  ];

  const handleMobileNavigate = (id: string, idx: string) => {
    onNavigate(id, idx);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 py-4 md:px-8 md:py-6">
      {/* 左側 Logo */}
      <div className="text-xl md:text-2xl font-black tracking-tighter text-white z-[110] cursor-pointer group font-sans-zh">
        TKU_ARCH <span className="text-[#00d4ff] text-xs ml-1 italic group-hover:not-italic transition-all">LAB</span>
      </div>

      {/* --- Desktop Menu --- */}
      <div className="hidden md:flex bg-black/80 backdrop-blur-md border-2 border-white/20 px-2 py-1 gap-1 items-center">
        {menuItems?.slice(0, 4).map((item: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onNavigate(sectionIds[idx], idx.toString())}
            className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-crosshair font-sans-zh text-gray-400 hover:bg-[#00d4ff] hover:text-black"
          >
            {typeof item === 'object' ? (item.name || item.label) : item}
          </button>
        ))}
        
        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-[#00d4ff] hover:text-black transition-all">
            {isZh ? "設計方法" : "SHARELINKS"}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-black border-2 border-white/20 p-2 flex flex-col gap-1">
              {shareLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-400 hover:bg-[#00d4ff] hover:text-black transition-all group/item"
                >
                  {link.label}
                  <ExternalLink size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Mobile Toggle --- */}
      <div className="flex md:hidden items-center gap-3 z-[110]">
        <button onClick={onLanguageToggle} className="p-2 border border-white/10 bg-black/50 text-white">
          <Globe size={16} />
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-[#00d4ff] text-black shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- Mobile Overlay Menu (修正點在此) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col justify-start items-center z-[105] animate-in fade-in zoom-in duration-300 overflow-y-auto pt-24 pb-12">
          <div className="flex flex-col items-center gap-8 w-full">
            
            {/* 1. 主要導航項目 (關於、作品、教學團隊、集錦) */}
            {menuItems?.slice(0, 4).map((item: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleMobileNavigate(sectionIds[idx], idx.toString())}
                className="text-2xl font-black tracking-[0.3em] text-white hover:text-[#00d4ff] transition-colors font-sans-zh uppercase"
              >
                {typeof item === 'object' ? (item.name || item.label) : item}
              </button>
            ))}

            {/* 2. 「設計方法」標題 - 字體大小與上方一致 */}
            <div className="text-2xl font-black tracking-[0.3em] text-white font-sans-zh uppercase mt-4">
              {isZh ? "設計方法" : "SHARELINKS"}
            </div>

            {/* 3. 次選項連結 - 字體稍微縮小，顏色略淡以區分層次 */}
            <div className="flex flex-col items-center gap-5 w-full">
              {shareLinks.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  className="text-lg font-bold tracking-[0.2em] text-gray-400 hover:text-[#00d4ff] transition-colors font-sans-zh uppercase"
                >
                  {link.label}
                </a>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Desktop 右側語系 */}
      <div className="hidden md:flex items-center gap-4 font-sans-zh">
        <button onClick={onLanguageToggle} className="p-2 border border-white/20 bg-black text-white hover:bg-[#00d4ff] hover:text-black transition-all">
          <Globe size={18} />
        </button>
      </div>
    </nav>
  );
}