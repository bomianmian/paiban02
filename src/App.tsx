import { Routes, Route, Navigate } from "react-router-dom";
import TargetCursor from "@/components/TargetCursor";
import Home from "@/pages/Home";
import SchedulingPage from "@/pages/SchedulingPage";
import EmployeeEditPage from "@/pages/EmployeeEditPage";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  // 检测屏幕尺寸变化，判断是否为移动设备
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkScreenSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize);
    
    // 清理函数
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      {/* 仅在非移动设备上加载TargetCursor */}
      {!isMobile && (
        <TargetCursor 
          targetSelector=".cursor-target" 
          spinDuration={2} 
          hideDefaultCursor={true} 
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/scheduling" replace />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/employee/edit/:id" element={<EmployeeEditPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </AuthContext.Provider>
  );
}
