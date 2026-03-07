import { useState, useEffect } from 'react';
import { Element, scroller } from 'react-scroll'; // 修正：必須匯入 scroller
import { useTranslation } from 'react-i18next';
import type { MouseEvent } from 'react';
import './i18n';

// 匯入組件
import Navbar from './components/Navbar';
import BabylonjsScene from './components/BabylonjsScene';
import EventCarousel from './components/EventCarousel';
import AboutSection from './components/AboutSection';
import ProjectGrid from './components/ProjectGrid';
import TeamGrid from './components/TeamGrid';
import GalleryCarousel from './components/GalleryCarousel';
import Footer from './components/Footer';
import SectionWrapper from './components/SectionWrapper';

function App() {
  // 統一load
  const [siteData, setSiteData] = useState<any>(null);
  // 1. 統一使用 isFilterActive 狀態
  const [isFilterActive, setIsFilterActive] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 核心修正：在開發環境 (localhost) BASE_URL 通常是 "/"
      // 在 GitHub Pages 是 "/tkuastudiosiia/"
      const jsonPath = `${import.meta.env.BASE_URL}data.json`.replace(/\/+/g, '/');
      
      try {
        console.log("Fetching from:", jsonPath);
        const response = await fetch(jsonPath);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const res = await response.json();
        // 根據你的 data.json 結構，數據在 res.data 內
        setSiteData(res.data);
      } catch (err) {
        console.error("JSON 載入失敗，請檢查 public/data.json 是否存在:", err);
      }
    };
    loadData();
  }, []);

  const { i18n } = useTranslation();
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    window.dispatchEvent(new CustomEvent('updateMouse', { detail: { x, y } }));
  };

  

  // 2. 三階段導航核心邏輯
  const handleNavigate = async (sectionId: string, camIndex: string) => {
    // 階段一：濾鏡消失
    setIsFilterActive(false);
    await new Promise(resolve => setTimeout(resolve, 600));

    // 階段二：3D 飛行與 UI 捲動同步
    window.dispatchEvent(new CustomEvent('jumpToView', { detail: camIndex }));
    scroller.scrollTo(sectionId, { duration: 1000, smooth: true, offset: -70 });

    // 階段三：完成後恢復濾鏡
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsFilterActive(true);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative bg-black text-white antialiased selection:bg-blue-500 min-h-screen"
    >
      <BabylonjsScene />
      <Navbar onLanguageToggle={toggleLanguage} currentLang={i18n.language} onNavigate={handleNavigate}/>

      <main className="relative z-10">
        {/* 修正點：isFilterActive 直接傳入布林值，並確認 SectionWrapper 接收 paddingY */}
        <SectionWrapper id="events-section" filterType="transparent" isFilterActive={isFilterActive} paddingY="py-20">
          <Element name="about">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-black mb-8 tracking-widest text-blue-500 uppercase">Upcoming Events</h2>
              <EventCarousel events={siteData?.events || []}/>
            </div>
          </Element>
        </SectionWrapper>

        <SectionWrapper id="about-text" filterType="glass" isFilterActive={isFilterActive} paddingY="py-32">
          <div className="container mx-auto px-6">
            <AboutSection abouts={siteData?.info.sections[1] || null}/>
          </div>
        </SectionWrapper>

        <SectionWrapper id="project-section" filterType="dark" isFilterActive={isFilterActive} paddingY="py-20">
          <Element name="project">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-black mb-12 tracking-widest uppercase italic">Selected Projects</h2>
              <ProjectGrid projects={siteData?.approaches || []}/>
            </div>
          </Element>
        </SectionWrapper>

        <SectionWrapper id="studio-section" filterType="glass" isFilterActive={isFilterActive} paddingY="py-20">
          <Element name="studio">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-black mb-12 tracking-widest text-right uppercase">The Studio Team</h2>
              <TeamGrid advisors={siteData?.advisors || []}/>
            </div>
          </Element>
        </SectionWrapper>

        <SectionWrapper id="gallery-section" filterType="transparent" isFilterActive={isFilterActive} paddingY="py-20">
          <Element name="gallery">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-black mb-12 tracking-widest uppercase">Collected Moments</h2>
              <GalleryCarousel gallery={siteData?.gallery || []}/>
            </div>
          </Element>
        </SectionWrapper>

        <Footer />
      </main>
    </div>
  );
}

export default App;