import { Routes, Route, Navigate } from "react-router-dom";
import TargetCursor from "@/components/TargetCursor";
import Home from "@/pages/Home";
import SchedulingPage from "@/pages/SchedulingPage";
import EmployeeEditPage from "@/pages/EmployeeEditPage";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      {/* 在移动设备上禁用自定义光标 */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
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
