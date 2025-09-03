import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 size={32} className="text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">工地排班系统</h1>
        <p className="text-gray-600 mb-8">
          简单高效的移动端工地员工排班工具
        </p>
        
        <Link 
          to="/scheduling"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
        >
          开始使用
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        点击按钮进入排班页面
      </div>
    </div>
  );
}