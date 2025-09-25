import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

/**
 * 加载动画组件 - 显示圆形旋转加载指示器
 */
export function Loading({ 
  className = '', 
  size = 'medium', 
  text = '加载中...' 
}: LoadingProps) {
  // 根据尺寸设置不同的样式
  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return 'w-6 h-6 border-2 border-t-[#f9bc60]';
      case 'large':
        return 'w-12 h-12 border-4 border-t-[#f9bc60]';
      default: // medium
        return 'w-8 h-8 border-3 border-t-[#f9bc60]';
    }
  };
  
  const getTextClasses = () => {
    switch(size) {
      case 'small':
        return 'text-xs ml-2';
      case 'large':
        return 'text-lg ml-3';
      default: // medium
        return 'text-sm ml-2.5';
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-center",
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-gray-200",
        getSizeClasses()
      )}></div>
      {text && <span className={cn("text-gray-600", getTextClasses())}>{text}</span>}
    </div>
  );
}

/**
 * 全屏加载覆盖层组件
 */
export function FullScreenLoading({ 
  isVisible = false, 
  text = '加载中...' 
}: { 
  isVisible: boolean; 
  text?: string;
}) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#f9bc60] mb-4"></div>
        <p className="text-gray-700 text-lg">{text}</p>
      </div>
    </div>
  );
}