import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-scroll'; // 引入捲動組件

interface FooterData {
  footerlog: string[];
  footerlog_tw: string[];
  footerMessage: string[];
  footerMessage_tw: string[];
  // 為了對應跳轉目標，我們預設一個 id 映射
  menu: string[]; 
}

export default function Footer() {
  const { i18n } = useTranslation();
  const [info, setInfo] = useState<any>(null);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(payload => {
        setInfo(payload.data.info);
      });
  }, []);

  if (!info) return null;

  const message = isZh ? info.footerMessage_tw : info.footerMessage;
  const links = isZh ? info.footerlog_tw : info.footerlog;
  
  // 建立連結與目標 ID 的映射 (對應你的 Navbar 標籤)
  // 假設：More Information -> about, Studio Works -> project, Gallery -> gallery
  const targetIds = ["about", "studio", "project", "gallery"];

  return (
    <footer className="relative z-20 bg-black/90 backdrop-blur-3xl border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* A. 研究室簡介 */}
          <div className="lg:col-span-6">
            <h2 className="text-blue-500 font-black tracking-tighter text-2xl mb-8 uppercase">
              TKU_ARCH <span className="text-white opacity-80">IIA_STUDIO</span>
            </h2>
            <p className="text-gray-400 text-sm leading-[1.8] text-justify font-light max-w-2xl">
              {message[0]}
            </p>
          </div>

          {/* B. 快速導航：加入捲動效果 */}
          <div className="lg:col-span-3 lg:ml-auto">
            <h4 className="text-white font-bold text-[10px] tracking-[0.4em] mb-10 uppercase opacity-50">
              {isZh ? "快速導覽" : "NAVIGATION"}
            </h4>
            <ul className="space-y-5">
              {links.map((link: string, idx: number) => (
                <li key={idx} className="group overflow-hidden">
                  <Link
                    to={targetIds[idx] || "about"} // 對應到 Element 的 name
                    smooth={true}
                    duration={800}
                    offset={-70}
                    className="text-gray-500 group-hover:text-blue-400 text-xs tracking-[0.2em] transition-all duration-300 uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-blue-500 transition-all duration-300" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* C. 聯絡資訊 */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-[10px] tracking-[0.4em] mb-10 uppercase opacity-50">
              {isZh ? "聯絡資訊" : "CONTACT"}
            </h4>
            <div className="text-gray-400 text-xs font-mono leading-loose">
              <p className="mb-6">{message[2]}</p>
              {/* Social Buttons... */}
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