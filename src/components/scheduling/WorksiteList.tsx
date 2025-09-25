import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Worksite, Employee } from '@/mocks/schedulingData';
import { WorksiteCard } from './WorksiteCard';
import { AddButton } from './AddButton';

interface WorksiteListProps {
  worksites: Worksite[];
  employees: Employee[];
  onRemoveEmployee: (worksiteId: string, employeeId: string) => void;
  onAddEmployee: (worksiteId: string, employeeId: string) => void;
  onAddWorksite: () => void;
  onDeleteWorksite: (worksiteId: string) => void;
  onWorksiteSettings?: (worksiteId: string) => void;
}

/**
 * 工地列表组件 - 横向排列所有工地卡片
 */
export function WorksiteList({ 
  worksites, 
  employees, 
  onRemoveEmployee, 
  onAddEmployee, 
  onAddWorksite,
  onDeleteWorksite,
  onWorksiteSettings
}: WorksiteListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);

  // 检测滚动位置并显示/隐藏滚动指示器
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowScrollIndicators(scrollWidth > clientWidth);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始检查

    return () => container.removeEventListener('scroll', handleScroll);
  }, [worksites.length]);

  return (
    <div className="relative mb-6">
      {/* 工地列表标题 */}
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-lg font-semibold text-gray-800 hidden">工地排班</h2>
      </div>
      
      {/* 横向滚动的工地卡片列表 */}
      <div 
        ref={scrollContainerRef}
         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 px-2 pb-3 max-w-4xl mx-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'hidden' }}
      >
        {worksites.map(worksite => (
           <div 
             key={worksite.id} 
             className="w-full"
           >
              <WorksiteCard 
                worksite={worksite}
                employees={employees}
                onRemoveEmployee={onRemoveEmployee}
                onAddEmployee={onAddEmployee}
                onDeleteWorksite={onDeleteWorksite}
                onSettingsClick={onWorksiteSettings}
              />
          </div>
        ))}
      </div>
      

    </div>
  );
}