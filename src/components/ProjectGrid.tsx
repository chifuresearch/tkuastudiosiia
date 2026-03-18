import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, UserCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export default function ProjectGrid({ projects }: { projects: any[] }) {
  const { i18n } = useTranslation();
  const [filter, setFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const isZh = i18n.language === 'zh';

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags?.forEach((t: string) => tags.add(t)));
    return ['ALL', ...Array.from(tags)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === 'ALL') return projects;
    return projects.filter(p => p.tags?.includes(filter));
  }, [filter, projects]);

  // 單個專案卡片組件，確保樣式統一
  const ProjectCard = ({ project }: { project: any }) => (
    <div 
      onClick={() => setSelectedProject(project)}
      className="group relative flex flex-col border border-white/10 overflow-hidden transition-all duration-500 cursor-pointer aspect-[750/1334] bg-black w-full"
    >
      <div className="absolute inset-0 z-0">
        <img src={project.img_path} className="w-full h-full object-cover grayscale-0 opacity-100 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      <div className="relative z-10 mt-auto p-5 flex flex-col justify-end gap-2 transition-all duration-300 bg-black/60 group-hover:bg-[#00d4ff] min-h-[160px] border-t border-white/10">
        <div className="flex flex-col leading-tight">
          <span className="text-orange-500 font-mono text-[11px] tracking-widest block group-hover:text-black font-black mb-0.5">
            ADVISOR: {isZh ? project.advisor_tw : project.advisor}
          </span>
          <h3 className="text-white text-3xl font-black tracking-tighter uppercase transition-all duration-300 group-hover:text-black group-hover:text-5xl font-sans-zh leading-[0.9]">
            {isZh ? project.name_tw : project.name}
          </h3>
          <p className="text-gray-300 text-xs font-bold group-hover:text-black mt-2 transition-all line-clamp-1">
            {isZh ? project.title_tw : project.title}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="h-[2px] w-full bg-white/10 group-hover:bg-black/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-0 bg-orange-600 group-hover:w-full transition-all duration-700 delay-150 shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
          </div>
          <p className="text-gray-500 text-[9px] group-hover:text-orange-600 group-hover:text-[12px] font-mono font-black italic self-end transition-all delay-500 group-hover:bg-black group-hover:px-1.5 py-0.5">
            {isZh ? project.category_tw : project.category}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* 1. Tag 篩選器：Mobile 改為橫向挪動 (overflow-x-auto) */}
      <div className="flex flex-nowrap sm:flex-wrap gap-3 px-6 overflow-x-auto scrollbar-hide sm:justify-center pb-4 sm:pb-0">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`whitespace-nowrap px-5 py-1.5 font-mono text-sm border-2 transition-all duration-300 ${
              filter === tag 
              ? 'bg-[#00d4ff] border-[#00d4ff] text-black font-black shadow-[4px_4px_0px_rgba(0,212,255,0.4)]' 
              : 'bg-black/40 border-white/20 text-gray-400 hover:border-[#00d4ff] hover:text-[#00d4ff]'
            }`}
          >
            {tag.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 2. 內容展現區 */}
      <div className="relative z-10">
        {/* Mobile 視角 (Carousel) */}
        <div className="block sm:hidden px-4">
          <Swiper
            modules={[EffectCoverflow, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1.2}
            spaceBetween={20}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            className="w-full pb-12"
          >
            {filteredProjects.map((project, idx) => (
              <SwiperSlide key={`mob-${idx}`}>
                <ProjectCard project={project} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop 視角 (Grid) */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-5 border-l border-t border-white/10">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={`desk-${idx}`} project={project} />
          ))}
        </div>
      </div>

      {/* 3. Modal (維持原有穩定版) */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md">
          <div className="relative flex flex-col md:flex-row bg-[#111] border border-white/10 w-full max-w-6xl h-[90vh] md:h-[80vh] overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-[110] text-white hover:text-[#00d4ff] bg-black/50 p-2 rounded-full transition-all">
              <X size={32} />
            </button>
            
            {/* 彈窗內容：左側輪播 */}
            <div className="flex-grow bg-black relative border-r border-white/10 flex items-center justify-center min-h-[300px]">
              <Swiper modules={[Autoplay, Navigation, Pagination]} autoplay={{ delay: 3500 }} loop={true} navigation={true} pagination={{ clickable: true }} className="h-full w-full">
                <SwiperSlide>
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <img src={selectedProject.img_path} className="max-w-full max-h-full object-contain" alt="" />
                  </div>
                </SwiperSlide>
                {selectedProject.img_paths?.map((img: string, i: number) => (
                  <SwiperSlide key={i}>
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <img src={img} className="max-w-full max-h-full object-contain" alt="" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 彈窗內容：右側資訊 */}
            <div className="w-full md:w-[450px] shrink-0 h-full p-8 md:p-12 bg-[#111] flex flex-col">
              <div className="mb-8 border-b border-[#00d4ff]/30 pb-6 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle size={16} className="text-orange-500" />
                  <span className="text-gray-400 font-mono text-s uppercase tracking-widest">
                    Advisor: {isZh ? selectedProject.advisor_tw : selectedProject.advisor}
                  </span>
                </div>
                <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase leading-none font-sans-zh">
                  {isZh ? selectedProject.name_tw : selectedProject.name}
                </h2>
                <h4 className="text-[#00d4ff] text-xl font-bold tracking-tight mb-4">
                  {isZh ? selectedProject.title_tw : selectedProject.title}
                </h4>
              </div>
              <div className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#00d4ff] scrollbar-track-transparent">
                <div className="flex gap-4">
                  <div className="mt-1 text-[#00d4ff] shrink-0"><FileText size={20} /></div>
                  <div className="text-gray-400 text-base leading-relaxed whitespace-pre-wrap font-light text-justify font-sans-zh">
                    {isZh ? selectedProject.descript_tw : selectedProject.descript}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}