import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '@/mocks/schedulingData';
import { User } from 'lucide-react';



/**
 * 员工卡片组件 - 显示员工信息，支持拖拽和休假状态切换
 */
interface EmployeeCardProps {
  employee: Employee;
  onToggleLeave: (id: string) => void;
  isDraggable?: boolean;
  onDoubleClick?: () => void;
  onSettingsClick?: (id: string) => void;
  showSettingsButton?: boolean;
  showStatusButton?: boolean;
  selectedWorksiteId?: string | null;
  onAssign?: (employeeId: string) => void;
}

/**
 * 员工卡片组件 - 显示员工信息，支持拖拽、双击删除和长按设置
 */
export function EmployeeCard({ 
  employee, 
  onToggleLeave, 
  isDraggable = true,
  onDoubleClick,
  onSettingsClick,
  showSettingsButton = true,
  showStatusButton = true,
  selectedWorksiteId,
  onAssign
}: EmployeeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [touchOffset, setTouchOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const dragThreshold = 5; // 5px的移动阈值来区分点击和拖拽
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // 处理拖拽开始
  const handleDragStart = (e: DragEvent | TouchEvent) => {
    if (!cardRef.current || !isDraggable || employee.isOnLeave) return;
    
    const element = cardRef.current;
    setIsDragging(true);
    
    // 添加拖拽视觉效果
    element.classList.add('opacity-80', 'scale-105', 'shadow-lg', 'z-50');
    
    // 设置拖拽数据
    if ('dataTransfer' in e) {
      // 鼠标拖拽
      (e as DragEvent).dataTransfer.setData('text/plain', employee.id);
    } else if ('touches' in e) {
      // 触摸拖拽 - 记录初始位置
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
      setTouchOffset({ 
        x: touch.clientX - rect.left, 
        y: touch.clientY - rect.top 
      });
      
      // 设置拖拽数据
      element.setAttribute('data-employee-id', employee.id);
      
      // 防止触摸事件导致页面滚动
      e.preventDefault();
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (!cardRef.current) return;
    
    const element = cardRef.current;
    setIsDragging(false);
    setTouchStartPosition(null);
    setTouchOffset({ x: 0, y: 0 });
    
    // 移除拖拽视觉效果
    element.classList.remove('opacity-80', 'scale-105', 'shadow-lg', 'z-50');
    element.style.transform = '';
    element.style.zIndex = '';
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
  };

  // 处理触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !touchStartPosition || !cardRef.current) return;
    
    const touch = e.touches[0];
    const element = cardRef.current;
    
    // 计算移动距离
    const dx = touch.clientX - touchStartPosition.x;
    const dy = touch.clientY - touchStartPosition.y;
    
    // 如果是刚开始拖拽，检查是否超过拖拽阈值
    if (Math.abs(dx) < dragThreshold && Math.abs(dy) < dragThreshold) {
      return;
    }
    
    // 设置为固定定位，以便自由移动
    if (element.style.position !== 'fixed') {
      const rect = element.getBoundingClientRect();
      element.style.position = 'fixed';
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
    }
    
    // 更新位置
    element.style.left = `${touch.clientX - touchOffset.x}px`;
    element.style.top = `${touch.clientY - touchOffset.y}px`;
    
    // 防止页面滚动
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDraggable || !cardRef.current || employee.isOnLeave) return;

    const element = cardRef.current;
    
    // 鼠标拖拽事件
    element.addEventListener('dragstart', handleDragStart as (e: DragEvent) => void);
    element.addEventListener('dragend', handleDragEnd);
    
    // 触摸事件支持
    const handleTouchStart = (e: TouchEvent) => {
      // 记录初始触摸位置
      setTouchStartPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      
      // 立即开始拖拽检测
      handleDragStart(e);
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      
      handleDragEnd();
      
      // 尝试找到触摸结束位置下的工地卡片
      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      const worksiteCard = dropTarget?.closest('.worksite-card');
      
      if (worksiteCard) {
        const worksiteId = worksiteCard.getAttribute('data-worksite-id');
        if (worksiteId) {
          // 模拟拖放完成
          const event = new CustomEvent('simulated-drop', {
            detail: {
              worksiteId,
              employeeId: employee.id
            },
            bubbles: true
          });
          element.dispatchEvent(event);
        }
      }
    };
    
    const handleTouchCancel = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleTouchMove(e);
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      element.removeEventListener('dragstart', handleDragStart as (e: DragEvent) => void);
      element.removeEventListener('dragend', handleDragEnd);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [employee.id, isDraggable, employee.isOnLeave, handleDragStart, handleDragEnd]);

  // 切换员工休假状态
  const toggleLeaveStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLeave(employee.id);
  };



   return (
     <div
      ref={cardRef}
      draggable={isDraggable}
      onDoubleClick={onDoubleClick}
        className={cn(
            "flex flex-col items-center justify-center p-2 rounded-none cursor-move min-w-[48px] cursor-target",
          "transition-all duration-200",
             employee.isOnLeave 
               ? "bg-[#abd1c6] opacity-60" 
               : !isDraggable 
                 ? "bg-[#abd1c6] opacity-70" 
                 : "bg-[#abd1c6]",
           isDragging ? "opacity-80 scale-95" : "shadow-sm hover:shadow-md",
            onDoubleClick ? "cursor-pointer" : "",
            selectedWorksiteId ? "cursor-pointer hover:scale-105" : ""
         )}
        onClick={() => {
          if (selectedWorksiteId && onAssign && !employee.isOnLeave) {
            onAssign(employee.id);
          }
        }}
     >
          {/* 员工头像与姓名组合 */}
         {/* 评分头像 - 外层灰色背景，包含居中姓名 */}
           <div className={cn(
           "w-10 h-9 rounded-lg flex items-center justify-center relative overflow-hidden",
           "bg-gray-300"
         )}>
           {/* 工具图标 - 右上角显示 */}
             {employee.hasTool && (
               <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-bl-lg px-1 py-0.5 flex items-center justify-center z-10">
                 <i className="fa-solid fa-wrench"></i>
               </div>
             )}
          {/* 彩色填充部分 - 根据评分显示不同高度，从下往上填充 */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 flex items-center justify-center",
              employee.isOnLeave ? "bg-gray-400" : employee.avatarColor
            )}
            style={{ height: `${Math.min(10, Math.max(0, employee.score)) / 10 * 100}%` }}
          />
          {/* 居中显示的员工姓名 */}
          <span className={cn(
  "text-xs font-medium text-black relative z-10",
            "text-shadow-md"
          )}>
            {employee.name}
          </span>
        </div>
       


       
        {/* 操作按钮区 */}
        <div className="flex space-x-1 mt-1">
          {/* 休假切换按钮 */}
        {showStatusButton && (
          <button
            onClick={toggleLeaveStatus}
            className={cn(
              "mt-1.5 text-[10px] px-1.5 py-0.5 rounded",
              employee.isOnLeave 
                ? "bg-gray-200 text-gray-500" 
                : "bg-blue-100 text-blue-600"
            )}
          >
            {employee.isOnLeave ? "休" : "正"}
          </button>
        )}
        
           {/* 设置按钮 - 只在可拖拽状态下显示（未分配到工地的员工） */}

        </div>
    </div>
  );
}