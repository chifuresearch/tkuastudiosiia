import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// src/components/ProjectGrid.tsx
import { X, ExternalLink, Hash, User, Calendar, Briefcase } from 'lucide-react'; // 加上 Briefcase

interface ProjectData {
  date_year: number;
  name: string;
  name_tw: string;
  advisor: string;
  advisor_tw: string;
  title: string;
  title_tw: string;
  descript: string;
  descript_tw: string;
  tags: string[];
  img_path: string;
}

interface ProjectDataProps {
  projects: ProjectData[]; // 接收從 App.tsx 傳來的資料
}

export default function ProjectGrid({ projects }: ProjectDataProps) {
  const { i18n } = useTranslation();
  // const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const isZh = i18n.language === 'zh';



  // useEffect(() => {
  //   fetch('/data.json')
  //     .then(res => res.json())
  //     .then(payload => setProjects(payload.data.approaches))
  //     .catch(err => console.error("Project 資料載入失敗:", err));
  // }, []);

  // 動態提取所有不重複的標籤
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags.forEach(t => tags.add(t)));
    return ['all', ...Array.from(tags)];
  }, [projects]);

  // 根據選擇的標籤進行過濾
  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects;
    return projects.filter(p => p.tags.includes(filter));
  }, [projects, filter]);

  if (!projects || projects.length === 0) return null;

// 如果資料還沒載入，顯示一個簡單的 Loading 或回傳 null
  if (!projects || projects.length === 0) {
    return <div className="text-white text-center py-20 font-mono animate-pulse">LOADING_DATA...</div>;
  }

  return (
    <section className="w-full py-20 px-8">
      {/* 1. 篩選標籤欄 (Tag Filter) */}
      <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-4 py-1 text-[10px] font-bold tracking-widest uppercase transition-all border rounded-full ${
              filter === tag 
                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
            }`}
          >
            {tag === 'all' ? (isZh ? '全部作品' : 'ALL_PROJECTS') : tag}
          </button>
        ))}
      </div>

      {/* 2. 6-Column Project Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 lg:gap-8 max-w-[1600px] mx-auto">
        {filteredProjects.map((project, idx) => (
          <div 
            key={`${project.name}-${idx}`}
            onClick={() => setSelectedProject(project)}
            className="group relative cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${(idx % 12) * 50}ms` }}
          >
            {/* 作品圖片容器 */}
            <div className="aspect-square overflow-hidden bg-white/5 border border-white/5 group-hover:border-blue-500/50 transition-all duration-500">
              <img 
                src={project.img_path} 
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
              
              {/* 懸停遮罩 */}
              <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <ExternalLink className="text-white w-6 h-6" />
              </div>
            </div>

            {/* 作品簡訊 */}
            <div className="mt-4 px-1">
              <p className="text-[9px] text-blue-400 font-mono tracking-tighter mb-1 uppercase">
                {project.date_year} / {isZh ? project.advisor_tw : project.advisor}
              </p>
              <h4 className="text-white font-bold text-[11px] leading-tight tracking-tight truncate group-hover:text-blue-400 transition-colors">
                {isZh ? project.title_tw : project.title}
              </h4>
              <p className="text-gray-500 text-[9px] mt-1 font-light italic">
                by {isZh ? project.name_tw : project.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setSelectedProject(null)} />
          
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white"
            >
              <X size={24} />
            </button>

            {/* Modal 左側：大圖 */}
            <div className="w-full md:w-1/2 bg-black border-r border-white/5">
              <img src={selectedProject.img_path} className="w-full h-full object-contain p-8" alt="" />
            </div>

            {/* Modal 右側：內容 */}
            <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
              <div className="mb-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold tracking-widest uppercase rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter italic uppercase leading-none">
                  {isZh ? selectedProject.title_tw : selectedProject.title}
                </h3>
                <div className="flex items-center gap-6 text-xs text-gray-500 font-mono tracking-widest mt-6 uppercase border-y border-white/5 py-4">
                  <div className="flex items-center gap-2"><User size={14}/> {isZh ? selectedProject.name_tw : selectedProject.name}</div>
                  <div className="flex items-center gap-2"><Briefcase size={14}/> {isZh ? selectedProject.advisor_tw : selectedProject.advisor}</div>
                  <div className="flex items-center gap-2"><Calendar size={14}/> {selectedProject.date_year}</div>
                </div>
              </div>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed text-justify font-light whitespace-pre-wrap">
                {isZh ? selectedProject.descript_tw : selectedProject.descript}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}