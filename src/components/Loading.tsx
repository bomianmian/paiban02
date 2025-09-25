import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  text?: string;
}

/**
 * 加载动画组件 - 显示自定义加载动画
 */
export function Loading({ 
  className = '', 
  text = '加载中...' 
}: LoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      className
    )}>
      <div className="loader-wrapper mb-4">
        <div className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>
        
        <div id="loader2" className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>
        
        <div id="loader3" className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>
      </div>
      {text && <span className="text-gray-600 text-sm">{text}</span>}
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
      <div className="flex flex-col items-center">
        <div className="loader-wrapper">
          <div className="loader">
            <div className="roller"></div>
            <div className="roller"></div>
          </div>
          
          <div id="loader2" className="loader">
            <div className="roller"></div>
            <div className="roller"></div>
          </div>
          
          <div id="loader3" className="loader">
            <div className="roller"></div>
            <div className="roller"></div>
          </div>
        </div>
        <p className="text-white text-lg mt-6">{text}</p>
      </div>
    </div>
  );
}