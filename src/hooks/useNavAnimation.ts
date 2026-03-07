// src/hooks/useNavAnimation.ts
import { useState } from 'react';
import { scroller } from 'react-scroll';

export function useNavAnimation() {
  const [currentFilterState, setFilterState] = useState<'visible' | 'hidden'>('visible');

  const executeThreeStageNav = async (sectionId: string, camIndex: string) => {
    // 階段一：淡出/平移濾鏡
    setFilterState('hidden');
    await new Promise(resolve => setTimeout(resolve, 600)); // 等待濾鏡完全透明

    // 階段二：3D 相機飛行 + UI 捲動
    window.dispatchEvent(new CustomEvent('jumpToView', { detail: camIndex }));
    scroller.scrollTo(sectionId, { duration: 1000, smooth: true });
    
    // 等待飛行與捲動完成 (建議時間比 scroller 略長)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 階段三：恢復設定的濾鏡值
    setFilterState('visible');
  };

  return { currentFilterState, executeThreeStageNav };
}