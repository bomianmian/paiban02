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
  showStatusButton = true
}: EmployeeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number, y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const dragTimer = useRef<number | null>(null);

  // 处理拖拽开始
  const handleDragStart = (e: DragEvent | TouchEvent) => {
    if (!cardRef.current || !isDraggable || employee.isOnLeave) return;
    
    const element = cardRef.current;
    setIsDragging(true);
    element.classList.add('opacity-50', 'scale-95', 'shadow-lg');
    element.style.zIndex = '100';
    
    // 设置拖拽数据
    if ('dataTransfer' in e) {
      (e as DragEvent).dataTransfer.setData('text/plain', employee.id);
    } else {
      // 对于触摸事件，存储在元素上
      element.setAttribute('data-employee-id', employee.id);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (!cardRef.current) return;
    
    const element = cardRef.current;
    setIsDragging(false);
    setTouchPosition(null);
    element.classList.remove('opacity-50', 'scale-95', 'shadow-lg');
    element.style.zIndex = '';
    element.style.transform = '';
  };

  // 处理触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !touchPosition) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchPosition.x;
    const dy = touch.clientY - touchPosition.y;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  useEffect(() => {
    if (!isDraggable || !cardRef.current || employee.isOnLeave) return;

    const element = cardRef.current;
    
    // 鼠标拖拽事件
    element.addEventListener('dragstart', handleDragStart as (e: DragEvent) => void);
    element.addEventListener('dragend', handleDragEnd);
    
    // 触摸事件支持
    element.addEventListener('touchstart', (e) => {
      // 记录初始触摸位置
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      
      // 使用延迟来区分点击和拖拽
      dragTimer.current = window.setTimeout(() => {
        handleDragStart(e);
      }, 200);
    });
    
    element.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault(); // 防止页面滚动
        handleTouchMove(e);
      }
    });
    
    element.addEventListener('touchend', (e) => {
      if (dragTimer.current) {
        clearTimeout(dragTimer.current);
        dragTimer.current = null;
      }
      
      if (isDragging) {
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
      }
    });
    
    element.addEventListener('touchcancel', handleDragEnd);

    return () => {
      element.removeEventListener('dragstart', handleDragStart as (e: DragEvent) => void);
      element.removeEventListener('dragend', handleDragEnd);
      element.removeEventListener('touchstart', () => {});
      element.removeEventListener('touchmove', () => {});
      element.removeEventListener('touchend', () => {});
      element.removeEventListener('touchcancel', handleDragEnd);
      
      if (dragTimer.current) {
        clearTimeout(dragTimer.current);
      }
    };
  }, [employee.id, isDraggable, employee.isOnLeave]);

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
          "flex flex-col items-center justify-center p-2 rounded-none cursor-move",
         "transition-all duration-200",
            employee.isOnLeave 
              ? "bg-[#abd1c6] opacity-60" 
              : !isDraggable 
                ? "bg-[#abd1c6] opacity-70" 
                : "bg-[#abd1c6]",
          isDragging ? "opacity-80 scale-95" : "shadow-sm hover:shadow-md",
         onDoubleClick ? "cursor-pointer" : "",
         isLongPressing ? "scale-95 bg-blue-50" : ""
       )}
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
            {showSettingsButton && (
             <button
               onClick={() => onSettingsClick && onSettingsClick(employee.id)}
               className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
               aria-label="设置"
             >
               <i class="fa-solid fa-cog"></i>
             </button>
           )}
        </div>
    </div>
  );
}