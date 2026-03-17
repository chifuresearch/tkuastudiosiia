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
    setIsMenuOpen(false); // 點擊後自動關閉選單
  };

  return (
    <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 py-4 md:px-8 md:py-6">
      {/* 左側 Logo */}
      <div className="text-xl md:text-2xl font-black tracking-tighter text-white z-[110] cursor-pointer group font-sans-zh">
        TKU_ARCH <span className="text-[#00d4ff] text-xs ml-1 italic group-hover:not-italic transition-all">LAB</span>
      </div>

      {/* --- Desktop Menu (md 以上顯示) --- */}
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
        {/* ShareLinks Dropdown 保持原樣... */}
      </div>

      {/* --- Mobile Menu Toggle (md 以下顯示) --- */}
      <div className="flex md:hidden items-center gap-3 z-[110]">
        <button 
          onClick={onLanguageToggle}
          className="p-2 border border-white/10 bg-black/50 text-white"
        >
          <Globe size={16} />
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-[#00d4ff] text-black shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- Mobile Overlay Menu --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 z-[105] animate-in fade-in zoom-in duration-300">
          {menuItems?.slice(0, 4).map((item: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleMobileNavigate(sectionIds[idx], idx.toString())}
              className="text-2xl font-black tracking-[0.3em] text-white hover:text-[#00d4ff] transition-colors font-sans-zh"
            >
              {typeof item === 'object' ? (item.name || item.label) : item}
            </button>
          ))}
          
          {/* Mobile ShareLinks 展開 */}
          <div className="flex flex-col items-center gap-4 mt-4 border-t border-white/10 pt-8 w-full px-12">
            <span className="text-[10px] text-gray-500 tracking-[0.5em] mb-2">{isZh ? "設計方法" : "SHARELINKS"}</span>
            <div className="grid grid-cols-2 gap-4 w-full">
              {shareLinks.map((link, i) => (
                <a key={i} href={link.url} className="text-[10px] text-center p-3 border border-white/10 text-gray-400">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop 右側語系 (僅 md 顯示) */}
      <div className="hidden md:flex items-center gap-4 font-sans-zh">
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