import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Employee } from '@/mocks/schedulingData';

interface EmployeeSettingsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  isNewEmployee: boolean;
}

/**
 * 员工信息设置模态框 - 长按员工卡片时显示，用于修改员工分数
 */
export function EmployeeSettingsModal({
  employee,
  isOpen,
  onClose,
  onSave,
  isNewEmployee
}: EmployeeSettingsModalProps) {
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState('');
  const [hasTool, setHasTool] = useState(false);
  
  // 可用的头像颜色选项
  const avatarColorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500',
    'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'
  ];

  // 当员工数据变化或模态框打开时更新表单
  useEffect(() => {
    if (employee) {
      // 如果是新员工，重置表单
      if (isNewEmployee) {
        setScore(5); // 默认5分
        setName('');
        setHasTool(false);
      } else {
        // 如果是编辑现有员工，加载员工数据
         setScore(employee.score);
         setName(employee.name);
          setAvatarColor(employee.avatarColor);
          setHasTool(employee.hasTool);
       }
     }
   }, [employee, isOpen, isNewEmployee]);

  // 保存员工信息
  const handleSave = () => {
    if (!employee) return;
    
    // 验证必填字段
    if (!name.trim()) {
      alert('请输入员工姓名');
      return;
    }

     
  const updatedEmployee = {
    ...employee,
    score: Math.max(0, Math.min(10, score)), // 确保分数在0-10范围内
    name,
    avatarColor, // 添加头像颜色
    hasTool // 添加工具状态
  };
    
    onSave(updatedEmployee);
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
         <div className="flex justify-between items-center p-4 border-b">
           <h3 className="font-semibold text-lg text-gray-800">{isNewEmployee ? '新建员工信息' : '员工信息设置'}</h3>
           <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        {/* 模态框内容 */}
        <div className="p-4">
          {/* 员工头像预览 */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-4 border-gray-100 mb-3">
  {/* 头像背景 - 根据分数显示不同填充比例，从下往上填充 */}
  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div 
          className={cn("absolute bottom-0 left-0 right-0 flex items-center justify-center", avatarColor)}
          style={{ height: `${Math.min(10, Math.max(0, score)) / 10 * 100}%` }}
    />
    <i class="fa-solid fa-user text-white text-4xl relative z-10"></i>
  </div>
            </div>
            <div className="text-sm text-gray-500">
              头像颜色根据分数自动填充（当前：{score}分）
            </div>
          </div>
          
          {/* 员工信息表单 */}
          <div className="space-y-4">
            {/* 姓名输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            
            {/* 分数滑块 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">评分</label>
                <span className="text-sm font-medium text-blue-600">{score}分</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
             </div>
             
             {/* 头像颜色选择 */}
             <div className="mt-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">头像颜色</label>
               <div className="flex space-x-2">
                 {avatarColorOptions.map(color => (
                   <button
                     key={color}
                     onClick={() => setAvatarColor(color)}
                     className={`w-8 h-8 rounded-full transition-transform ${
                       avatarColor === color ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                     } ${color}`}
                     aria-label={`选择${color.split('-')[1]}色`}
                   />
                 ))}
               </div>
              </div>
            </div>
            
            {/* 工具状态切换 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-4">
              <span className="text-sm text-gray-700">是否有工具</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTool}
                  onChange={(e) => setHasTool(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {/* 休假状态显示 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">休假状态</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                employee.isOnLeave 
                  ? 'bg-gray-200 text-gray-600' 
                  : 'bg-green-100 text-green-600'
              }`}>
                {employee.isOnLeave ? '休假中' : '工作中'}
              </span>
            </div>
          </div>
        </div>
        
        {/* 模态框底部 */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}