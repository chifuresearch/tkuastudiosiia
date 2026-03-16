import { Link } from 'react-scroll';
import { Globe } from 'lucide-react';

// 1. 定義 Props 的型別
interface NavbarProps {
  onLanguageToggle: () => void;
  currentLang: string;
  onNavigate: (sectionId: string, camIndex: string) => void; // 確保有這行
}

const NAV_CONFIG = [
  { id: "about", label: "About", camIndex: "0" },
  { id: "project", label: "Project", camIndex: "1" },
  { id: "studio", label: "Studio", camIndex: "2" },
  { id: "gallery", label: "Gallery", camIndex: "3" },
  { id: "perspective", label: "Perspective", camIndex: "4" }
];

// 2. 核心修正：在參數解構中加入 onNavigate
export default function Navbar({ onLanguageToggle, currentLang, onNavigate }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 pointer-events-none">
      <div className="text-xl font-black tracking-tighter text-white pointer-events-auto">
        TKU_ARCH <span className="text-blue-500 text-xs ml-1 italic">LAB</span>
      </div>

      <div className="hidden md:flex bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full gap-8 pointer-events-auto">
        {NAV_CONFIG.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id, item.camIndex)} // 呼叫 App.tsx 傳進來的邏輯
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-white cursor-pointer transition-colors font-mono"
          >
            {item.label}
          </button>
        ))}
      </div>

      <button 
        onClick={onLanguageToggle}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-1.5 rounded-full transition-all pointer-events-auto"
      >
        <Globe size={14} className="text-blue-400" />
        <span className="text-[10px] font-bold text-white uppercase">
          {currentLang === 'zh' ? 'EN' : '中文'}
        </span>
      </button>
    </nav>
  );
}