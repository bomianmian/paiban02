import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * 添加按钮组件 - 用于添加工地或员工
 */
export function AddButton({ onClick, className }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full bg-blue-500 text-white p-3 shadow-lg hover:bg-blue-600 transition-all duration-200 active:scale-95",
        className
      )}
      aria-label="添加"
    >
      <Plus size={24} />
    </button>
  );
}