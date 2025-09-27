import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '@/mocks/schedulingData';
import { EmployeeCard } from './EmployeeCard';
import { AddButton } from './AddButton';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface EmployeeToolbarProps {
  employees: Employee[];
  onToggleLeave: (id: string) => void;
  onAddEmployee: () => void;
  assignedEmployeeIds: Set<string>;
  onDeleteEmployee: (id: string) => void;
  onSettingsClick?: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onImport: () => void;
  onExport: () => void;
  isMobile?: boolean;
  hasActiveWorksite?: boolean;
  onAddToActiveWorksite?: (employeeId: string) => void;
}

/**
 * 员工工具栏组件 - 底部显示所有员工卡片
 */
export function EmployeeToolbar({ 
  employees, 
  onToggleLeave, 
  onAddEmployee,
  assignedEmployeeIds,
  onDeleteEmployee,
  onSettingsClick,
  isExpanded,
  onToggleExpand,
  onImport,
  onExport
}: EmployeeToolbarProps) {
  // 过滤员工：只显示未分配的员工（包括请假员工）
  // 过滤并排序员工：未分配的员工中，未请假的排在前面，请假的排在后面
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(employee => !assignedEmployeeIds.has(employee.id))
      .sort((a, b) => {
        // 请假员工排在后面
        if (a.isOnLeave && !b.isOnLeave) return 1;
        if (!a.isOnLeave && b.isOnLeave) return -1;
        return 0;
      });
  }, [employees, assignedEmployeeIds]);

  const toggleExpand = () => {
    onToggleExpand();
  };
  return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#004643] p-3 z-50">
      {/* 工具栏标题 */}
  <div className="flex justify-between items-center mb-3 px-2">
    <div className="flex items-center space-x-4">
      <h2 className="text-lg font-semibold text-white">员工列表</h2>
    </div>
    <div className="flex items-center space-x-2">
        {isExpanded && <AddButton onClick={onAddEmployee} className="w-10 h-10" />}
      <button
        onClick={toggleExpand}
        className="flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
        aria-label={isExpanded ? "收起员工列表" : "展开员工列表"}
      >
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </div>
  </div>
      
  {/* 员工卡片横向滚动列表 - 带折叠功能 */}
  <div 
    className={`transition-all duration-300 ease-in-out overflow-hidden ${
      isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
     {/* 排序员工：未分配且未请假的员工排在前面，已分配或请假的排在后面 */}
     
         <div className="flex space-x-2 px-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => (
               <div key={employee.id} className="min-w-[80px]">
                 <EmployeeCard 
                   employee={employee}
                   onToggleLeave={onToggleLeave}
                   isDraggable={!employee.isOnLeave}
                    onDoubleClick={() => {
                      onSettingsClick && onSettingsClick(employee.id);
                    }}
                    onSettingsClick={() => onSettingsClick && onSettingsClick(employee.id)}
                      showSettingsButton={false}
                     showStatusButton={true}
                 />
              </div>
           ))
          ) : (
            <div className="text-center flex-1 py-4 text-gray-500 text-sm">
              没有可分配的员工
            </div>
          )}
       </div>
  </div>
      
      {/* 底部提示条 */}
  {/* 底部提示条 - 带折叠功能 */}
  <div 
    className={`transition-all duration-300 ease-in-out overflow-hidden ${
      isExpanded ? 'max-h-4 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
    }`}
  >
     <div className="text-center text-xs" style={{ color: '#abd1c6' }}>
  拖拽员工到工地卡片进行排班 | 点击员工状态切换休假
</div>
  </div>
    </div>
  );
}