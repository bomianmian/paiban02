import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee, initialEmployees } from '@/mocks/schedulingData';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

/**
 * 员工信息编辑页面 - 纵向排列表单
 */
export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    score: 0,
    isOnLeave: false,
    avatarColor: '',
    hasTool: false
  });

  // 从本地存储加载员工数据
  useEffect(() => {
    const loadEmployeeData = () => {
      try {
        const savedEmployees = localStorage.getItem('employees');
        const employees: Employee[] = savedEmployees 
          ? JSON.parse(savedEmployees) 
          : initialEmployees;
          
        const foundEmployee = employees.find(emp => emp.id === id);
        
        if (!foundEmployee) {
          setError('未找到员工信息');
          setIsLoading(false);
          return;
        }
        
        setEmployee(foundEmployee);
         setFormData({
          name: foundEmployee.name,
          score: foundEmployee.score,
          isOnLeave: foundEmployee.isOnLeave,
          avatarColor: foundEmployee.avatarColor,
          hasTool: foundEmployee.hasTool || false
        });
      } catch (err) {
        console.error('Failed to load employee data:', err);
        setError('加载员工信息失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEmployeeData();
  }, [id]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'score' ? parseFloat(value) : 
               name === 'avatarColor' ? value : value
    }));
  };

  // 保存员工信息
  const handleSave = () => {
    if (!employee) return;
    
    try {
      const savedEmployees = localStorage.getItem('employees');
      let employees: Employee[] = savedEmployees 
        ? JSON.parse(savedEmployees) 
        : initialEmployees;
      
      // 更新员工数据
      employees = employees.map(emp => 
        emp.id === employee.id 
          ? { 
               ...emp, 
               name: formData.name,
                score: formData.score,
               isOnLeave: formData.isOnLeave,
               avatarColor: formData.avatarColor,
               hasTool: formData.hasTool
             }
          : emp
      );
      
      // 保存到本地存储
      localStorage.setItem('employees', JSON.stringify(employees));
      
      // 返回排班页面
      navigate('/scheduling');
    } catch (err) { console.error('Failed to save employee data:', err);
      setError('保存员工信息失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">加载员工信息中...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">错误</h2>
          <p className="text-gray-600 mb-4">{error || '员工信息不存在'}</p>
          <button
            onClick={() => navigate('/scheduling')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回排班页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/scheduling')}
            className="text-gray-600 hover:text-gray-900 mr-4"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">编辑员工信息</h1>
        </div>
      </header>

      {/* 主要内容区 - 纵向排列表单 */}
      <main className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-sm mt-4 mb-8">
        {/* 员工头像预览 */}
        <div className="flex flex-col items-center mb-6 py-4">
           <div className="relative w-24 h-24 rounded-lg overflow-hidden border-4 border-gray-100 mb-3">
            {/* 头像背景 - 根据分数显示不同填充比例 */}
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
               <div 
                className={cn("absolute bottom-0 left-0 right-0 flex items-center justify-center", formData.avatarColor)}
                style={{ height: `${Math.min(10, Math.max(0, formData.score)) / 10 * 100}%` }}
              />
              <i className="fa-solid fa-user text-white text-4xl relative z-10"></i>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            头像颜色根据分数自动填充（当前：{formData.score}分）
          </div>
        </div>
        
        {/* 纵向排列的表单 */}
        <div className="space-y-6">
          {/* 姓名输入 */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          {/* 分数滑块 */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">评分</label>
              <span className="text-sm font-medium text-blue-600">{formData.score}分</span>
            </div>
            <input
              type="range"
              name="score"
              min="0"
              max="10"
              step="0.5"
              value={formData.score}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
         </div>
         
         {/* 头像颜色选择 */}
         <div className="flex flex-col space-y-2 mt-6">
           <label className="text-sm font-medium text-gray-700">头像颜色</label>
           <div className="flex space-x-2">
              {['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'].map(color => (
               <button
                 key={color}
                 onClick={() => setFormData(prev => ({...prev, avatarColor: color}))}
                 className={`w-8 h-8 rounded-full transition-transform ${
                   formData.avatarColor === color ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                 } ${color}`}
                 aria-label={`选择${color.split('-')[1]}色`}
               />
             ))}
              </div>
            </div>
            
            {/* 工具状态切换 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-6">
              <span className="text-sm text-gray-700">是否有工具</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hasTool"
                  checked={formData.hasTool}
                  onChange={(e) => setFormData(prev => ({...prev, hasTool: e.target.checked}))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {/* 休假状态切换 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">休假状态</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isOnLeave"
                  checked={formData.isOnLeave}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            保存员工信息
          </button>
        </div>
      </main>
    </div>
  );
}