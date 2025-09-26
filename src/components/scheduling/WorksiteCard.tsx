import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Worksite, Employee } from "@/mocks/schedulingData";
import { Building2, X } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";

interface WorksiteCardProps {
  worksite: Worksite;
  isSelected?: boolean;
  onSelect?: () => void;
  employees: Employee[];
  onRemoveEmployee: (worksiteId: string, employeeId: string) => void;
  onAddEmployee: (worksiteId: string, employeeId: string) => void;
  onDeleteWorksite: (worksiteId: string) => void;
  onSettingsClick?: (worksiteId: string) => void;
}

export function WorksiteCard(
    {
  worksite, 
  isSelected,
  onSelect,
  employees,
        onRemoveEmployee,
        onAddEmployee,
        onDeleteWorksite,
        onSettingsClick
    }: WorksiteCardProps
) {
    const [isOver, setIsOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const scheduledEmployees = worksite.scheduledEmployees.map(id => employees.find(emp => emp.id === id)).filter((emp): emp is Employee => !!emp);
  const [touchActive, setTouchActive] = useState(false);
  
  // 从工地名称提取面积（"平"之前的数字）
  const getMaxArea = (worksiteName: string) => {
    const match = worksiteName.match(/(\d+)平/);
    return match ? parseInt(match[1], 10) : 80;
  };
  const maxArea = getMaxArea(worksite.name);
  const currentArea = scheduledEmployees.reduce((sum, emp) => sum + (emp.score * 10), 0);
  const progressPercentage = (currentArea / maxArea) * 100;
  
  // 计算预估工资：面积×3.6÷人数
  const workerCount = scheduledEmployees.length;
  const estimatedWage = workerCount > 0 ? (maxArea * 3.6 / workerCount).toFixed(2) : '0.00';
  
  // 根据是否有员工获取不同颜色
  const getProgressColor = () => {
    if (progressPercentage >= 100) return "bg-[#004643]";
    if (worksite.scheduledEmployees.length > 0) return "bg-[#f9bc60]";
    return "bg-gray-300";
  };

  // 处理拖放区域检测
  const handleDragOver = (e: DragEvent | TouchEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  // 处理拖放离开
  const handleDragLeave = () => {
    setIsOver(false);
  };

  // 处理放置
  const handleDrop = (e: DragEvent | CustomEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    let employeeId = '';
    
    // 处理鼠标拖放
    if ('dataTransfer' in e) {
      employeeId = (e as DragEvent).dataTransfer.getData("text/plain");
    } 
    // 处理模拟的触摸拖放
    else if ('detail' in e) {
      employeeId = (e as CustomEvent).detail.employeeId;
    }

    if (employeeId && !worksite.scheduledEmployees.includes(employeeId)) {
      onAddEmployee(worksite.id, employeeId);
      
      // 显示成功提示
      const event = new CustomEvent('drop-success', {
        bubbles: true
      });
      if (dropZoneRef.current) {
        dropZoneRef.current.dispatchEvent(event);
      }
    }
  };

  // 处理触摸结束事件（用于检测拖放）
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchActive) return;
    
    handleDragLeave();
    setTouchActive(false);
  };

  // 检测触摸是否在拖放区域内
  const handleTouchMove = (e: TouchEvent) => {
    if (!dropZoneRef.current) return;
    
    const dropZone = dropZoneRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // 检查触摸点是否在拖放区域内
    const isTouchOver = (
      touch.clientX >= dropZone.left &&
      touch.clientX <= dropZone.right &&
      touch.clientY >= dropZone.top &&
      touch.clientY <= dropZone.bottom
    );
    
    // 为触摸设备添加视觉反馈
    if (isTouchOver && !isOver) {
      setIsOver(true);
      // 添加视觉反馈类
      dropZoneRef.current.classList.add('scale-[1.02]', 'shadow-md');
    } else if (!isTouchOver && isOver) {
      setIsOver(false);
      // 移除视觉反馈类
      dropZoneRef.current.classList.remove('scale-[1.02]', 'shadow-md');
    }
    
    setTouchActive(isTouchOver);
  };

  useEffect(() => {
    if (!dropZoneRef.current) return;

    const dropZone = dropZoneRef.current;
    
    // 设置工地ID属性，用于触摸事件识别
    dropZone.setAttribute('data-worksite-id', worksite.id);
    dropZone.classList.add('worksite-card');

    // 鼠标拖放事件
    dropZone.addEventListener("dragover", handleDragOver as (e: DragEvent) => void);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop as (e: DragEvent) => void);
    
    // 触摸事件支持
    dropZone.addEventListener("touchmove", handleTouchMove);
    dropZone.addEventListener("touchend", handleTouchEnd);
    dropZone.addEventListener("touchcancel", handleTouchEnd);
    
    // 监听自定义的模拟拖放事件
    document.addEventListener('simulated-drop', handleDrop as (e: CustomEvent) => void);

     return () => {
      dropZone.removeEventListener("dragover", handleDragOver as (e: DragEvent) => void);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop as (e: DragEvent) => void);
      dropZone.removeEventListener("touchmove", handleTouchMove);
      dropZone.removeEventListener("touchend", handleTouchEnd);
      dropZone.removeEventListener("touchcancel", handleTouchEnd);
      document.removeEventListener('simulated-drop', handleDrop as (e: CustomEvent) => void);
      
      // 清理视觉效果
      dropZone.classList.remove('scale-[1.02]', 'shadow-md');
    };
  }, [worksite.id, worksite.scheduledEmployees, onAddEmployee]);

    const removeEmployee = (employeeId: string) => {
        onRemoveEmployee(worksite.id, employeeId);
    };

    const toggleEmployeeLeave = (employeeId: string) => {
        console.log(`Toggle leave status for employee ${employeeId}`);
    };

    return (
     <div 
             ref={dropZoneRef}
        className={cn(
   "relative",
     "w-full h-auto min-h-[130px] bg-white rounded-none shadow-md py-0 px-4 flex flex-col items-center hover:shadow-lg transition-all duration-300 relative touch-manipulation",
       isOver ? "bg-blue-50 shadow-lg" : "",
       isSelected ? "ring-2 ring-blue-500 ring-offset-2 scale-102" : ""
             )}
        onClick={onSelect}
        >
            {/* 进度条背景 */}
             <div className="absolute inset-0 overflow-hidden rounded-none">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`}
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              ></div>
            </div>
            
             {/* 工地标题 - 居中显示 */}
            <div className="text-center mb-3 w-full relative z-10">
                    <div className="inline-flex items-center backdrop-blur-sm px-3 py-1.5 rounded-none">
                    <Building2 size={14} className="text-blue-500 mr-1.5 flex-shrink-0" />
              <h3 className={`font-medium text-sm ${progressPercentage >= 100 ? 'text-[#fffffe]' : 'text-gray-800'}`}>{worksite.name}</h3>
                </div>
            </div>
            
             {/* 右上角预估工资 - 调整位置避免与设置按钮重叠 */}
<div className="absolute top-2 right-[25px] bg-[#e16162] text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm z-20">
  ¥{estimatedWage}
            </div>
            
            {/* 员工卡片区域 - 位于标题下方 */}
             <div className="flex items-center justify-center space-x-1 overflow-x-hidden scrollbar-hide pb-2 w-full relative z-10">
                {scheduledEmployees.length > 0 ? scheduledEmployees.map(
                     employee => (
                        <div key={employee.id} className="bg-white/70 backdrop-blur-sm p-1 rounded-lg min-w-[34px] flex-shrink-0 border border-white/30">
                            <EmployeeCard
                                employee={employee}
                                onToggleLeave={toggleEmployeeLeave}
                                isDraggable={true}
                                showSettingsButton={false}
                                showStatusButton={false}
                                onDoubleClick={() => removeEmployee(employee.id)} />
                        </div>
                    )
                ) : <div className="text-center text-gray-600 text-sm whitespace-nowrap px-2 relative z-10">
                        未分配员工
                    </div>}
            </div>
            

            
            {/* 左下角设置按钮 */}
            <button
                onClick={() => onSettingsClick && onSettingsClick(worksite.id)}
                className="absolute bottom-2 left-2 text-gray-400 hover:text-blue-500 transition-colors p-2"
                aria-label="工地设置">
                <i className="fa-solid fa-cog"></i>
            </button>
            
            {/* 右下角删除按钮 */}
            <button
                onClick={() => {
                    if (window.confirm(`确定要删除工地"${worksite.name}"吗？删除后该工地的所有员工将被释放。`)) {
                        onDeleteWorksite(worksite.id);
                    }
                }}
                className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-2"
                aria-label="删除工地">
                <i className="fa-solid fa-trash-can"></i>
            </button>
        </div>
    );
}