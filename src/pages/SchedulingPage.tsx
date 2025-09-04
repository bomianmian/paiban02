import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorksiteList } from '@/components/scheduling/WorksiteList';
import { EmployeeToolbar } from '@/components/scheduling/EmployeeToolbar';
import { Worksite, Employee, initialWorksites, initialEmployees } from '@/mocks/schedulingData';
import { PlusCircle } from 'lucide-react';
import { EmployeeSettingsModal } from '@/components/scheduling/EmployeeSettingsModal';
import { AddButton } from '@/components/scheduling/AddButton';
import { toast } from 'sonner';
/**
 * 工地排班主页面
 */
export default function SchedulingPage() {
  // 状态管理
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isEmployeeToolbarExpanded, setIsEmployeeToolbarExpanded] = useState(true);
  // 工地设置模态框状态
  const [isWorksiteSettingsModalOpen, setIsWorksiteSettingsModalOpen] = useState(false);
  const [selectedWorksite, setSelectedWorksite] = useState<Worksite | null>(null);
  
  // 跟踪所有已分配的员工ID
  const assignedEmployeeIds = useMemo(() => {
    const ids = new Set<string>();
    worksites.forEach(worksite => {
      worksite.scheduledEmployees.forEach(id => ids.add(id));
    });
    return ids;
  }, [worksites]);
  
  // API请求函数 - 获取工地信息
  const fetchWorksites = async () => {
    try {
      const response = await fetch('https://bomianmian.dpdns.org/');
      if (!response.ok) throw new Error('Failed to fetch worksites');
      
      const worksiteNames: string[] = await response.json();
      // 将工地名称转换为Worksite对象数组
      const newWorksites: Worksite[] = worksiteNames.map((name, index) => ({
        id: `w${Date.now()}-${index}`,
        name,
        scheduledEmployees: []
      }));
      
      setWorksites(newWorksites);
      localStorage.setItem('worksites', JSON.stringify(newWorksites));
      return newWorksites;
    } catch (error) {
      console.error('Error fetching worksites:', error);
      toast.error('获取工地信息失败，请刷新页面重试');
      return [];
    }
  };

  // API请求函数 - 获取员工信息
  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://bomianmianmian.dpdns.org/');
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const apiEmployees: any[] = await response.json();
      // 转换API返回的员工数据为应用所需格式
      const newEmployees: Employee[] = apiEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        isOnLeave: emp.isOnLeave === 'true', // 转换字符串为boolean
        avatarColor: emp.avatarColor || 'bg-blue-500',
        score: parseFloat(emp.score) || 0, // 转换字符串为number
        hasTool: emp.hasTool === 'true' // 转换字符串为boolean
      }));
      
      setEmployees(newEmployees);
      localStorage.setItem('employees', JSON.stringify(newEmployees));
      return newEmployees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('获取员工信息失败，请刷新页面重试');
      return [];
    }
  };

  // 从API获取数据或使用本地存储以及处理滚动事件
  useEffect(() => {
    const loadData = async () => {
      // 先尝试从API获取数据
      const [worksitesFromApi, employeesFromApi] = await Promise.all([
        fetchWorksites(),
        fetchEmployees()
      ]);
      
      // 如果API获取失败，尝试从本地存储加载
      if (worksitesFromApi.length === 0) {
        const savedWorksites = localStorage.getItem('worksites');
        if (savedWorksites) {
          setWorksites(JSON.parse(savedWorksites));
        }
      }
      
      if (employeesFromApi.length === 0) {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          setEmployees(JSON.parse(savedEmployees));
        }
      }
    };
    
    loadData();
    
    // 处理滚动事件以自动隐藏/显示标题
  const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  // 当滚动超过10px且向下滚动时隐藏标题，隐藏后不再自动显示
  if (currentScrollY > 10 && currentScrollY > lastScrollY.current) {
    setIsHeaderVisible(false);
  }
    
  lastScrollY.current = currentScrollY;
};
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 保存数据到本地存储
  useEffect(() => {
    if (worksites.length > 0) {
      localStorage.setItem('worksites', JSON.stringify(worksites));
    }
    if (employees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [worksites, employees]);
  
  // 切换员工休假状态
  const toggleEmployeeLeave = (employeeId: string) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, isOnLeave: !emp.isOnLeave } 
          : emp
      )
    );
  };
  
  // 添加员工到工地
  const addEmployeeToWorksite = (worksiteId: string, employeeId: string) => {
    setWorksites(prev => 
      prev.map(worksite => {
        // 如果是目标工地，添加员工
        if (worksite.id === worksiteId) {
          return { 
            ...worksite, 
            scheduledEmployees: [...worksite.scheduledEmployees, employeeId] 
          };
        }
        // 如果是其他工地且包含该员工，移除员工
        if (worksite.scheduledEmployees.includes(employeeId)) {
          return {
            ...worksite,
            scheduledEmployees: worksite.scheduledEmployees.filter(id => id !== employeeId)
          };
        }
        return worksite;
      })
    );
  };
  
  // 从工地移除员工
  const removeEmployeeFromWorksite = (worksiteId: string, employeeId: string) => {
    setWorksites(prev => 
      prev.map(worksite => 
        worksite.id === worksiteId 
          ? { 
              ...worksite, 
              scheduledEmployees: worksite.scheduledEmployees.filter(id => id !== employeeId) 
            } 
          : worksite
      )
    );
  };
  
  // 添加新工地
  const addNewWorksite = () => {
     const newWorksite: Worksite = {
      id: `w${Date.now()}`,
      name: `新工地${worksites.length + 1}`,
      scheduledEmployees: []
    };
    
    setWorksites([...worksites, newWorksite]);
  };
  
   // 打开新员工模态框
   const openNewEmployeeModal = () => {
     const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];
     const randomColor = colors[Math.floor(Math.random() * colors.length)];
     
     // 创建一个空的员工草稿
     const newEmployeeDraft: Employee = {
       id: `e${Date.now()}`,
       name: '',
        isOnLeave: false,
       avatarColor: randomColor,
       score: 5, // 默认5分
       hasTool: false
     };
     setSelectedEmployee(newEmployeeDraft);
     setIsNewEmployeeModalOpen(true);
   };
   
   // 保存新员工
   const saveNewEmployee = (newEmployee: Employee) => {
     setEmployees([...employees, newEmployee]);
     setIsNewEmployeeModalOpen(false);
   };
   
   // 添加新员工
   const addNewEmployee = () => {
     openNewEmployeeModal();
   };
  
  // 删除员工
  const deleteEmployee = (employeeId: string) => {
    // 从所有工地中移除该员工
    setWorksites(prev => 
      prev.map(worksite => ({
        ...worksite,
        scheduledEmployees: worksite.scheduledEmployees.filter(id => id !== employeeId)
      }))
    );
    
    // 从员工列表中移除
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };
  
   // 删除工地
   const deleteWorksite = (worksiteId: string) => {
     setWorksites(prev => prev.filter(worksite => worksite.id !== worksiteId));
   };
   
    // 导航到员工编辑页面
      const navigateToEmployeeEdit = (id: string) => {
  const employee = employees.find(emp => emp.id === id);
  setSelectedEmployee(employee || null);
  setIsSettingsModalOpen(true);
};

// 关闭新员工模态框
const closeNewEmployeeModal = () => {
  setIsNewEmployeeModalOpen(false);
  setSelectedEmployee(null);
};
   
   // 更新员工信息
   const updateEmployee = (updatedEmployee: Employee) => {
     setEmployees(prev => 
       prev.map(emp => 
         emp.id === updatedEmployee.id ? updatedEmployee : emp
       )
      );
    };

    // 打开工地设置模态框
    const openWorksiteSettingsModal = (worksite: Worksite) => {
      setSelectedWorksite(worksite);
      setIsWorksiteSettingsModalOpen(true);
    };

    // 关闭工地设置模态框
    const closeWorksiteSettingsModal = () => {
      setIsWorksiteSettingsModalOpen(false);
      setSelectedWorksite(null);
    };

    // 更新工地信息
    const updateWorksite = (updatedWorksite: Worksite) => {
      setWorksites(prev => 
        prev.map(worksite => 
          worksite.id === updatedWorksite.id ? updatedWorksite : worksite
        )
      );
      closeWorksiteSettingsModal();
    };

      // 处理完成按钮点击，提交排班数据到飞书多维格
     const handleComplete = async () => {
       try {
         // 格式化排班数据为API要求的格式
         const assignments = worksites.map(worksite => {
           const employeesInWorksite = worksite.scheduledEmployees
             .map(id => employees.find(e => e.id === id))
             .filter((emp): emp is Employee => !!emp);
             
           const employeeNames = employeesInWorksite.length > 0 
             ? employeesInWorksite.map(emp => emp.name).join(', ')
             : '未分配员工';
             
           return `${worksite.name}\t${employeeNames}`;
         });
         
         // 发送POST请求到API
          const response = await fetch('https://bomianmian8n.dpdns.org/', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ assignments }),
         });
         
         // 获取响应内容
         const responseData = await response.json();
         
         // 检查响应状态和数据
         if (!response.ok || !responseData.success) {
           const errorMessage = responseData.message || `提交失败，状态码: ${response.status}`;
           throw new Error(errorMessage);
         }
         
         // 显示成功提示并展示排班信息
         toast.success('排班数据已成功提交到飞书多维格');
         setShowScheduleInfo(true);
       } catch (error) {
        console.error('提交排班数据失败:', error);
        toast.error('提交排班数据失败，请重试');
      }
    };
    
     // 格式化排班信息为表格数据
     // 关闭排班信息表格
     const closeScheduleInfo = () => {
       setShowScheduleInfo(false);
     };
     
     // 格式化排班信息为表格数据
     const formatScheduleInfo = () => {
      return worksites.map(worksite => {
        const employeesInWorksite = worksite.scheduledEmployees
          .map(id => employees.find(e => e.id === id))
          .filter((emp): emp is Employee => !!emp);
          
        return {
          worksiteName: worksite.name,
          employees: employeesInWorksite
        };
      });
    };


    
    // 导入员工数据
    const handleImport = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedEmployees = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedEmployees)) {
              setEmployees(importedEmployees);
              localStorage.setItem('employees', JSON.stringify(importedEmployees));
              toast.success('员工数据导入成功');
            } else {
              toast.error('导入失败：无效的员工数据格式');
            }
          } catch (error) {
            toast.error('导入失败：文件解析错误');
            console.error('Error parsing imported employees:', error);
          }
        };
        reader.readAsText(file);
      };
      
      fileInput.click();
    };
   
  return (
     <div className="min-h-screen bg-gray-50 pt-16 pb-40">
        {/* 左上角悬浮的完成按钮 */}
        <button
          onClick={handleComplete}
          className="fixed top-4 left-4 w-12 h-12 p-3 shadow-lg bg-green-500 hover:bg-green-600 rounded-full z-30 flex items-center justify-center text-white"
          aria-label="完成排班"
        >
          <i class="fa-solid fa-check"></i>
        </button>

        {/* 右上角悬浮的新增工地按钮 */}
        <AddButton 
          onClick={addNewWorksite} 
          className="fixed top-4 right-4 w-12 h-12 p-3 shadow-lg bg-blue-500 hover:bg-blue-600 rounded-full z-30" 
        />

        {/* 顶部导航栏 - 滚动时自动隐藏 */}
        <header className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-20 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
           <div className="flex justify-center items-center px-4 py-3">
            <h1 className="text-xl font-bold text-gray-800">工地排班系统</h1>
          </div>
        </header>
       
        {/* 排班信息表格显示区域 */}
        {showScheduleInfo && (
          <div className="fixed top-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-20 max-h-[50vh] overflow-y-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工地名称</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formatScheduleInfo().map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 border-b text-sm text-gray-900">{item.worksiteName}</td>
                    <td className="py-2 px-4 border-b text-sm text-gray-500">
                      {item.employees.length > 0 ? (
                        item.employees.map(emp => emp.name).join(', ')
                      ) : (
                        <span className="text-gray-400 italic">未分配员工</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             <button 
               onClick={closeScheduleInfo}
               className="mt-4 text-sm text-blue-500 hover:text-blue-700"
             >
               关闭
            </button>
          </div>
        )}
       
       {/* 右上角悬浮的新增工地按钮 */}
         <AddButton 
           onClick={addNewWorksite} 
           className="fixed top-4 right-4 w-12 h-12 p-3 shadow-lg bg-blue-500 hover:bg-blue-600 rounded-full z-30" 
         />
       
       {/* 工地列表区域 */}
          <WorksiteList 
           worksites={worksites}
           employees={employees}
           onRemoveEmployee={removeEmployeeFromWorksite}
           onAddEmployee={addEmployeeToWorksite}
           onAddWorksite={addNewWorksite}
           onDeleteWorksite={deleteWorksite}
            onWorksiteSettings={(id) => {
              const worksite = worksites.find(w => w.id === id);
              if (worksite) openWorksiteSettingsModal(worksite);
            }}
       />
       
       {/* 底部员工工具栏 */}
         <EmployeeToolbar 
            employees={employees}
            onToggleLeave={toggleEmployeeLeave}
            onAddEmployee={openNewEmployeeModal}
            assignedEmployeeIds={assignedEmployeeIds}
            onDeleteEmployee={deleteEmployee}
            onSettingsClick={navigateToEmployeeEdit}
            isExpanded={isEmployeeToolbarExpanded}
            onToggleExpand={() => setIsEmployeeToolbarExpanded(!isEmployeeToolbarExpanded)}

         />

       {/* 员工信息设置模态框 */}
        {/* 编辑员工模态框 */}
        <EmployeeSettingsModal
          employee={selectedEmployee}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={updateEmployee}
          isNewEmployee={false}
        />
        
        {/* 新建员工模态框 */}
        <EmployeeSettingsModal
          employee={selectedEmployee}
          isOpen={isNewEmployeeModalOpen}
          onClose={closeNewEmployeeModal}
          onSave={saveNewEmployee}
          isNewEmployee={true}
        />
        
        {/* 工地设置模态框 */}
         <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isWorksiteSettingsModalOpen ? 'block' : 'hidden'}`}>
          {selectedWorksite && (
            <div 
              className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 模态框头部 */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-lg text-gray-800">工地信息设置</h3>
                <button 
                  onClick={closeWorksiteSettingsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
              
              {/* 模态框内容 */}
              <div className="p-4">
                <div className="space-y-4">
                  {/* 工地名称输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工地名称</label>
                    <input
                      type="text"
                      value={selectedWorksite.name}
                      onChange={(e) => setSelectedWorksite(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  
                </div>
              </div>
              
              {/* 模态框底部 */}
              <div className="flex justify-end p-4 border-t">
                <button
                  onClick={closeWorksiteSettingsModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => selectedWorksite && updateWorksite(selectedWorksite)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
   );
}