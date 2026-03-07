// src/components/SectionWrapper.tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  id: string;
  filterType?: 'glass' | 'dark' | 'transparent';
  isFilterActive: boolean; // 接收 App 傳來的布林值
  paddingY?: string;       // 修正：新增 paddingY 定義
}

export default function SectionWrapper({ 
  children, 
  id, 
  filterType = 'glass', 
  isFilterActive, 
  paddingY = 'py-20' 
}: SectionWrapperProps) {
  
  const filterStyles = {
    glass: 'bg-black/40 backdrop-blur-2xl border-y border-white/5',
    dark: 'bg-black/90 backdrop-blur-md border-y border-white/10',
    transparent: 'bg-transparent'
  };

  return (
    <section id={id} className={`relative w-full ${paddingY} overflow-hidden`}>
      <motion.div
        initial={false}
        animate={{ 
          x: isFilterActive ? 0 : '100%', 
          opacity: isFilterActive ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute inset-0 z-0 ${filterStyles[filterType]} pointer-events-none`}
      />
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}